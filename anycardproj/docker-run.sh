#!/bin/bash
# Bash script to run the Docker container with environment variables
# Usage: ./docker-run.sh

ENV_FILE=".env.docker"

# Check if .env.docker file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "Creating .env.docker file template..."
    cat > "$ENV_FILE" << 'EOF'
# Environment variables for Docker testing
# Fill in your actual values below

# Firebase Service Account (base64 encoded JSON)
# To encode: Get your Firebase service account JSON file, then run:
# cat path/to/your-service-account.json | base64
FIREBASE_SERVICE_ACCOUNT=your-base64-encoded-service-account-json-here

# Serper API Key
SERPER_API_KEY=your-serper-api-key-here

# OpenRouter API Key
OPENROUTER_API_KEY=your-openrouter-api-key-here

# Backend URL
BACKENDURL=http://localhost:8080

# Port (optional - defaults to 8080)
PORT=8080
EOF
    echo "Created $ENV_FILE - please fill in your values and run this script again."
    exit 0
fi

# Build docker run command with environment variables from .env.docker
ENV_ARGS=""
while IFS='=' read -r key value || [ -n "$key" ]; do
    # Skip comments and empty lines
    [[ "$key" =~ ^#.*$ ]] && continue
    [[ -z "$key" ]] && continue
    
    # Remove leading/trailing whitespace
    key=$(echo "$key" | xargs)
    value=$(echo "$value" | xargs)
    
    # Skip placeholder values
    [[ "$value" == "your-base64-encoded-service-account-json-here" ]] && continue
    [[ "$value" =~ ^your-.*-here$ ]] && continue
    
    if [ -n "$key" ] && [ -n "$value" ]; then
        ENV_ARGS="$ENV_ARGS -e $key=$value"
    fi
done < "$ENV_FILE"

echo "Running Docker container with environment variables from $ENV_FILE..."
docker run -p 8080:8080 $ENV_ARGS anycard-backend:test

