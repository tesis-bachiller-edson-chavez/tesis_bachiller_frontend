# 6. Define una salida para mostrar la URL de CloudFront después del despliegue
output "cloudfront_domain_name" {
  description = "The domain name of the CloudFront distribution"
  value       = aws_cloudfront_distribution.frontend_distribution.domain_name
}
