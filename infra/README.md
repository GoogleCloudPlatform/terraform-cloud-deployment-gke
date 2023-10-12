<!-- BEGINNING OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| bucket\_location | Bucket location. https://cloud.google.com/storage/docs/locations | `string` | `"US"` | no |
| disable\_services\_on\_destroy | Whether project services will be disabled when the resources are destroyed. | `bool` | `false` | no |
| firestore\_collection\_id | Firestore collection id | `string` | `"fileMetadata-cdn-gke"` | no |
| init | Initialize resource or not | `bool` | `true` | no |
| labels | A map of key/value label pairs to assign to the resources. | `map(string)` | <pre>{<br>  "app": "cloud-deployment-gke-golang"<br>}</pre> | no |
| project\_id | Google Cloud project ID. | `string` | n/a | yes |
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
