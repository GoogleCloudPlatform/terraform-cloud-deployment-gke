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
| init | Initialize the Firestore database or not | `bool` | `true` | no |
| labels | A map of key/value label pairs to assign to the resources. | `map(string)` | <pre>{<br>  "app": "large-data-sharing"<br>}</pre> | no |
| lds\_client\_image | Docker image for frontend | `string` | `"gcr.io/hsa-resources-public/hsa-lds-java-frontend:latest"` | no |
| lds\_initialization\_archive\_file\_name | Archive file's name in lds-initialization bucket | `string` | `"initialization.tar.gz"` | no |
| lds\_initialization\_bucket\_name | Bucket for cloud run job | `string` | `"lds-resources-236348946525"` | no |
| lds\_server\_image | Docker image for backend | `string` | `"gcr.io/hsa-resources-public/hsa-lds-java-backend:latest"` | no |
| project\_id | GCP project ID. | `string` | n/a | yes |
| region | Google cloud region where the resource will be created. | `string` | `"us-west1"` | no |

## Outputs

| Name | Description |
|------|-------------|
| bucket\_name | Bucket name |
| lb\_external\_ip | Frontend IP address of the load balancer |

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
