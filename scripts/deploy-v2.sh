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
GCR_PROJECT_ID="aemon-projects-dev-000"
CLUSTER_NAME="cloud-deployment-gke-golang"
REGION="us-west1"

# Deployment configs
NAMESPACE="cloud-deployment"
DEPLOYMENT="${PROJECT_ID}-lds-deployment-${REGION}"
BACKEND_CONTAINER_NAME="${PROJECT_ID}-lds-server-${REGION}"
FRONTEND_CONTAINER_NAME="${PROJECT_ID}-lds-client-${REGION}"
BACKEND_CONTAINER="gcr.io/${GCR_PROJECT_ID}/jss-cd-gke-backend:latest"
FRONTEND_CONTAINER="gcr.io/${GCR_PROJECT_ID}/jss-cd-gke-frontend:green"

# Get Cloud Load Balancer configs
FORWARDING_RULE_NAME="cloud-deployment-gke-golang"
FORWARDING_RULE_IP="$(gcloud compute forwarding-rules list --filter="${FORWARDING_RULE_NAME}" --format="value(IP_ADDRESS)")"

# Procedure to deploy V2 rolling update  
gcloud container clusters get-credentials ${CLUSTER_NAME} --region ${REGION} 
kubectl set image deployment ${DEPLOYMENT} ${BACKEND_CONTAINER_NAME}=${BACKEND_CONTAINER} ${FRONTEND_CONTAINER_NAME}=${FRONTEND_CONTAINER} -n ${NAMESPACE}

# Ouput message for successful deployment
echo -e "\n--------------------------------------------------------- "  
echo "V2 version was deployed successfully!
refresh the home page to observe v1 is replaced by V2 load balancer ip: ${FORWARDING_RULE_IP}"
echo -e "---------------------------------------------------------\n"  

# Check pod rolling update status
TIMES=1
while [ $TIMES -le 30 ]
do
    kubectl get pods -n ${NAMESPACE}
    sleep 0.5	
    (( TIMES++ )) 
done 

