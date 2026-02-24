#!/bin/bash
# Build script for browser extension

echo "Building browser extension..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful! Extension ready in dist/ directory"
    echo "Load the extension from this directory in Chrome/Edge"
else
    echo "❌ Build failed"
    exit 1
fi
