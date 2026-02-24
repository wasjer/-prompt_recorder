#!/bin/bash
# Build script for editor extension

echo "Building editor extension..."
npm run compile

if [ $? -eq 0 ]; then
    echo "✅ Build successful! Extension ready in dist/ directory"
    echo "Press F5 in VSCode/Cursor to test, or use 'vsce package' to create .vsix"
else
    echo "❌ Build failed"
    exit 1
fi
