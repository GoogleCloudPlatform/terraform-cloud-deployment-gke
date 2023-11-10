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
ZONE="us-west1-a"

# helm delete
helm delete job
helm delete cd

GOOGLE_CLOUD_NEG="$(gcloud compute network-endpoint-groups describe cloud-deployment-gke-golang-neg \
    --project="${PROJECT_ID}" \
    --zone="${ZONE}" \
    --format="value(name)")"

gcloud compute backend-services remove-backend cloud-deployment-gke-golang-srv \
    --project="${PROJECT_ID}" \
    --global \
    --network-endpoint-group="${GOOGLE_CLOUD_NEG}" \
    --network-endpoint-group-zone="${ZONE}"
