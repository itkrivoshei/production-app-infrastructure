# Terraform AWS

The optional AWS Terraform layer lives in [`infra/terraform/aws`](../infra/terraform/aws).

It is intentionally separated from the local Docker Compose stack. The local
stack works without AWS credentials. When explicitly enabled, Terraform boots
the safe API/web/edge Compose stack on EC2 and exposes only HTTP port `80`.

## Scope

The AWS layer defines:

- Optional KMS-encrypted ECR repositories and lifecycle policies, disabled by default.
- Optional EC2 demo infrastructure, disabled by default.
- An SSM instance profile without public SSH by default.
- EC2 user data that installs verified Docker Compose and starts the safe stack.

The default configuration plans no AWS resources. ECR/KMS and EC2 are separate,
explicit opt-ins.

## Safe Validation

Run these commands to validate formatting and Terraform configuration:

```bash
cd infra/terraform/aws
terraform init
terraform fmt -check -recursive
terraform validate
cd ../../..
```

These commands validate the Terraform module locally. They do not create AWS resources.

## Optional Plan

Only run `terraform plan` when you have AWS credentials configured and understand the potential cost impact.

```bash
cd infra/terraform/aws
cp terraform.tfvars.example terraform.tfvars
terraform plan
cd ../../..
```

The example variables file is a starting point. Review and adjust it before planning real infrastructure.

## Optional EC2 Demo

The EC2 proof host is disabled by default.

To include it in the plan, set:

```hcl
enable_ec2_demo = true
api_image       = "ghcr.io/owner/devops-control-center-api@sha256:<digest>"
web_image       = "ghcr.io/owner/devops-control-center-web@sha256:<digest>"
edge_image      = "nginxinc/nginx-unprivileged@sha256:<digest>"
app_version     = "1.2.3"
commit_sha      = "0123456789abcdef0123456789abcdef01234567"
```

Both application images must be public immutable `ghcr.io` references pinned
by digest. The edge image must also be pinned by digest. Mutable tags such as
`latest` and `sha-*` are rejected. Release version and commit SHA are required
so `/api/version` identifies the deployed release. The instance starts
`APP_MODE=safe`, does not register demo actions, waits for API/web/edge
healthchecks, rotates Docker logs, applies resource limits, restarts the stack
after reboot, and serves the hardened dashboard edge on port `80`.

After `terraform apply`, validate the deployment:

```bash
APP_URL="$(terraform output -raw ec2_app_url)"
cd ../../..
EXPECTED_APP_VERSION=1.2.3 \
EXPECTED_COMMIT_SHA=0123456789abcdef0123456789abcdef01234567 \
./scripts/aws-smoke.sh "$APP_URL"
```

The smoke check verifies safe mode, unavailable demo endpoints, release
metadata when expected values are supplied, and important Nginx security
headers.

Use this only for a controlled demo environment. EC2 and networking resources
may create AWS costs.

## Optional ECR Repositories

The EC2 demo deploys GHCR images and does not require ECR. Create the
KMS-encrypted API/web ECR repositories only when demonstrating that separate
registry path:

```hcl
enable_ecr_repositories = true
```

This opt-in creates ECR repositories, lifecycle policies, a KMS key, and a KMS
alias, which may create AWS costs.

## Terraform Tests

Run the mock-provider tests without AWS credentials:

```bash
terraform test
```

They verify that the default plan creates no resources, ECR is opt-in, and the
EC2 demo requires immutable release inputs.

## Safety Rules

Do not commit:

- `terraform.tfvars`
- `*.tfstate`
- `*.tfstate.backup`
- credentials
- generated plan files
- local override files

Recommended local check before committing Terraform changes:

```bash
cd infra/terraform/aws
terraform fmt -check -recursive
terraform validate
cd ../../..
```

## Git Ignore Expectations

The repository should keep Terraform runtime artifacts out of version control:

```text
terraform.tfvars
*.tfstate
*.tfstate.backup
*.tfplan
.terraform/
```
