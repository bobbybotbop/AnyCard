#!/bin/sh

# pm2 start /app/backend/dist/server.js
node /app/backend/dist/server.js &

# Process nginx template with environment variables
envsubst '${BACKENDURL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

nginx -g "daemon off;"