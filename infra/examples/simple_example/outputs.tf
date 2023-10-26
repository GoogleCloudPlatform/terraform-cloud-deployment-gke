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

output "bucket_name" {
  description = "Bucket name"
  value       = module.simple.bucket_name
}

output "cluster_name" {
  description = "Cluster info"
  value       = module.simple.cluster_info.name
}

output "cluster_location" {
  description = "Cluster info"
  value       = module.simple.cluster_info.location
}

output "cluster_namespace" {
  description = "Cluster namespace"
  value       = module.simple.cluster_info.namespace
}

output "load_balancer_name" {
  description = "Name of the load balancer"
  value       = module.simple.load_balancer_name
}

output "backend_service_name" {
  description = "Name of the backend service"
  value       = module.simple.backend_service_name
}

output "db_name" {
  description = "The Firestore database name"
  value       = module.simple.db_name
}
