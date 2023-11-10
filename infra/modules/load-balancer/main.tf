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

resource "google_compute_backend_bucket" "cdn" {
  project     = var.project_id
  name        = "cloud-deployment-gke-golang-cdn"
  bucket_name = var.bucket_name
  enable_cdn  = true
  cdn_policy {
    cache_mode        = "CACHE_ALL_STATIC"
    client_ttl        = 3600
    default_ttl       = 3600
    max_ttl           = 86400
    negative_caching  = true
    serve_while_stale = 86400
  }
  custom_response_headers = [
    "X-Cache-ID: {cdn_cache_id}",
    "X-Cache-Hit: {cdn_cache_status}",
    "X-Client-Location: {client_region_subdivision}, {client_city}",
    "X-Client-IP-Address: {client_ip_address}"
  ]
}

resource "google_compute_health_check" "cloud_deployment" {
  project = var.project_id
  name    = "cloud-deployment-gke-golang-health"
  http_health_check {
    port_specification = "USE_SERVING_PORT"
  }
}

resource "google_compute_firewall" "cloud_deployment" {
  name      = "cloud-deployment-gke-golang-allow-health-check"
  network   = "default"
  direction = "INGRESS"
  source_ranges = [
    "130.211.0.0/22", //health check ip
    "35.191.0.0/16"   //health check ip
  ]
  allow {
    protocol = "tcp"
    ports    = var.health_check_allow_ports
  }
}

resource "google_compute_backend_service" "cloud_deployment" {
  project               = var.project_id
  name                  = "cloud-deployment-gke-golang-srv"
  load_balancing_scheme = "EXTERNAL"
  health_checks = [
    google_compute_health_check.cloud_deployment.self_link,
  ]
}

resource "google_compute_url_map" "cloud_deployment" {
  project         = var.project_id
  name            = "cloud-deployment-gke-golang-lb"
  default_service = google_compute_backend_service.cloud_deployment.id
  host_rule {
    path_matcher = "app"
    hosts = [
      "*",
    ]
  }
  path_matcher {
    name            = "app"
    default_service = google_compute_backend_service.cloud_deployment.id
    path_rule {
      paths = [
        "/${var.resource_path}/*",
      ]
      service = google_compute_backend_bucket.cdn.id
    }
  }
}

resource "google_compute_target_http_proxy" "cloud_deployment" {
  project = var.project_id
  name    = "cloud-deployment-gke-golang-cthp"
  url_map = google_compute_url_map.cloud_deployment.self_link
}

resource "google_compute_global_forwarding_rule" "cloud_deployment" {
  project    = var.project_id
  labels     = var.labels
  name       = "cloud-deployment-gke-golang-fr"
  target     = google_compute_target_http_proxy.cloud_deployment.self_link
  ip_address = google_compute_global_address.cloud_deployment.address
  port_range = "80"
}

resource "google_compute_global_address" "cloud_deployment" {
  project      = var.project_id
  name         = "cloud-deployment-gke-golang-ga"
  ip_version   = "IPV4"
  address_type = "EXTERNAL"
}
