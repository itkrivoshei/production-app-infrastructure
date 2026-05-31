# Terraform AWS

The optional AWS layer lives in:

```text
infra/terraform/aws
```

It defines:

- ECR repositories for API and web images.
- ECR lifecycle policies for `sha-*` tags.
- Optional EC2 demo infrastructure, disabled by default.

## Safe Validation

```bash
cd infra/terraform/aws
terraform init
terraform fmt -check -recursive
terraform validate
cd ../../..
```

These commands do not create AWS resources.

## Optional Plan

Only run this with AWS credentials and cost awareness:

```bash
cd infra/terraform/aws
cp terraform.tfvars.example terraform.tfvars
terraform plan
```

To include the EC2 proof host:

```hcl
enable_ec2_demo = true
```

Do not commit:

- `terraform.tfvars`
- `*.tfstate`
- credentials
- generated plans
