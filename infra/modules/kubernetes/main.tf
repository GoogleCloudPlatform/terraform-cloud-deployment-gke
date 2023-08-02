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

resource "google_container_cluster" "control_plane" {
  name             = var.cluster_name
  location         = var.region
  node_locations   = var.zones
  network          = var.network_self_link
  networking_mode  = "VPC_NATIVE"
  enable_autopilot = true
  ip_allocation_policy {
  }
  resource_labels = var.labels
}

resource "google_service_account" "gcp" {
  account_id  = var.gcp_service_account_id
  description = "This sa is created by terraform and being used to bind k8s sa"
}

resource "google_project_iam_member" "gcp" {
  for_each = toset(var.gcp_service_account_iam_roles)

  project = var.project_id
  role    = each.key
  member  = "serviceAccount:${google_service_account.gcp.email}"
}

resource "google_service_account_iam_binding" "k8s" {
  for_each = toset([
    "roles/iam.workloadIdentityUser",
  ])
  service_account_id = google_service_account.gcp.name
  role               = each.value

  members = [
    "serviceAccount:${google_container_cluster.control_plane.workload_identity_config[0].workload_pool}[${var.k8s_namespace_name}/${var.k8s_service_account_name}]"
  ]
}
