# helm

<!-- BEGINNING OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| chart\_folder\_name | The signified folder's name in chars folder | `string` | n/a | yes |
| entries | custom values to be merge into values yaml. | <pre>list(object({<br>    name  = string<br>    value = string<br>  }))</pre> | `[]` | no |
| namespace | Kubernetes namespace for the helm chart | `string` | n/a | yes |
| secret\_entries | custom sensitive values to be merged into values yaml. it would not be exposed in the terraform plan's diff. | <pre>list(object({<br>    name  = string<br>    value = string<br>  }))</pre> | `[]` | no |

## Outputs

No outputs.

<!-- END OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
