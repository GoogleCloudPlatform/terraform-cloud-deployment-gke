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

variable "chart_folder_name" {
  description = "The signified folder's name in chars folder"
  type        = string
}

variable "entries" {
  description = "custom values to be merge into values yaml."
  type = list(object({
    name  = string
    value = string
  }))
  default = []
}

variable "namespace" {
  description = "Kubernetes namespace for the helm chart"
  type        = string
}

variable "secret_entries" {
  description = "custom sensitive values to be merged into values yaml. it would not be exposed in the terraform plan's diff."
  type = list(object({
    name  = string
    value = string
  }))
  default = []
}
