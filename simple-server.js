const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  console.log('Request:', req.url);
  
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Palate - Coffee Tasting Notes</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0; 
              padding: 20px; 
              background: #f9fafb;
              color: #374151;
            }
            .container {
              max-width: 400px;
              margin: 0 auto;
              text-align: center;
              padding: 40px 20px;
            }
            h1 { 
              font-size: 2.5rem; 
              margin-bottom: 10px;
              color: #111827;
            }
            p { 
              color: #6b7280; 
              margin-bottom: 40px;
            }
            .btn {
              display: block;
              width: 100%;
              padding: 12px 24px;
              margin: 16px 0;
              border: none;
              border-radius: 8px;
              font-size: 16px;
              font-weight: 600;
              text-decoration: none;
              cursor: pointer;
              transition: all 0.2s;
            }
            .btn-primary {
              background: #374151;
              color: white;
            }
            .btn-primary:hover {
              background: #1f2937;
            }
            .btn-secondary {
              background: #e5e7eb;
              color: #374151;
            }
            .btn-secondary:hover {
              background: #d1d5db;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Palate</h1>
            <p>커피 테이스팅 노트 아카이브</p>
            
            <a href="/capture" class="btn btn-primary">
              📸 새 테이스팅 노트 촬영
            </a>
            
            <a href="/notes" class="btn btn-secondary">
              📝 저장된 노트 보기
            </a>
          </div>
        </body>
      </html>
    `);
  } else if (req.url === '/capture') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>카메라 촬영 - Palate</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0; 
              padding: 20px; 
              background: #f9fafb;
              color: #374151;
            }
            .container {
              max-width: 400px;
              margin: 0 auto;
              text-align: center;
              padding: 40px 20px;
            }
            h1 { color: #111827; }
            .btn {
              display: inline-block;
              padding: 12px 24px;
              margin: 16px 8px;
              border: none;
              border-radius: 8px;
              font-size: 16px;
              font-weight: 600;
              text-decoration: none;
              cursor: pointer;
              background: #374151;
              color: white;
            }
            .btn:hover {
              background: #1f2937;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>카메라 촬영</h1>
            <p>카메라 기능은 HTTPS 환경에서만 동작합니다.</p>
            <p>Next.js 개발 서버를 사용하세요.</p>
            <a href="/" class="btn">← 홈으로</a>
          </div>
        </body>
      </html>
    `);
  } else if (req.url === '/notes') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>저장된 노트 - Palate</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0; 
              padding: 20px; 
              background: #f9fafb;
              color: #374151;
            }
            .container {
              max-width: 400px;
              margin: 0 auto;
              text-align: center;
              padding: 40px 20px;
            }
            h1 { color: #111827; }
            .btn {
              display: inline-block;
              padding: 12px 24px;
              margin: 16px 8px;
              border: none;
              border-radius: 8px;
              font-size: 16px;
              font-weight: 600;
              text-decoration: none;
              cursor: pointer;
              background: #374151;
              color: white;
            }
            .btn:hover {
              background: #1f2937;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>저장된 노트</h1>
            <p>아직 저장된 테이스팅 노트가 없습니다.</p>
            <a href="/" class="btn">← 홈으로</a>
          </div>
        </body>
      </html>
    `);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});