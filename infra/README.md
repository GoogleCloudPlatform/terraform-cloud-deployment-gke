# Large data sharing Java web app

## Description

### Tagline
Create a web app to share large quantities of files to users across the globe

### Detailed
This solution quickly and securely deploys a three-tierd web app with a Javascript front end, a Java back end, and a Firestore database on GCP. The goal of this solution is to utilize Google's Cloud CDN to serve large quantities of files (e.g., images, videos, documents) to users across the globe.

The resources/services/activations/deletions that this module will create/trigger are:
- Cloud Load Balancing
- Cloud Storage
- Cloud CDN
- Cloud Run
- Firestore

<!-- BEGINNING OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| bucket\_location | Bucket location. https://cloud.google.com/storage/docs/locations | `string` | `"US"` | no |
| disable\_services\_on\_destroy | Whether project services will be disabled when the resources are destroyed. | `bool` | `false` | no |
| firestore\_collection\_id | Firestore collection id | `string` | `"fileMetadata-cdn-gke"` | no |
| init | Initialize resource or not | `bool` | `true` | no |
| labels | A map of key/value label pairs to assign to the resources. | `map(string)` | <pre>{<br>  "app": "cloud-deployment-gke-golang"<br>}</pre> | no |
| project\_id | GCP project ID. | `string` | n/a | yes |
| region | Google cloud region where the resource will be created. | `string` | `"us-west1"` | no |
| zones | Google cloud zones where the resource will be created. | `list(string)` | <pre>[<br>  "us-west1-a"<br>]</pre> | no |

## Outputs

| Name | Description |
|------|-------------|
| backend\_bucket\_name | The name of the backend bucket used for Cloud CDN |
| backend\_service\_name | Name of the backend service |
| bucket\_name | Bucket name |
| cluster\_info | The cluster information |
| gcp\_service\_account\_email | GCP service account email |
| k8s\_service\_account\_name | Kubernetes service account name |
| lb\_external\_ip | Frontend IP address of the load balancer |
| lds\_firestore | Firestore resource path |
| lds\_resource\_path | Resource path |
| load\_balancer\_name | Name of the load balancer |
| namespace | kubernetes namespace |

<!-- END OF PRE-COMMIT-TERRAFORM DOCS HOOK -->

## Requirements

These sections describe requirements for using this module.

### Software

The following dependencies must be available:

- [Terraform](https://developer.hashicorp.com/terraform/downloads) v0.13
- [Terraform Provider for GCP](https://registry.terraform.io/providers/hashicorp/google/latest/docs) plugin v4.57

### Service Account

- roles/storage.objectAdmin
- roles/datastore.user
- roles/compute.networkUser

A service account with the following roles must be used to provision
the resources of this module:


### APIs

A project with the following APIs enabled must be used to host the
resources of this module:

- compute.googleapis.com
- run.googleapis.com
- iam.googleapis.com
- firestore.googleapis.com
- vpcaccess.googleapis.com
- monitoring.googleapis.com
