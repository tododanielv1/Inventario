const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const HOST = 'localhost';
const BD_FILE = path.join(__dirname, 'BD.json');

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
    // API para guardar en tiempo real
    if (req.url === '/api/guardar' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const datos = JSON.parse(body);
                fs.writeFileSync(BD_FILE, JSON.stringify(datos, null, 2), 'utf-8');
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ mensaje: 'BD.json guardado correctamente', archivos: datos.length }));
                console.log('[API] Datos guardados en BD.json (' + datos.length + ' iniciativas)');
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
                console.error('[API] Error guardando:', err);
            }
        });
        return;
    }

    // API para cargar datos desde BD.json
    if (req.url === '/api/cargar' && req.method === 'GET') {
        try {
            if (!fs.existsSync(BD_FILE)) {
                // Si no existe BD.json, crear con array vacío
                fs.writeFileSync(BD_FILE, '[]', 'utf-8');
                console.log('[API] BD.json creado (vacío)');
            }
            const contenido = fs.readFileSync(BD_FILE, 'utf-8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(contenido);
            console.log('[API] Datos cargados desde BD.json');
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
            console.error('[API] Error cargando:', err);
        }
        return;
    }

    // Servir archivos estáticos
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
    console.log('  - Guardado en tiempo real: ACTIVO');
    console.log('  - Archivo BD.json: ' + BD_FILE);
    console.log('  Presiona Ctrl+C para detener el servidor.');
    console.log('========================================\\n');
});
