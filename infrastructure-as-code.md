# Infrastructure as Code

## Standard
Use Terraform as the source of truth for AWS infrastructure. Store modules and environment composition in `infrastructure/terraform/`. All plans are reviewed in pull requests, all applies run through GitHub Actions, and production applies require protected environment approval.

## Repository Layout
```text
infrastructure/terraform/
  modules/
    network/
    ecs-service/
    rds-postgres/
    s3-secure-bucket/
    sqs-worker/
    observability/
    iam-role/
  environments/
    dev/
    staging/
    production/
  policies/
    terraform/
    iam/
  scripts/
```

## State Management
Use an encrypted S3 backend with versioning, object lock where policy requires it, and DynamoDB locking or the current supported Terraform locking mechanism. Use one state boundary per environment and workload domain. Do not put secrets or customer data in state. Restrict state access to the platform role and audit all reads.

```hcl
terraform {
  required_version = "~> 1.9.0"
  backend "s3" {
    bucket         = "atlasai-terraform-state-production"
    key            = "platform/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "atlasai-terraform-locks"
  }
}
```

The backend bucket and lock table are bootstrapped separately with documented break-glass access.

## Module Rules
- Modules have narrow inputs, typed variables, documented outputs, and no hidden provider configuration.
- Use stable resource names and tags: `service`, `environment`, `owner`, `data-classification`, `cost-center`, and `managed-by`.
- Make encryption, private networking, logging, deletion protection, and least-privilege IAM defaults.
- Do not use `*` actions or resources unless a reviewed exception is recorded.
- Keep environment composition separate from reusable module implementation.
- Pin provider versions and commit the lockfile.

## Core Resources
Terraform provisions VPC and private subnets, VPC endpoints, security groups, RDS PostgreSQL Multi-AZ with pgvector, S3 buckets, SQS queues and DLQs, ECS clusters and services, ALB/WAF/TLS, ECR repositories, IAM roles, Secrets Manager references, CloudWatch dashboards and alarms, CloudTrail integration, and KMS keys.

## Example ECS Service Module
```hcl
module "api" {
  source = "../../modules/ecs-service"

  name                = "atlasai-api"
  environment         = var.environment
  image               = var.api_image_digest
  cpu                 = 1024
  memory              = 2048
  desired_count       = var.api_desired_count
  private_subnets     = module.network.private_subnet_ids
  security_group_ids  = [module.network.api_security_group_id]
  task_role_arn       = module.iam.api_task_role_arn
  execution_role_arn  = module.iam.ecs_execution_role_arn
  secrets             = module.secrets.api_secret_arns
  target_group_arn    = module.alb.api_target_group_arn
  health_check_path   = "/health/ready"
  enable_execute      = false
}
```

## Plan and Apply Workflow
1. Run `terraform fmt -check` and `terraform validate`.
2. Run static IaC policies with Checkov, tfsec, or an approved equivalent.
3. Generate a plan using the target environment state.
4. Publish the plan as a review artifact and redact sensitive values.
5. Require platform approval for production.
6. Apply the exact reviewed plan, record the run ID, and verify outputs.
7. Run smoke checks and update the release record.

## Drift and Emergency Changes
Run scheduled read-only plans to detect drift. Emergency console changes require incident authorization, immediate recording, import or codification in Terraform, and a follow-up review. Never destroy production resources from a local workstation.

## Migration Safety
Terraform must not own mutable database rows or application migrations. Database schema migrations run as a separately versioned release step. Destructive infrastructure changes require explicit review, backup verification, dependency analysis, and a recovery plan.

## Rollback
Terraform rollback means applying the previous reviewed configuration, not blindly reverting source code. Before changing stateful resources, verify whether the provider performs replacement, whether deletion protection is active, and whether the change is reversible. For accidental state loss, restore the backend version and stop applies until state integrity is verified.

## Example GitHub Actions Plan Job
```yaml
name: infrastructure-plan

on:
  pull_request:
    paths:
      - infrastructure/terraform/**
      - .github/workflows/infrastructure.yml

permissions:
  contents: read
  id-token: write
  pull-requests: write

jobs:
  plan:
    runs-on: ubuntu-24.04
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: 1.9.8
      - run: terraform -chdir=infrastructure/terraform/environments/staging init -input=false
      - run: terraform -chdir=infrastructure/terraform/environments/staging fmt -check -recursive
      - run: terraform -chdir=infrastructure/terraform/environments/staging validate
      - run: terraform -chdir=infrastructure/terraform/environments/staging plan -out=tfplan -input=false
      - uses: actions/upload-artifact@v4
        with:
          name: staging-terraform-plan
          path: infrastructure/terraform/environments/staging/tfplan
```

## Common Mistakes
- Sharing one Terraform state file across all environments.
- Storing secrets in variables, outputs, or state without a design review.
- Applying plans locally with credentials that CI does not use.
- Allowing Terraform to replace a database or KMS key unintentionally.
- Treating a successful plan as proof that the runtime configuration is correct.