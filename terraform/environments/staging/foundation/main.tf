terraform {
  backend "remote" {
    hostname = "app.terraform.io"
    organization = "rairtech"
    workspaces {
      name = "rair-staging"
    }
  }
}

variable "gcp_tf_admin_service_account_json" {
  type        = string
  description = "GCP tf-admin authentication file"
}

provider "google" {
  credentials = var.gcp_tf_admin_service_account_json
  project     = "rair-market-staging"
}

module "config" {
  source = "../../shared/env_config"
}

module "foundation" {
  source = "../../../modules/foundation"

  env_name                              = module.config.env_config.staging.env_name
  region                                = module.config.env_config.staging.region
  gcp_project_id                        = module.config.env_config.staging.gcp_project_id
  vpc_cidr_block                        = module.config.env_config.staging.vpc_cidr_block
  mongo_atlas_org_id                    = module.config.mongo_atlas_org_id
  obfuscated_project_id                 = module.config.env_config.staging.obfuscated_project_id
  minting_marketplace_subdomain         = module.config.env_config.staging.minting_marketplace_frontend_subdomain
  rairnode_subdomain                    = module.config.env_config.staging.rairnode_subdomain
  account_users                         = [
    {
      email: module.config.users.brian.email,
      role: "roles/editor"
    },
    {
      email: module.config.users.zeph.email,
      role: "roles/editor"
    },
    {
      email: module.config.users.ramki.email,
      role: "roles/viewer"
    }
  ]
  secret_adder_role_users = [
    module.config.users.brian.email,
    module.config.users.zeph.email
  ]
}

module "hcp_cloud" {
  source = "../../../modules/hcp_cloud"
  env_name = module.config.env_config.staging.env_name
  vault_cluster_tier = "dev"
}

output "complete_output" {
  value = module.foundation.complete_output
}