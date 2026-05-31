# Optional AWS Terraform Layer

This directory is a validation-ready AWS layer for Project 1. It is intentionally optional: local development, Docker Compose, observability, k6, and rollback do not require AWS.

## What It Defines

- ECR repositories for API and web images with scan-on-push enabled.
- ECR lifecycle policies for `sha-*` image tags.
- Optional EC2 demo infrastructure, disabled by default with `enable_ec2_demo = false`.

## Safe Local Validation

```bash
cd infra/terraform/aws
terraform init
terraform fmt -check -recursive
terraform validate
```

These commands do not create AWS resources.

## Optional Plan

Only run this when you have AWS credentials configured and understand the cost impact:

```bash
cp terraform.tfvars.example terraform.tfvars
terraform plan
```

To include the EC2 host proof target:

```hcl
enable_ec2_demo = true
```

Do not commit `terraform.tfvars`, state files, credentials, or generated plans.
