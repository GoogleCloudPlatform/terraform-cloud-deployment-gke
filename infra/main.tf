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

module "project_services" {
  source  = "terraform-google-modules/project-factory/google//modules/project_services"
  version = "~> 14.0"

  disable_services_on_destroy = var.disable_services_on_destroy
  project_id                  = var.project_id
  activate_apis = [
    "compute.googleapis.com",
    "iam.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "firestore.googleapis.com",
    "monitoring.googleapis.com",
    "cloudtrace.googleapis.com",
    "container.googleapis.com",
    "storage.googleapis.com",
  ]
}

data "google_project" "project" {
  depends_on = [
    module.project_services
  ]

  project_id = var.project_id
}

data "google_client_config" "default" {
  depends_on = [
    module.project_services
  ]
}

locals {
  resource_path = "resource"
  collection_fields = {
    "${var.firestore_collection_id}-golang" = [
      {
        field_path   = "tags"
        array_config = "CONTAINS"
      },
      {
        field_path = "orderNo"
        order      = "DESCENDING"
      },
    ]
  }
  lds_firestore            = [for key, value in local.collection_fields : key][0]
  namespace                = "cloud-deployment"
  k8s_service_account_name = "cloud-deployment"
  base_entries = [
    {
      name  = "namespace"
      value = local.namespace
    },
    {
      name  = "k8s_service_account_name"
      value = local.k8s_service_account_name
    },
    {
      name  = "project_id"
      value = data.google_project.project.project_id
    },
    {
      name  = "region"
      value = var.region
    },
  ]
}

module "storage" {
  source = "./modules/storage"

  project_id = data.google_project.project.project_id
  location   = var.bucket_location
  labels     = var.labels
  name       = "cloud-deployment-gke-golang-resource-${data.google_project.project.number}"
}

module "networking" {
  source = "./modules/networking"

  project_id = data.google_project.project.project_id
  health_check_allow_ports = [
    80,
  ]
}

module "firestore" {
  source = "./modules/firestore"

  project_id        = data.google_project.project.project_id
  init              = var.init
  collection_fields = local.collection_fields
}

module "kubernetes" {
  depends_on = [
    module.project_services,
  ]
  source = "./modules/kubernetes"

  cluster_name           = "cloud-deployment-gke-golang"
  region                 = var.region
  zones                  = var.zones
  network_self_link      = module.networking.vpc_network_self_link
  project_id             = data.google_project.project.project_id
  google_cloud_service_account_id = "cloud-deployment-gke-golang"
  google_cloud_service_account_iam_roles = [
    "roles/storage.objectAdmin",
    "roles/datastore.user",
    "roles/compute.networkUser",
    "roles/cloudtrace.agent",
  ]
  k8s_namespace_name       = local.namespace
  k8s_service_account_name = local.k8s_service_account_name
  labels                   = var.labels
}

module "base_helm" {
  source = "./modules/helm"

  chart_folder_name = "base"
  entries = concat(local.base_entries,
    [
      {
        name  = "google_cloud_service_account_email"
        value = module.kubernetes.google_cloud_service_account_email
      },
    ]
  )
}

module "load_balancer" {
  source = "./modules/load-balancer"

  project_id    = data.google_project.project.project_id
  bucket_name   = module.storage.bucket_name
  resource_path = local.resource_path
  labels        = var.labels
}
