#!/usr/bin/env node

// Force deployment trigger for Vercel
const timestamp = new Date().toISOString();
console.log(`🚀 Deployment trigger executed at: ${timestamp}`);
console.log('📦 Latest changes include smart coffee data normalization system');
console.log('✅ Ready for production deployment');

// Create a unique build identifier
const buildId = `build-${Date.now()}`;
require('fs').writeFileSync('.vercel-build-id', buildId);

console.log(`🔄 Build ID: ${buildId}`);
process.exit(0);