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

output "lb_external_ip" {
  description = "Frontend IP address of the load balancer"
  value       = google_compute_global_forwarding_rule.cloud_deployment.ip_address
}

output "backend_bucket_name" {
  description = "The name of the backend bucket used for Cloud CDN"
  value       = google_compute_backend_bucket.cdn.name
}

output "load_balancer_name" {
  description = "The name of the load balancer"
  value       = google_compute_url_map.cloud_deployment.name
}

output "backend_service_name" {
  description = "The name of the backend_service"
  value       = google_compute_global_forwarding_rule.cloud_deployment.name
}
