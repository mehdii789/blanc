const { execSync } = require('child_process');
const fs = require('fs');

console.log('Starting build test...');

try {
  // Test TypeScript compilation
  console.log('Testing TypeScript compilation...');
  execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'inherit', cwd: process.cwd() });
  console.log('✅ TypeScript compilation successful');

  // Test Vite build
  console.log('Testing Vite build...');
  execSync('npx vite build', { stdio: 'inherit', cwd: process.cwd() });
  console.log('✅ Vite build successful');

  // Check if dist folder exists
  if (fs.existsSync('./dist')) {
    console.log('✅ Dist folder created');
    const files = fs.readdirSync('./dist');
    console.log('Files in dist:', files);
  } else {
    console.log('❌ Dist folder not found');
  }

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
