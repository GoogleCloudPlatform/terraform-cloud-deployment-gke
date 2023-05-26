
<!-- BEGINNING OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| labels | A map of key/value label pairs to assign to the bucket. | `map(string)` | `{}` | no |
| location | Bucket location | `string` | n/a | yes |
| name | Bucket name | `string` | n/a | yes |
| project\_id | GCP project ID. | `string` | n/a | yes |

## Outputs

| Name | Description |
|------|-------------|
| bucket\_name | Bucket name |

<!-- END OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
