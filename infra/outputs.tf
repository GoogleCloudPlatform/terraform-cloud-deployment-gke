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

output "namespace" {
  description = "kubernetes namespace"
  value       = local.namespace
}

output "gcp_service_account_email" {
  description = "GCP service account email"
  value       = module.kubernetes.gcp_service_account_email
}

output "k8s_service_account_name" {
  description = "Kubernetes service account name"
  value       = local.k8s_service_account_name
}

output "bucket_name" {
  description = "Bucket name"
  value       = module.storage.bucket_name
}

output "lds_resource_path" {
  description = "Resource path"
  value       = "/${local.resource_path}"
}

output "lds_firestore" {
  description = "Firestore resource path"
  value       = local.lds_firestore
}

output "lb_external_ip" {
  description = "Frontend IP address of the load balancer"
  value       = module.load_balancer.lb_external_ip
}

output "backend_bucket_name" {
  description = "The name of the backend bucket used for Cloud CDN"
  value       = module.load_balancer.backend_bucket_name
}

output "load_balancer_name" {
  description = "Name of the load balancer"
  value       = module.load_balancer.load_balancer_name
}

output "backend_service_name" {
  description = "Name of the backend service"
  value       = module.load_balancer.backend_service_name
}

output "cluster_info" {
  description = "The cluster information"
  value       = module.kubernetes.cluster_info
}
