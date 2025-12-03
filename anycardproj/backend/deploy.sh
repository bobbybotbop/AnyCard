#!/bin/bash
# Exit if any command fails
set -e

echo "Deploying to Google Cloud Run..."

# Make sure project is set
gcloud config set project anycardbackend

# Build and deploy to Cloud Run
gcloud run deploy anycard-server \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --min-instances=0 \
  --cpu-throttling

echo "Deployment complete!"