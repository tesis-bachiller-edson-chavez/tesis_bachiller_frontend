# 1. Define el bucket de S3
resource "aws_s3_bucket" "frontend_bucket" {
  bucket = "202509-tesis-ECHAVEZ"

  tags = {
    Name        = "DORA Platform Frontend"
    Project     = "tesis-bachiller"
    ManagedBy   = "Terraform"
  }
}

# 2. Habilita el hosting de sitios web estáticos en el bucket
resource "aws_s3_bucket_website_configuration" "frontend_website_config" {
  bucket = aws_s3_bucket.frontend_bucket.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

# 3. Define una política para permitir el acceso público de lectura al bucket
resource "aws_s3_bucket_policy" "frontend_bucket_policy" {
  bucket = aws_s3_bucket.frontend_bucket.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.frontend_bucket.arn}/*"
      },
    ]
  })
}

# 4. Configura el bloqueo de acceso público para permitir que la política funcione
resource "aws_s3_bucket_public_access_block" "frontend_public_access" {
  bucket = aws_s3_bucket.frontend_bucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}
