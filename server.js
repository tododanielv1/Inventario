const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const HOST = 'localhost';

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    let filePath = req.url === '/' ? '/InventarioPowerPlatform.html' : req.url;
    filePath = path.join(__dirname, filePath);

    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('Archivo no encontrado: ' + filePath);
            } else {
                res.writeHead(500);
                res.end('Error del servidor: ' + err.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, HOST, () => {
    console.log('\\n========================================');
    console.log('  PowerHub Server corriendo en:');
    console.log('  http://' + HOST + ':' + PORT);
    console.log('========================================\\n');
    console.log('Presiona Ctrl+C para detener el servidor.');
});
