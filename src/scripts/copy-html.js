import { copyFileSync } from 'fs';
import { resolve } from 'path';

const args = process.argv.slice(2);
const mode = args[0]; // e.g. "app" or "generator"

const files = {
  app: 'src/control-panel-ui/index.html',
  generator: 'src/test-generator/index.html',
};

if (!files[mode]) {
  console.error(`❌ Unknown mode: ${mode}`);
  process.exit(1);
}

const source = resolve(files[mode]);
const destination = resolve('index.html');

try {
  copyFileSync(source, destination);
  console.log(`✅ Copied ${mode} → index.html`);
} catch (err) {
  console.error('❌ Failed to copy HTML:', err);
  process.exit(1);
}