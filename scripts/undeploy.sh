#!/bin/bash

# GKE cluster configs
PROJECT_ID="$(gcloud config get-value project | tail -1)"
ZONE="us-west1-a"

helm delete job
helm delete lds

GCP_NEG="$(gcloud compute network-endpoint-groups describe cloud-deployment-gke-golang \
    --project=${PROJECT_ID} \
    --zone=${ZONE} \
    --format="value(name)")"

gcloud compute backend-services remove-backend cloud-deployment-gke-golang \
    --project=${PROJECT_ID} \
    --global \
    --network-endpoint-group=${GCP_NEG} \
    --network-endpoint-group-zone=${ZONE}
