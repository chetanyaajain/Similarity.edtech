# Deployment Guide

## Architecture

- `client` deployed to Vercel or containerized on Render
- `server` deployed to AWS ECS/Fargate, EC2, or Render
- `ml` deployed as a separate autoscaled container service
- PostgreSQL on AWS RDS
- Optional object storage on S3 for uploaded files and reports

## AWS path

1. Push images to ECR.
2. Provision RDS PostgreSQL.
3. Deploy `server` and `ml` to ECS Fargate behind an ALB.
4. Deploy `client` to Vercel with `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL`.
5. Store secrets in AWS Secrets Manager or SSM Parameter Store.
6. Add CloudWatch logs and alarms.

## Render path

1. Create separate web services for `server` and `ml`.
2. Create PostgreSQL instance.
3. Deploy `client` as a static or Next.js service.
4. Set environment variables from the examples.

## Production hardening

- Replace local uploads with S3
- Add async workers for large files
- Rotate JWT secret and SMTP credentials
- Put API behind a reverse proxy with TLS
- Enable DB backups and connection pooling
- Run migrations with Alembic before rollout

