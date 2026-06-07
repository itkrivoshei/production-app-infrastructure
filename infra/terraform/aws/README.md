# Optional AWS Terraform Layer

This directory contains the optional AWS validation and safe EC2 demo layer.
The canonical usage, safety, deployment, and smoke-test instructions live in
[`../../../docs/terraform-aws.md`](../../../docs/terraform-aws.md).

## Safe Local Validation

```bash
cd infra/terraform/aws
terraform init
terraform fmt -check -recursive
terraform validate
```

These commands do not create AWS resources.

The default plan also creates no resources. Set `enable_ecr_repositories=true`
only when the optional KMS-encrypted ECR registry path is required.

## EC2 Requirements

Keep `enable_ec2_demo = false` unless an EC2 proof deployment is intentional.
When enabled, provide all four release inputs:

```hcl
enable_ec2_demo = true
api_image       = "ghcr.io/owner/devops-control-center-api@sha256:<digest>"
web_image       = "ghcr.io/owner/devops-control-center-web@sha256:<digest>"
edge_image      = "nginxinc/nginx-unprivileged@sha256:<digest>"
app_version     = "1.2.3"
commit_sha      = "0123456789abcdef0123456789abcdef01234567"
```

Only run a plan with configured AWS credentials and after reviewing the cost:

```bash
cp terraform.tfvars.example terraform.tfvars
terraform plan
```

Do not commit `terraform.tfvars`, state files, credentials, or generated plans.
