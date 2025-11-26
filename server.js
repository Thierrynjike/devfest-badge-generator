const http = require('http');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PORT = 8080;

// MIME types for static files
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.json': 'application/json'
};

const server = http.createServer(async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Handle PNG conversion endpoint
    if (req.method === 'POST' && req.url === '/convert-to-png') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const { svg, width, height } = JSON.parse(body);
                
                // Convert SVG to PNG using sharp
                const pngBuffer = await sharp(Buffer.from(svg))
                    .resize(width, height)
                    .png()
                    .toBuffer();

                res.writeHead(200, {
                    'Content-Type': 'image/png',
                    'Content-Length': pngBuffer.length
                });
                res.end(pngBuffer);
            } catch (error) {
                console.error('Conversion error:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            }
        });
        return;
    }

    // Serve static files
    let filePath = req.url === '/' ? '/index.html' : req.url;
    
    // Remove query string if present
    filePath = filePath.split('?')[0];
    
    const fullPath = path.join(__dirname, filePath);
    const ext = path.extname(fullPath);

    // Security: prevent directory traversal
    if (!fullPath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    fs.readFile(fullPath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('Not Found');
            } else {
                res.writeHead(500);
                res.end('Server Error');
            }
            return;
        }

        const contentType = mimeTypes[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Badge Generator Server running at http://localhost:${PORT}`);
    console.log(`   - Static files served from current directory`);
    console.log(`   - PNG conversion endpoint: POST /convert-to-png`);
});
