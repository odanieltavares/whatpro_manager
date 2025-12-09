#!/bin/bash

# Script to replace apiClient method calls with instancesApi
# Run from project root

echo "🔄 Replacing apiClient method calls with instancesApi..."

# Replace getInstances() with list()
find app components -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/apiClient\.getInstances()/instancesApi.list()/g' {} \;

# Replace getInstance(id) with get(id)
find app components -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/apiClient\.getInstance(/instancesApi.get(/g' {} \;

# Replace createInstance with create
find app components -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/apiClient\.createInstance(/instancesApi.create(/g' {} \;

# Replace updateInstance with update
find app components -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/apiClient\.updateInstance(/instancesApi.update(/g' {} \;

# Replace deleteInstance with delete
find app components -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/apiClient\.deleteInstance(/instancesApi.delete(/g' {} \;

# Replace generateQRCode with generateQRCode
find app components -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/apiClient\.generateQRCode(/instancesApi.generateQRCode(/g' {} \;

# Replace generatePaircode with generatePaircode
find app components -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/apiClient\.generatePaircode(/instancesApi.generatePaircode(/g' {} \;

# Replace getStatus with getStatus
find app components -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/apiClient\.getStatus(/instancesApi.getStatus(/g' {} \;

# Replace getBehavior with getBehavior
find app components -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/apiClient\.getBehavior(/instancesApi.getBehavior(/g' {} \;

# Replace updateBehavior with updateBehavior
find app components -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i '' 's/apiClient\.updateBehavior(/instancesApi.updateBehavior(/g' {} \;

echo "✅ Replacement complete!"
echo "📝 Note: Generic apiClient.get/post/put/delete calls need manual review"
