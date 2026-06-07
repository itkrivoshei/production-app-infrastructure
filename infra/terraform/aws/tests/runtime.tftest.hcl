mock_provider "aws" {
  mock_data "aws_ami" {
    defaults = {
      id = "ami-0123456789abcdef0"
    }
  }

  mock_data "aws_iam_policy_document" {
    defaults = {
      json = "{\"Version\":\"2012-10-17\",\"Statement\":[]}"
    }
  }
}

run "default_plan_creates_no_optional_resources" {
  command = plan

  assert {
    condition = (
      length(aws_kms_key.ecr) == 0 &&
      length(aws_ecr_repository.api) == 0 &&
      length(aws_ecr_repository.web) == 0 &&
      length(aws_instance.app) == 0
    )
    error_message = "The default plan must not create ECR, KMS, or EC2 resources."
  }
}

run "ecr_repositories_are_explicitly_enabled" {
  command = plan

  variables {
    enable_ecr_repositories = true
  }

  assert {
    condition = (
      length(aws_kms_key.ecr) == 1 &&
      length(aws_ecr_repository.api) == 1 &&
      length(aws_ecr_repository.web) == 1
    )
    error_message = "Enabling ECR repositories must create the KMS key and both repositories."
  }
}

run "ec2_demo_requires_immutable_release_inputs" {
  command = plan

  variables {
    enable_ec2_demo = true
  }

  expect_failures = [
    aws_instance.app[0],
  ]
}

run "ec2_demo_uses_hardened_compose_runtime" {
  command = plan

  variables {
    enable_ec2_demo = true
    api_image       = "ghcr.io/owner/devops-control-center-api@sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    web_image       = "ghcr.io/owner/devops-control-center-web@sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
    edge_image      = "nginxinc/nginx-unprivileged@sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"
    app_version     = "1.2.3"
    commit_sha      = "0123456789abcdef0123456789abcdef01234567"
  }

  assert {
    condition = (
      strcontains(aws_instance.app[0].user_data, "image: nginxinc/nginx-unprivileged@sha256:") &&
      strcontains(aws_instance.app[0].user_data, "max-size: \"10m\"") &&
      strcontains(aws_instance.app[0].user_data, "docker compose -f compose.yml up -d --wait")
    )
    error_message = "The EC2 bootstrap must use the immutable edge image, log rotation, and Compose health waiting."
  }
}
