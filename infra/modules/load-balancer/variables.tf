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
}

variable "bucket_name" {
  description = "Bucket name"
  type        = string
}

variable "resource_path" {
  description = "Resource folder path"
  type        = string
}

variable "labels" {
  description = "A map of key/value label pairs to assign to the bucket."
  type        = map(string)
}

variable "health_check_allow_ports" {
  description = "The ports to allow for health check."
  type        = list(number)
}
