# load-balancer

<!-- BEGINNING OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| bucket\_name | Bucket name | `string` | n/a | yes |
| health\_check\_allow\_ports | The ports to allow for health check. | `list(number)` | n/a | yes |
| labels | A map of key/value label pairs to assign to the bucket. | `map(string)` | n/a | yes |
| project\_id | Google Cloud project ID. | `string` | n/a | yes |
| resource\_path | Resource folder path | `string` | n/a | yes |

## Outputs

| Name | Description |
|------|-------------|
| backend\_bucket\_name | The name of the backend bucket used for Cloud CDN |
| backend\_service\_name | The name of the backend\_service |
| lb\_external\_ip | Frontend IP address of the load balancer |
| load\_balancer\_name | The name of the load balancer |

<!-- END OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
