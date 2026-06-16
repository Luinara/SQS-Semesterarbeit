const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const port = Number(process.env.PORT ?? 4200);
const root = fs.realpathSync(path.resolve(__dirname, '../dist/sqs/browser'));
const fallbackFile = path.join(root, 'index.html');

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

function resolveFile(requestUrl) {
  let urlPath;

  try {
    urlPath = decodeURIComponent(new URL(requestUrl ?? '/', 'http://localhost').pathname);
  } catch {
    return fallbackFile;
  }

  const requestedPath = urlPath === '/' ? '/index.html' : urlPath;
  const filePath = path.resolve(root, `.${requestedPath}`);
  let canonicalPath;

  try {
    canonicalPath = fs.realpathSync(filePath);
  } catch {
    return fallbackFile;
  }

  const relativePath = path.relative(root, canonicalPath);
  const isInsideRoot =
    relativePath === '' || (!relativePath.startsWith('..') && !path.isAbsolute(relativePath));

  if (!isInsideRoot || fs.statSync(canonicalPath).isDirectory()) {
    return fallbackFile;
  }

  return canonicalPath;
}

const server = http.createServer((request, response) => {
  const filePath = resolveFile(request.url);
  response.setHeader('Content-Type', contentTypes[path.extname(filePath)] ?? 'application/octet-stream');
  fs.createReadStream(filePath).pipe(response);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`SQS frontend available at http://localhost:${port}`);
});
