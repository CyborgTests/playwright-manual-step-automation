import { ChildProcess } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { config } from '../config';

const modulePath = require.resolve('@cyborgtests/test');
const moduleDir = path.dirname(modulePath);
const rootDir = path.resolve(moduleDir, '..');

export async function startServer(port: number): Promise<ChildProcess> {
  const appBuildPath = path.join(rootDir, 'control-panel-build');

  // Create a custom server
  const server = http.createServer((req, res) => {
    const url = req.url || '/';
    const filePath = path.join(appBuildPath, url === '/' ? 'index.html' : url);

    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }

      // Get file extension for content type
      const ext = path.extname(filePath).toLowerCase();
      const contentType = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
      }[ext] || 'application/octet-stream';

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end('Error loading file');
          return;
        }

        if (ext === '.html') {
          const html = data.toString();
          const configScript = `<script>window.ENABLE_ANALYTICS = ${config.analyticsEnabled};</script>`;
          const modifiedHtml = html.replace('</head>', `${configScript}</head>`);
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(modifiedHtml);
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(data);
        }
      });
    });
  });

  // Try to start server on the requested port, if busy try next available port
  let currentPort = port;
  const maxPortAttempts = 10;
  
  for (let i = 0; i < maxPortAttempts; i++) {
    try {
      await new Promise<void>((resolve, reject) => {
        server.once('error', (err: NodeJS.ErrnoException) => {
          if (err.code === 'EADDRINUSE') {
            currentPort = port + i + 1;
            reject(err);
          } else {
            reject(err);
          }
        });
        server.listen(currentPort, () => {
          console.log(`Server started on port ${currentPort}`);
          config.setConfig({
            uiPort: currentPort,
          });
          resolve();
        });
      });
      break;
    } catch (err) {
      if (i === maxPortAttempts - 1) {
        throw new Error(`Failed to start server after ${maxPortAttempts} attempts`);
      }
      // Port is busy, try next port
      continue;
    }
  }

  await waitForServer(currentPort);

  // Create a ChildProcess-like object that wraps the http server
  const serverProcess = {
    kill: () => {
      server.close();
    }
  } as ChildProcess;

  return serverProcess;
}

async function waitForServer(port: number, maxAttempts = 10): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await new Promise<void>((resolve, reject) => {
        http.get(`http://localhost:${port}`, (res) => {
          if (res.statusCode === 200) {
            console.log('Server is ready!');
            resolve();
          } else {
            reject(new Error(`Server returned ${res.statusCode}`));
          }
        }).on('error', reject);
      });
      return;
    } catch (err) {
      if (i === maxAttempts - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
} 