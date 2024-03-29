#!/bin/bash

GCP_PROJECT_ID=$(gcloud config get-value project)

# Manually set this to match the resource names that are generated by Terraform
VAULT_ROLE_ID_RESOURCE_NAME="gke-vault-role-id-blockchain-networks"
VAULT_SECRET_ID_RESOURCE_NAME="gke-vault-secret-id-blockchain-networks"
SERVICE_ACCOUNT="gke-blockchain-networks@rair-market-dev.iam.gserviceaccount.com"
MORALIS_MASTER_KEY_MAIN_NAME="MORALIS_MASTER_KEY_MAIN"

echo "gcloud config set account $SERVICE_ACCOUNT"
gcloud config set account $SERVICE_ACCOUNT

echo "Getting secret: $VAULT_ROLE_ID_RESOURCE_NAME..."
export VAULT_BLOCKCHAIN_NETWORK_APP_ROLE_ID=$(gcloud secrets versions access latest --project=$GCP_PROJECT_ID --secret="$VAULT_ROLE_ID_RESOURCE_NAME")

echo "Getting secret: $VAULT_SECRET_ID_RESOURCE_NAME..."
export VAULT_BLOCKCHAIN_NETWORK_APP_ROLE_SECRET_ID=$(gcloud secrets versions access latest --project=$GCP_PROJECT_ID --secret="$VAULT_SECRET_ID_RESOURCE_NAME")

echo "Getting MORALIS_MASTER_KEY_MAIN..."
export MORALIS_MASTER_KEY_MAIN=$(gcloud secrets versions access latest --project=$GCP_PROJECT_ID --secret="$MORALIS_MASTER_KEY_MAIN_NAME")

echo "Running npm start..."
# fire the container as normal
npm start