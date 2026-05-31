output "api_ecr_repository_url" {
  description = "ECR repository URL for the API image."
  value       = aws_ecr_repository.api.repository_url
}

output "web_ecr_repository_url" {
  description = "ECR repository URL for the web image."
  value       = aws_ecr_repository.web.repository_url
}

output "ec2_demo_enabled" {
  description = "Whether the optional EC2 demo host is enabled."
  value       = var.enable_ec2_demo
}

output "ec2_public_ip" {
  description = "Public IP for the optional EC2 demo host."
  value       = try(aws_instance.app[0].public_ip, null)
}

output "ec2_app_url" {
  description = "HTTP URL for the optional EC2 demo host."
  value       = try("http://${aws_instance.app[0].public_ip}:8088", null)
}

output "security_group_id" {
  description = "Security group ID for the optional EC2 demo host."
  value       = try(aws_security_group.app[0].id, null)
}
