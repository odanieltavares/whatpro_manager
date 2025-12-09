#!/bin/bash

# Script to add await to ProviderFactory.findConfig calls
echo "🔄 Adding await to ProviderFactory.findConfig() calls..."

# Find all files with ProviderFactory.findConfig and add await
find app/api -type f -name "*.ts" -exec sed -i '' 's/ProviderFactory\.findConfig(/await ProviderFactory.findConfig(/g' {} \;

echo "✅ Done! All ProviderFactory.findConfig() calls now have await"
