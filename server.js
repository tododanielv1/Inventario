const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const BD_PATH = path.join(__dirname, 'BD.json');

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // CORS headers para permitir peticiones locales
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);

    // --- API: CARGAR DATOS ---
    if (req.url === '/api/cargar' && req.method === 'GET') {
        if (fs.existsSync(BD_PATH)) {
            fs.readFile(BD_PATH, 'utf8', (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Error leyendo BD.json' }));
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(data);
                }
            });
        } else {
            // Si no existe, crea uno vacío automáticamente
            const emptyData = [];
            fs.writeFile(BD_PATH, JSON.stringify(emptyData, null, 2), () => {
                console.log('[API] BD.json creado automáticamente');
            });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(emptyData));
        }
        return;
    }

    // --- API: GUARDAR DATOS ---
    if (req.url === '/api/guardar' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const datos = JSON.parse(body);
                fs.writeFile(BD_PATH, JSON.stringify(datos, null, 2), 'utf8', (err) => {
                    if (err) {
                        console.error('[API] Error escribiendo:', err);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Error escribiendo BD.json' }));
                    } else {
                        console.log(`[API] ✅ Guardado exitoso (${datos.length} iniciativas)`);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true }));
                    }
                });
            } catch (e) {
                console.error('[API] JSON inválido:', e);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'JSON inválido' }));
            }
        });
        return;
    }

    // --- SERVIDOR DE ARCHIVOS ESTÁTICOS ---
    let filePath = req.url === '/' ? '/InventarioPowerPlatform.html' : req.url;
    filePath = path.join(__dirname, filePath);

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - Archivo no encontrado</h1><p>Verifica que InventarioPowerPlatform.html exista en la carpeta.</p>');
            } else {
                res.writeHead(500, { 'Content-Type': 'text/html' });
                res.end('<h1>500 - Error del servidor</h1>');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log('========================================');
    console.log(`  🚀 PowerHub Server corriendo en:`);
    console.log(`  👉 http://localhost:${PORT}`);
    console.log(`  📂 Ruta: ${__dirname}`);
    console.log('========================================');
});
