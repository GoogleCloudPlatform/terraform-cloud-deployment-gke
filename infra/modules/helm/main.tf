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

locals {
  helm_release_name = replace(var.chart_folder_name, "/", "-")
  default_entries = [
    {
      name  = "operator"
      value = "terraform-helm-${substr(uuid(), 0, 4)}"
    },
  ]
}

resource "random_id" "code" {
  byte_length = 4
}

resource "helm_release" "manifest" {
  name  = "${local.helm_release_name}-${var.region}-${random_id.code.hex}"
  chart = "${path.module}/../../config/helm/${var.chart_folder_name}"
  values = [
    file("${path.module}/../../config/helm/${var.chart_folder_name}/values.yaml"),
  ]
  dynamic "set" {
    for_each = var.entries == null ? local.default_entries : concat(local.default_entries, var.entries)
    iterator = entry
    content {
      name  = entry.value.name
      value = entry.value.value
    }
  }
  dynamic "set_sensitive" {
    for_each = var.secret_entries == null ? [] : var.secret_entries
    iterator = secret_entry
    content {
      name  = secret_entry.value.name
      value = secret_entry.value.value
    }
  }
}
