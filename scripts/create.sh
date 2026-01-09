#!/bin/bash
set -e

# colors
RED="\033[1;31m"
GREEN="\033[1;32m"
YELLOW="\033[1;33m"
NOCOLOR="\033[0m"

echo -e "${YELLOW}Creating Table:${NOCOLOR} fast-food-cook-to-order-db"
aws dynamodb --endpoint-url=http://localhost:4566 --region=us-east-1 create-table \
    --table-name fast-food-cook-to-order-db \
    --attribute-definitions \
        AttributeName=pk,AttributeType=S \
        AttributeName=orderId,AttributeType=S \
        AttributeName=status,AttributeType=S \
        AttributeName=createdAt,AttributeType=N \
        AttributeName=queueStatus,AttributeType=S \
    --key-schema \
        AttributeName=pk,KeyType=HASH \
        AttributeName=orderId,KeyType=RANGE \
    --global-secondary-indexes '[
        {
            "IndexName": "status_createdAt_idx",
            "KeySchema": [
                { "AttributeName": "status", "KeyType": "HASH" },
                { "AttributeName": "createdAt", "KeyType": "RANGE" }
            ],
            "Projection": { "ProjectionType": "ALL" },
            "ProvisionedThroughput": {
                "ReadCapacityUnits": 5,
                "WriteCapacityUnits": 5
            }
        },
        {
            "IndexName": "queueStatus_createdAt_idx",
            "KeySchema": [
                { "AttributeName": "queueStatus", "KeyType": "HASH" },
                { "AttributeName": "createdAt", "KeyType": "RANGE" }
            ],
            "Projection": { "ProjectionType": "ALL" },
            "ProvisionedThroughput": {
                "ReadCapacityUnits": 5,
                "WriteCapacityUnits": 5
            }
        }
    ]' \
    --provisioned-throughput \
        ReadCapacityUnits=5,WriteCapacityUnits=5 | tee >/dev/null 2>&1

echo -e "${GREEN}Table created successfully${NOCOLOR}"
echo
