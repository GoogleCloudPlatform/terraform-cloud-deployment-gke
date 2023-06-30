# terraform-cloud-deployment-gke

## Description

### Detailed

The resources/services/activations/deletions that this app will create/trigger are:

- Google Kubernetes Engine (Autopilot)
- Cloud Load Balancing
- Cloud Storage
- Cloud CDN
- Firestore
- IAM

### PreDeploy

To deploy this blueprint you must have an active billing account and billing permissions.

## Documentation

- URL

## Usage

Basic usage is as follows:

## Requirements

These sections describe requirements for using this module.

### Software

The following dependencies must be available:

- [Terraform][terraform] v0.13
- [Terraform Provider for GCP][terraform-provider-gcp] plugin v3.0

### Service Account

A service account with the following roles must be used to provision
the resources of this module:

- roles/storage.objectAdmin
- roles/datastore.user
- roles/compute.networkUser
- roles/cloudtrace.agent
- roles/iam.workloadIdentityUser

### APIs

A project with the following APIs enabled must be used to host the
resources of this module:

- compute.googleapis.com
- iam.googleapis.com
- cloudresourcemanager.googleapis.com
- firestore.googleapis.com
- monitoring.googleapis.com
- cloudtrace.googleapis.com
- container.googleapis.com
- storage.googleapis.com

## Contributing

Refer to the [contribution guidelines](CONTRIBUTING.md) for
information on contributing to this module.

[terraform-provider-gcp]: https://www.terraform.io/docs/providers/google/index.html
[terraform]: https://www.terraform.io/downloads.html

## Security Disclosures
