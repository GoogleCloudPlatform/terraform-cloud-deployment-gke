#!/bin/bash

# Copyright 2023 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# GKE cluster configs
PROJECT_ID="$(gcloud config get-value project | tail -1)"
PROJECT_NUMBER=$(gcloud projects list --filter PROJECT_ID="${PROJECT_ID}" --format="value(projectNumber)")
CLUSTER_NAME="cloud-deployment-gke-golang"
REGION="us-west1"
ZONE="us-west1-a"

# Deployment configs
NAMESPACE="cloud-deployment"
K8S_SERVICE_ACCOUNT_NAME="cloud-deployment"
LDS_BUCKET="cloud-deployment-gke-golang-resource-${PROJECT_NUMBER}"
LDS_RESOURCE_PATH="/resource"
LDS_FIRESTORE="fileMetadata-cdn-gke-golang"

# Procedure to deploy v1
gcloud container clusters get-credentials "${CLUSTER_NAME}" --region "${REGION}"

# helm deploy
helm install \
    --set namespace="${NAMESPACE}" \
    --set project_id="${PROJECT_ID}" \
    --set region="${REGION}" \
    --set k8s_service_account_name="${K8S_SERVICE_ACCOUNT_NAME}" \
    --set config_maps.lds_bucket="${LDS_BUCKET}" \
    --set config_maps.lds_resource_path="${LDS_RESOURCE_PATH}" \
    --set config_maps.lds_firestore="${LDS_FIRESTORE}" \
    lds ../infra/config/helm/lds
echo -e "\n--------------------------------------------------------- "

helm install \
    --set namespace="${NAMESPACE}" \
    --set project_id="${PROJECT_ID}" \
    --set region="${REGION}" \
    --set k8s_service_account_name="${K8S_SERVICE_ACCOUNT_NAME}" \
    job ../infra/config/helm/job
echo -e "\n--------------------------------------------------------- "

# Procedure to connect k8s pod to loadbalancer
GOOGLE_CLOUD_NEG="$(gcloud compute network-endpoint-groups describe cloud-deployment-gke-golang \
    --project="${PROJECT_ID}" \
    --zone="${ZONE}" \
    --format="value(name)")"

gcloud compute backend-services add-backend cloud-deployment-gke-golang \
    --project="${PROJECT_ID}" \
    --global \
    --network-endpoint-group="${GOOGLE_CLOUD_NEG}" \
    --network-endpoint-group-zone="${ZONE}" \
    --balancing-mode=RATE \
    --max-rate-per-endpoint=10

# Ouput message for successful deployment
echo -e "\n--------------------------------------------------------- "
# Get Cloud Load Balancer configs
FORWARDING_RULE_NAME="cloud-deployment-gke-golang"
FORWARDING_RULE_IP="$(gcloud compute forwarding-rules list --filter="${FORWARDING_RULE_NAME}" --format="value(IP_ADDRESS)")"
echo "V1 version was deployed successfully!
access the web UI home page through the external load balancer IP: http://${FORWARDING_RULE_IP}/"
echo -e "---------------------------------------------------------\n"
