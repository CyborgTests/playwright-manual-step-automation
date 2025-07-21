const fs = require('fs');
const path = require('path');

const modulePath = require.resolve('@cyborgtests/test');
const moduleDir = path.dirname(modulePath);
const rootDir = path.resolve(moduleDir, '..');
const htmlPath = path.join(rootDir, 'control-panel-build', 'index.html');

// Generate simple UUID-like ID: timestamp + random hex
function generateId() {
  return (
    Date.now().toString(36) + // time-based prefix
    '-' +
    Math.random().toString(16).substring(2, 10) // random suffix
  );
}

try {
  const id = generateId();

  // Inject analytics ID into HTML
  if (fs.existsSync(htmlPath)) {
    let html = fs.readFileSync(htmlPath, 'utf-8');
    const script = `<script>window.ANALYTICS_USER_ID = "${id}";</script>`;
    
    // Check if analytics ID is already injected
    html = html.replace('</head>', `${script}</head>`);
    fs.writeFileSync(htmlPath, html, 'utf-8');
    
  } else {
    console.log('⚠️ HTML file not found at:', htmlPath);
  }
} catch (err) {
  console.error('❌ Failed to create or read analytics ID:', err);
}