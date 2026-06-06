locals {
  name_prefix = "${var.project_name}-${var.environment}"

  tags = merge(
    {
      Project     = var.project_name
      Environment = var.environment
      Owner       = var.owner
      ManagedBy   = "terraform"
    },
    var.common_tags
  )
}

resource "aws_kms_key" "ecr" {
  description             = "KMS key for ${local.name_prefix} ECR repositories"
  deletion_window_in_days = 7
  enable_key_rotation     = true
}

resource "aws_kms_alias" "ecr" {
  name          = "alias/${local.name_prefix}-ecr"
  target_key_id = aws_kms_key.ecr.key_id
}

resource "aws_ecr_repository" "api" {
  name                 = "${local.name_prefix}-api"
  image_tag_mutability = "IMMUTABLE"
  force_delete         = var.force_delete_ecr

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "KMS"
    kms_key         = aws_kms_key.ecr.arn
  }
}

resource "aws_ecr_repository" "web" {
  name                 = "${local.name_prefix}-web"
  image_tag_mutability = "IMMUTABLE"
  force_delete         = var.force_delete_ecr

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "KMS"
    kms_key         = aws_kms_key.ecr.arn
  }
}

resource "aws_ecr_lifecycle_policy" "api" {
  repository = aws_ecr_repository.api.name
  policy     = local.ecr_lifecycle_policy
}

resource "aws_ecr_lifecycle_policy" "web" {
  repository = aws_ecr_repository.web.name
  policy     = local.ecr_lifecycle_policy
}

locals {
  ecr_lifecycle_policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep the most recent 20 sha-tagged images"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["sha-"]
          countType     = "imageCountMoreThan"
          countNumber   = 20
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

resource "aws_vpc" "demo" {
  count = var.enable_ec2_demo ? 1 : 0

  cidr_block           = "10.42.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${local.name_prefix}-vpc"
  }
}

resource "aws_subnet" "public" {
  count = var.enable_ec2_demo ? 1 : 0

  vpc_id                  = aws_vpc.demo[0].id
  cidr_block              = var.public_subnet_cidr
  map_public_ip_on_launch = true

  tags = {
    Name = "${local.name_prefix}-public-subnet"
  }
}

resource "aws_internet_gateway" "demo" {
  count = var.enable_ec2_demo ? 1 : 0

  vpc_id = aws_vpc.demo[0].id

  tags = {
    Name = "${local.name_prefix}-igw"
  }
}

resource "aws_route_table" "public" {
  count = var.enable_ec2_demo ? 1 : 0

  vpc_id = aws_vpc.demo[0].id

  tags = {
    Name = "${local.name_prefix}-public-rt"
  }
}

resource "aws_route" "internet" {
  count = var.enable_ec2_demo ? 1 : 0

  route_table_id         = aws_route_table.public[0].id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.demo[0].id
}

resource "aws_route_table_association" "public" {
  count = var.enable_ec2_demo ? 1 : 0

  subnet_id      = aws_subnet.public[0].id
  route_table_id = aws_route_table.public[0].id
}

resource "aws_security_group" "app" {
  count = var.enable_ec2_demo ? 1 : 0

  name_prefix = "${local.name_prefix}-app-"
  description = "Ingress for the optional DevOps Control Center EC2 demo"
  vpc_id      = aws_vpc.demo[0].id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = var.allowed_http_cidr_blocks
  }

  dynamic "ingress" {
    for_each = toset(var.allowed_ssh_cidr_blocks)

    content {
      description = "SSH"
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = [ingress.value]
    }
  }

  egress {
    description = "Outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = "${local.name_prefix}-app-sg"
  }
}

data "aws_ami" "amazon_linux_2023" {
  count = var.enable_ec2_demo ? 1 : 0

  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  filter {
    name   = "root-device-type"
    values = ["ebs"]
  }
}

data "aws_iam_policy_document" "ec2_assume_role" {
  count = var.enable_ec2_demo ? 1 : 0

  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ec2_ssm" {
  count = var.enable_ec2_demo ? 1 : 0

  name_prefix        = "${local.name_prefix}-ec2-"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume_role[0].json

  tags = {
    Name = "${local.name_prefix}-ec2-ssm"
  }
}

resource "aws_iam_role_policy_attachment" "ec2_ssm" {
  count = var.enable_ec2_demo ? 1 : 0

  role       = aws_iam_role.ec2_ssm[0].name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "ec2_ssm" {
  count = var.enable_ec2_demo ? 1 : 0

  name_prefix = "${local.name_prefix}-ec2-"
  role        = aws_iam_role.ec2_ssm[0].name
}

resource "aws_instance" "app" {
  count = var.enable_ec2_demo ? 1 : 0

  ami                         = data.aws_ami.amazon_linux_2023[0].id
  instance_type               = var.instance_type
  subnet_id                   = aws_subnet.public[0].id
  vpc_security_group_ids      = [aws_security_group.app[0].id]
  associate_public_ip_address = true
  iam_instance_profile        = aws_iam_instance_profile.ec2_ssm[0].name
  key_name                    = var.key_name
  user_data_replace_on_change = true
  user_data = templatefile("${path.module}/templates/user-data.sh.tftpl", {
    api_image   = coalesce(var.api_image, "")
    web_image   = coalesce(var.web_image, "")
    app_version = coalesce(var.app_version, "")
    commit_sha  = coalesce(var.commit_sha, "")
  })

  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required"
  }

  root_block_device {
    encrypted   = true
    volume_size = 20
    volume_type = "gp3"
  }

  tags = {
    Name = "${local.name_prefix}-app"
  }

  lifecycle {
    precondition {
      condition     = var.api_image != null && var.web_image != null && var.app_version != null && var.commit_sha != null
      error_message = "api_image, web_image, app_version, and commit_sha must be set when enable_ec2_demo is true."
    }
  }
}
