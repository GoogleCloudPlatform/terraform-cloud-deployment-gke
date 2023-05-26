

<!-- BEGINNING OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| collection\_fields | collection id with respect to its fields | `map(any)` | <pre>{<br>  "fileMetadata": [<br>    {<br>      "array_config": "CONTAINS",<br>      "field_path": "tags"<br>    },<br>    {<br>      "field_path": "orderNo",<br>      "order": "DESCENDING"<br>    }<br>  ]<br>}</pre> | no |
| init | Initialize resource or not | `bool` | n/a | yes |
| project\_id | GCP project ID. | `string` | n/a | yes |

## Outputs

No output.

<!-- END OF PRE-COMMIT-TERRAFORM DOCS HOOK -->
