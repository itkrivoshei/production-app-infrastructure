# Terraform AWS

The optional AWS Terraform layer lives in [`infra/terraform/aws`](../infra/terraform/aws).

It is intentionally separated from the local Docker Compose stack. The local stack works without AWS credentials, while this layer provides a validation-ready infrastructure path for future cloud deployment work.

## Scope

The AWS layer defines:

- ECR repositories for API and web images.
- ECR lifecycle policies for `sha-*` image tags.
- Optional EC2 demo infrastructure, disabled by default.

The default configuration is safe for local validation and does not require creating cloud resources.

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
```

Use this only for a controlled demo environment. Do not enable it casually, because EC2 resources may create AWS costs.

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
.terraform.lock.hcl
```

Keep `.terraform.lock.hcl` only if the project intentionally decides to lock provider versions in the repository.
