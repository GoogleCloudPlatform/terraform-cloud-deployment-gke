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
CD_BUCKET="cloud-deployment-gke-golang-resource-${PROJECT_NUMBER}"
CD_RESOURCE_PATH="/resource"
CD_FIRESTORE="fileMetadata-cdn-gke-golang"
CD_FIRESTORE_DATABASE=$(gcloud firestore databases list \
  --format="value(name)" \
  --filter="name:cloud-deployment" \
  --limit=1 \
  --sort-by=~creationTimestamp \
  | awk -F/ '{print $NF}')

CD_SERVER_IMAGE="gcr.io/${GCR_PROJECT_ID}/jss-cd-gke-backend:multi-firestore"
CD_CLIENT_IMAGE="gcr.io/${GCR_PROJECT_ID}/jss-cd-gke-frontend:green"

# Procedure to deploy V2 rolling update
gcloud container clusters get-credentials "${CLUSTER_NAME}" --region "${REGION}"

# helm deploy
helm upgrade \
    --set cd_server_image="${CD_SERVER_IMAGE}" \
    --set cd_client_image="${CD_CLIENT_IMAGE}" \
    --set namespace="${NAMESPACE}" \
    --set project_id="${PROJECT_ID}" \
    --set region="${REGION}" \
    --set k8s_service_account_name="${K8S_SERVICE_ACCOUNT_NAME}" \
    --set config_maps.cd_bucket="${CD_BUCKET}" \
    --set config_maps.cd_resource_path="${CD_RESOURCE_PATH}" \
    --set config_maps.cd_firestore="${CD_FIRESTORE}" \
    --set config_maps.cd_firestore_database="${CD_FIRESTORE_DATABASE}" \
    cd ../infra/config/helm/cd

# Ouput message for successful deployment
echo -e "\n--------------------------------------------------------- "
# Get Cloud Load Balancer configs
FORWARDING_RULE_NAME="cloud-deployment-gke-golang"
FORWARDING_RULE_IP="$(gcloud compute forwarding-rules list --filter="${FORWARDING_RULE_NAME}" --format="value(IP_ADDRESS)")"
kubectl rollout status deployment "${PROJECT_ID}"-cd-deployment-"${REGION}" -n "${NAMESPACE}"
echo -e "V2 version was deployed successfully!\nRefresh the home page to observe v1 is replaced by V2 load balancer ip: ${FORWARDING_RULE_IP}"
echo -e "---------------------------------------------------------\n"


