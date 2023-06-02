module "migratation_helm" {
  depends_on = [
    module.load_balancer
  ]
  source = "./modules/helm"

  chart_folder_name = "job"
  entries = concat(local.base_entries,
    [
      {
        name  = "project_id"
        value = data.google_project.project.project_id
      },
      {
        name  = "region"
        value = var.region
      },
      {
        name  = "lds_initialization_bucket_name"
        value = var.lds_initialization_bucket_name
      },
      {
        name  = "lds_initialization_archive_file_name"
        value = var.lds_initialization_archive_file_name
      },
    ]
  )
}
