// Servidor WebSocket para sincronização em tempo real do H.E.X.A
// Execute: node server.js

const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Estado compartilhado do combate
const combatState = {
    initiative: [],
    currentTurn: 0,
    round: 1,
    timer: null,
    timerDuration: 60,
    timeRemaining: 60,
    combatLog: [],
    isActive: false,
    lastUpdate: Date.now()
};

// Clientes conectados
const clients = new Set();

// Criar servidor HTTP
const server = http.createServer((req, res) => {
    // Servir arquivos estáticos
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm'
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// Criar servidor WebSocket
const wss = new WebSocket.Server({ server });

// Broadcast para todos os clientes
function broadcast(data, excludeClient = null) {
    const message = JSON.stringify(data);
    clients.forEach(client => {
        if (client !== excludeClient && client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// Lidar com conexões WebSocket
wss.on('connection', (ws) => {
    console.log('Novo cliente conectado');
    clients.add(ws);

    // Enviar estado atual do combate para o novo cliente
    ws.send(JSON.stringify({
        type: 'combat_state',
        data: combatState
    }));

    // Lidar com mensagens do cliente
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            
            switch (data.type) {
                case 'update_initiative':
                    combatState.initiative = data.data;
                    combatState.lastUpdate = Date.now();
                    broadcast({
                        type: 'combat_state',
                        data: combatState
                    }, ws);
                    break;

                case 'next_turn':
                    if (combatState.initiative.length > 0) {
                        combatState.currentTurn = (combatState.currentTurn + 1) % combatState.initiative.length;
                        if (combatState.currentTurn === 0) {
                            combatState.round++;
                        }
                        combatState.lastUpdate = Date.now();
                        
                        // Adicionar ao log
                        const currentCharacter = combatState.initiative[combatState.currentTurn];
                        addToLog(`turn`, `Rodada ${combatState.round} - Vez de ${currentCharacter.name}`);
                        
                        broadcast({
                            type: 'combat_state',
                            data: combatState
                        }, ws);
                    }
                    break;

                case 'start_combat':
                    combatState.isActive = true;
                    combatState.round = 1;
                    combatState.currentTurn = 0;
                    combatState.lastUpdate = Date.now();
                    
                    addToLog('turn', 'Combate iniciado!');
                    broadcast({
                        type: 'combat_state',
                        data: combatState
                    }, ws);
                    break;

                case 'end_combat':
                    combatState.isActive = false;
                    combatState.initiative = [];
                    combatState.currentTurn = 0;
                    combatState.round = 1;
                    combatState.lastUpdate = Date.now();
                    
                    addToLog('turn', 'Combate finalizado!');
                    broadcast({
                        type: 'combat_state',
                        data: combatState
                    }, ws);
                    break;

                case 'update_timer':
                    combatState.timerDuration = data.data.duration;
                    combatState.timeRemaining = data.data.timeRemaining;
                    combatState.lastUpdate = Date.now();
                    broadcast({
                        type: 'combat_state',
                        data: combatState
                    }, ws);
                    break;

                case 'add_log_entry':
                    addToLog(data.data.logType, data.data.message);
                    broadcast({
                        type: 'combat_state',
                        data: combatState
                    }, ws);
                    break;

                case 'request_state':
                    ws.send(JSON.stringify({
                        type: 'combat_state',
                        data: combatState
                    }));
                    break;
            }
        } catch (error) {
            console.error('Erro ao processar mensagem:', error);
        }
    });

    // Lidar com desconexão
    ws.on('close', () => {
        console.log('Cliente desconectado');
        clients.delete(ws);
    });

    ws.on('error', (error) => {
        console.error('Erro WebSocket:', error);
        clients.delete(ws);
    });
});

// Função para adicionar entradas ao log
function addToLog(logType, message) {
    const logEntry = {
        type: logType,
        message: message,
        timestamp: new Date().toISOString(),
        id: Date.now()
    };
    
    combatState.combatLog.unshift(logEntry);
    
    // Manter apenas as últimas 50 entradas
    if (combatState.combatLog.length > 50) {
        combatState.combatLog = combatState.combatLog.slice(0, 50);
    }
}

// Timer do servidor (opcional - para sincronização precisa)
setInterval(() => {
    if (combatState.isActive && combatState.timeRemaining > 0) {
        combatState.timeRemaining--;
        
        if (combatState.timeRemaining === 0) {
            // Passar para o próximo turno automaticamente
            if (combatState.initiative.length > 0) {
                combatState.currentTurn = (combatState.currentTurn + 1) % combatState.initiative.length;
                if (combatState.currentTurn === 0) {
                    combatState.round++;
                }
                combatState.timeRemaining = combatState.timerDuration;
                
                const currentCharacter = combatState.initiative[combatState.currentTurn];
                addToLog('turn', `Tempo esgotado! Rodada ${combatState.round} - Vez de ${currentCharacter.name}`);
            }
        }
        
        broadcast({
            type: 'timer_update',
            data: {
                timeRemaining: combatState.timeRemaining,
                currentTurn: combatState.currentTurn,
                round: combatState.round
            }
        });
    }
}, 1000);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Servidor H.E.X.A rodando em http://localhost:${PORT}`);
    console.log(`📡 WebSocket server ativo para sincronização em tempo real`);
    console.log(`📝 Acesse o painel de combate em http://localhost:${PORT}/index.html`);
    console.log(`🌐 Acesse o social em http://localhost:${PORT}/hexa-social.html`);
});
