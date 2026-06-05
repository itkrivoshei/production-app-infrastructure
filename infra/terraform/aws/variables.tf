variable "project_name" {
  description = "Short project name used in AWS resource names."
  type        = string
  default     = "devops-control-center"

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{2,40}$", var.project_name))
    error_message = "project_name must be lowercase and may contain letters, numbers, and hyphens."
  }
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
  default     = "dev"

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{1,20}$", var.environment))
    error_message = "environment must be lowercase and may contain letters, numbers, and hyphens."
  }
}

variable "aws_region" {
  description = "AWS region for optional infrastructure."
  type        = string
  default     = "eu-central-1"
}

variable "owner" {
  description = "Owner tag for resources."
  type        = string
  default     = "portfolio"
}

variable "common_tags" {
  description = "Extra tags merged into all provider-managed resources."
  type        = map(string)
  default     = {}
}

variable "force_delete_ecr" {
  description = "Allow Terraform to delete ECR repositories that still contain images."
  type        = bool
  default     = false
}

variable "enable_ec2_demo" {
  description = "Create the optional EC2 demo host. Disabled by default to avoid accidental compute cost."
  type        = bool
  default     = false
}

variable "instance_type" {
  description = "EC2 instance type for the optional demo host."
  type        = string
  default     = "t3.micro"
}

variable "key_name" {
  description = "Optional EC2 key pair name for SSH access."
  type        = string
  default     = null
}

variable "public_subnet_cidr" {
  description = "CIDR block for the optional public subnet."
  type        = string
  default     = "10.42.1.0/24"
}

variable "allowed_http_cidr_blocks" {
  description = "CIDR blocks allowed to reach the optional EC2 demo app ports."
  type        = list(string)
  default     = ["0.0.0.0/0"]

  validation {
    condition     = alltrue([for cidr in var.allowed_http_cidr_blocks : can(cidrhost(cidr, 0))])
    error_message = "allowed_http_cidr_blocks must contain valid IPv4 CIDR blocks."
  }
}

variable "allowed_ssh_cidr_blocks" {
  description = "CIDR blocks allowed to reach SSH on the optional EC2 host. Leave empty to disable SSH ingress."
  type        = list(string)
  default     = []

  validation {
    condition     = alltrue([for cidr in var.allowed_ssh_cidr_blocks : can(cidrhost(cidr, 0))])
    error_message = "allowed_ssh_cidr_blocks must contain valid IPv4 CIDR blocks."
  }
}

variable "api_image" {
  description = "Digest-pinned container image reference for the API service."
  type        = string
  default     = null

  validation {
    condition     = var.api_image == null || can(regex("^ghcr\\.io/.+@sha256:[a-f0-9]{64}$", var.api_image))
    error_message = "api_image must be null or a ghcr.io reference pinned by sha256 digest."
  }
}

variable "web_image" {
  description = "Digest-pinned container image reference for the web service."
  type        = string
  default     = null

  validation {
    condition     = var.web_image == null || can(regex("^ghcr\\.io/.+@sha256:[a-f0-9]{64}$", var.web_image))
    error_message = "web_image must be null or a ghcr.io reference pinned by sha256 digest."
  }
}
