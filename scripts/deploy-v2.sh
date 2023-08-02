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
GCR_PROJECT_ID="hsa-public"
CLUSTER_NAME="cloud-deployment-gke-golang"
REGION="us-west1"

# Deployment configs
NAMESPACE="cloud-deployment"
K8S_SERVICE_ACCOUNT_NAME="cloud-deployment"
LDS_BUCKET="cloud-deployment-gke-golang-resource-${PROJECT_NUMBER}"
LDS_RESOURCE_PATH="/resource"
LDS_FIRESTORE="fileMetadata-cdn-gke-golang"
LDS_SERVER_IMAGE="gcr.io/${GCR_PROJECT_ID}/jss-cd-gke-backend:latest"
LDS_CLIENT_IMAGE="gcr.io/${GCR_PROJECT_ID}/jss-cd-gke-frontend:green"

# Procedure to deploy V2 rolling update
gcloud container clusters get-credentials "${CLUSTER_NAME}" --region "${REGION}"

# helm deploy
helm upgrade \
    --set lds_server_image="${LDS_SERVER_IMAGE}" \
    --set lds_client_image="${LDS_CLIENT_IMAGE}" \
    --set namespace="${NAMESPACE}" \
    --set project_id="${PROJECT_ID}" \
    --set region="${REGION}" \
    --set k8s_service_account_name="${K8S_SERVICE_ACCOUNT_NAME}" \
    --set config_maps.lds_bucket="${LDS_BUCKET}" \
    --set config_maps.lds_resource_path="${LDS_RESOURCE_PATH}" \
    --set config_maps.lds_firestore="${LDS_FIRESTORE}" \
    lds ../infra/config/helm/lds

# Ouput message for successful deployment
echo -e "\n--------------------------------------------------------- "
# Get Cloud Load Balancer configs
FORWARDING_RULE_NAME="cloud-deployment-gke-golang"
FORWARDING_RULE_IP="$(gcloud compute forwarding-rules list --filter="${FORWARDING_RULE_NAME}" --format="value(IP_ADDRESS)")"
echo "V2 version was deployed successfully!
refresh the home page to observe v1 is replaced by V2 load balancer ip: ${FORWARDING_RULE_IP}"
echo -e "---------------------------------------------------------\n"

# Check pod rolling update status
TIMES=1
while [ "$TIMES" -le 30 ]
do
    kubectl get pods -n "${NAMESPACE}"
    sleep 0.5
    (( TIMES++ ))
done
