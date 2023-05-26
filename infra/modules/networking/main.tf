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

resource "google_compute_network" "primary" {
  name                    = "cloud-deployment-java"
  project                 = var.project_id
  auto_create_subnetworks = true
}

resource "google_compute_firewall" "cloud_deployment" {
  name      = "cloud-deployment-health-check"
  network   = google_compute_network.primary.name
  direction = "INGRESS"
  source_ranges = [
    "130.211.0.0/22", //health check ip
    "35.191.0.0/16"   //health check ip
  ]
  allow {
    protocol = "tcp"
    ports    = ["80"]
  }
}
