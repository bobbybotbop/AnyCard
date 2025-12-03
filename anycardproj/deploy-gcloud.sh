#!/bin/bash
# Bash script to build and deploy Docker container to Google Cloud Run
# Usage: ./deploy-gcloud.sh [--project PROJECT_ID] [--region REGION] [--service-name SERVICE_NAME]

set -e  # Exit on error

# Default values
PROJECT_ID=""
REGION="us-central1"
SERVICE_NAME="anycard-backend"
IMAGE_TAG="latest"
ENV_FILE=".env.docker"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --project)
            PROJECT_ID="$2"
            shift 2
            ;;
        --region)
            REGION="$2"
            shift 2
            ;;
        --service-name)
            SERVICE_NAME="$2"
            shift 2
            ;;
        --image-tag)
            IMAGE_TAG="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--project PROJECT_ID] [--region REGION] [--service-name SERVICE_NAME] [--image-tag TAG]"
            exit 1
            ;;
    esac
done

# Check if .env.docker file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "Error: $ENV_FILE not found!" >&2
    echo "Please create $ENV_FILE with your environment variables first." >&2
    exit 1
fi

# Get project ID if not provided
if [ -z "$PROJECT_ID" ]; then
    PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
    if [ -z "$PROJECT_ID" ]; then
        echo "Error: No Google Cloud project ID specified!" >&2
        echo "Please set it with: gcloud config set project YOUR_PROJECT_ID" >&2
        echo "Or pass it as parameter: $0 --project YOUR_PROJECT_ID" >&2
        exit 1
    fi
fi

echo "Using Google Cloud Project: $PROJECT_ID"
echo "Region: $REGION"
echo "Service Name: $SERVICE_NAME"

# Read environment variables from .env.docker file
declare -A ENV_VARS
CURRENT_KEY=""
CURRENT_VALUE=""

while IFS= read -r line || [ -n "$line" ]; do
    # Trim whitespace
    line=$(echo "$line" | xargs)
    
    # Skip empty lines and comments
    if [ -z "$line" ] || [[ "$line" =~ ^# ]]; then
        continue
    fi
    
    # Check if this is a key-value pair
    if [[ "$line" =~ ^([^=]+)=(.*)$ ]]; then
        # Save previous key-value if exists
        if [ -n "$CURRENT_KEY" ]; then
            ENV_VARS["$CURRENT_KEY"]="$CURRENT_VALUE"
        fi
        
        CURRENT_KEY=$(echo "${BASH_REMATCH[1]}" | xargs)
        VALUE_PART=$(echo "${BASH_REMATCH[2]}" | xargs)
        
        # Skip placeholder values
        if [ "$VALUE_PART" = "your-base64-encoded-service-account-json-here" ] || [[ "$VALUE_PART" =~ ^your-.*-here$ ]]; then
            echo "Warning: Skipping placeholder value for $CURRENT_KEY"
            CURRENT_KEY=""
            CURRENT_VALUE=""
            continue
        fi
        
        CURRENT_VALUE="$VALUE_PART"
    else
        # Continuation of previous value (for multi-line base64)
        if [ -n "$CURRENT_KEY" ]; then
            CURRENT_VALUE="${CURRENT_VALUE}${line}"
        fi
    fi
done < "$ENV_FILE"

# Save last key-value pair
if [ -n "$CURRENT_KEY" ]; then
    ENV_VARS["$CURRENT_KEY"]="$CURRENT_VALUE"
fi

# Remove BACKENDURL and PORT from env vars (Cloud Run handles PORT automatically)
unset ENV_VARS["BACKENDURL"]
unset ENV_VARS["PORT"]

# Build environment variable string for gcloud
ENV_VARS_ARRAY=()
for key in "${!ENV_VARS[@]}"; do
    ENV_VARS_ARRAY+=("${key}=${ENV_VARS[$key]}")
done
ENV_VARS_STRING=$(IFS=','; echo "${ENV_VARS_ARRAY[*]}")

# Set image name (using Artifact Registry - newer than GCR)
IMAGE_NAME="${REGION}-docker.pkg.dev/${PROJECT_ID}/anycard-repo/${SERVICE_NAME}:${IMAGE_TAG}"

echo ""
echo "=== Step 1: Building Docker image ==="
docker build -t "$IMAGE_NAME" .

if [ $? -ne 0 ]; then
    echo "Docker build failed!" >&2
    exit 1
fi

echo ""
echo "=== Step 2: Configuring Docker authentication ==="
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

echo ""
echo "=== Step 3: Pushing image to Artifact Registry ==="

# Check if repository exists, create if not
REPO_EXISTS=$(gcloud artifacts repositories describe anycard-repo --location="$REGION" --format="value(name)" 2>/dev/null || echo "")
if [ -z "$REPO_EXISTS" ]; then
    echo "Creating Artifact Registry repository..."
    gcloud artifacts repositories create anycard-repo \
        --repository-format=docker \
        --location="$REGION" \
        --description="Docker repository for AnyCard backend"
fi

docker push "$IMAGE_NAME"

if [ $? -ne 0 ]; then
    echo "Docker push failed!" >&2
    exit 1
fi

echo ""
echo "=== Step 4: Deploying to Cloud Run ==="

# Build gcloud run deploy command
DEPLOY_ARGS=(
    "run" "deploy" "$SERVICE_NAME"
    "--image" "$IMAGE_NAME"
    "--platform" "managed"
    "--region" "$REGION"
    "--allow-unauthenticated"
    "--port" "8080"
)

# Add environment variables if any
if [ ${#ENV_VARS[@]} -gt 0 ]; then
    DEPLOY_ARGS+=("--set-env-vars")
    DEPLOY_ARGS+=("$ENV_VARS_STRING")
fi

gcloud "${DEPLOY_ARGS[@]}"

if [ $? -eq 0 ]; then
    echo ""
    echo "=== Deployment Successful! ==="
    SERVICE_URL=$(gcloud run services describe "$SERVICE_NAME" --region="$REGION" --format="value(status.url)" 2>/dev/null || echo "")
    if [ -n "$SERVICE_URL" ]; then
        echo "Service URL: $SERVICE_URL"
    fi
else
    echo ""
    echo "Deployment failed!" >&2
    exit 1
fi

