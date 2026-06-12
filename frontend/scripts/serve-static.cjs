const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const port = Number(process.env.PORT ?? 4200);
const root = path.resolve(__dirname, '../dist/sqs/browser');

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

function resolveFile(requestUrl) {
  const urlPath = decodeURIComponent((requestUrl ?? '/').split('?')[0]);
  const requestedPath = urlPath === '/' ? 'index.html' : urlPath;
  const filePath = path.resolve(root, `.${requestedPath}`);

  if (!filePath.startsWith(root) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    return path.join(root, 'index.html');
  }

  return filePath;
}

const server = http.createServer((request, response) => {
  const filePath = resolveFile(request.url);
  response.setHeader('Content-Type', contentTypes[path.extname(filePath)] ?? 'application/octet-stream');
  fs.createReadStream(filePath).pipe(response);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`SQS frontend available at http://localhost:${port}`);
});
