#!/bin/bash
set -e

if [ -z "$S3_BUCKET_NAME" ] || [ -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
  echo "Error: S3_BUCKET_NAME and CLOUDFRONT_DISTRIBUTION_ID must be set"
  exit 1
fi

cd /Users/craigmeister/Desktop/kipkapbadge/frontend
npm ci
npm run build

aws s3 sync dist/ "s3://${S3_BUCKET_NAME}" --delete \
  --cache-control "max-age=31536000,immutable"

aws s3 cp dist/index.html "s3://${S3_BUCKET_NAME}/index.html" \
  --cache-control "no-cache, no-store, must-revalidate"

aws cloudfront create-invalidation \
  --distribution-id "${CLOUDFRONT_DISTRIBUTION_ID}" --paths "/*"

echo "Frontend deployed successfully"
