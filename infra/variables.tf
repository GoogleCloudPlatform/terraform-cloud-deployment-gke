/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

variable "project_id" {
  description = "Google Cloud project ID."
  type        = string
  validation {
    condition     = var.project_id != ""
    error_message = "Error: project_id is required"
  }
}

variable "region" {
  description = "Google cloud region where the resource will be created."
  type        = string
  default     = "us-west1"
}

variable "zone" {
  description = "Google cloud zone where the resources will be created."
  type        = string
  default     = "us-west1-a"
}

variable "disable_services_on_destroy" {
  description = "Whether project services will be disabled when the resources are destroyed."
  type        = bool
  default     = false
}

variable "bucket_location" {
  description = "Bucket location. https://cloud.google.com/storage/docs/locations"
  type        = string
  default     = "US"

  validation {
    condition     = contains(["ASIA", "EU", "US"], var.bucket_location)
    error_message = "Allowed values for type are \"ASIA\", \"EU\", \"US\"."
  }
}

variable "labels" {
  type        = map(string)
  description = "A map of key/value label pairs to assign to the resources."
  default = {
    app = "cloud-deployment-gke-golang"
  }
}

variable "firestore_collection_id" {
  description = "Firestore collection id"
  type        = string
  default     = "fileMetadata-cdn-gke"
}


