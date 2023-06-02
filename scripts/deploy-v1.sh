#!/bin/bash

# GKE cluster configs
PROJECT_ID="$(gcloud config get-value project | tail -1)"
GCR_PROJECT_ID="aemon-projects-dev-000"
CLUSTER_NAME="cloud-deployment-gke"
REGION="us-west1"

# Deployment configs
NAMESPACE="cloud-deployment"
DEPLOYMENT="${PROJECT_ID}-lds-deployment-us-west1"
BACKEND_CONTAINER_NAME="${PROJECT_ID}-lds-server-${REGION}"
FRONTEND_CONTAINER_NAME="${PROJECT_ID}-lds-client-${REGION}"
BACKEND_CONTAINER="gcr.io/${GCR_PROJECT_ID}/jss-cd-gke-backend:latest"
FRONTEND_CONTAINER="gcr.io/${GCR_PROJECT_ID}/jss-cd-gke-frontend:blue"

# Get Cloud Load Balancer configs
FORWARDING_RULE_NAME="cloud-deployment-app-java"
FORWARDING_RULE_IP="$(gcloud compute forwarding-rules list --filter="${FORWARDING_RULE_NAME}" --format="value(IP_ADDRESS)")"

# Procedure to deploy V2 rolling update  
gcloud container clusters get-credentials ${CLUSTER_NAME} --region ${REGION} 
kubectl set image deployment ${DEPLOYMENT} ${BACKEND_CONTAINER_NAME}=${BACKEND_CONTAINER} ${FRONTEND_CONTAINER_NAME}=${FRONTEND_CONTAINER} -n ${NAMESPACE}

# Ouput message for successful deployment
echo -e "\n--------------------------------------------------------- "  
echo "V1 version was deployed successfully!
access the web UI home page through the external load balancer IP: ${FORWARDING_RULE_IP}"
echo -e "---------------------------------------------------------\n"  
