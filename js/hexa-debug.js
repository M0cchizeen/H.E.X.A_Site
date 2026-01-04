// Painel de Debug H.E.X.A
class HexaDebug {
    constructor() {
        this.isVisible = false;
        this.debugPanel = null;
        this.logEntries = [];
        this.maxLogEntries = 100;
    }

    init() {
        this.createDebugPanel();
        this.startMonitoring();
        console.log('🔍 Painel de debug H.E.X.A inicializado');
    }

    createDebugPanel() {
        // Botão de toggle
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'hexaDebugToggle';
        toggleBtn.innerHTML = '🔍 DEBUG';
        toggleBtn.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: linear-gradient(135deg, #ff0000 0%, #cc0000 100%);
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-family: 'Orbitron', monospace;
            font-size: 12px;
            z-index: 999999;
            transition: all 0.3s;
        `;
        toggleBtn.onclick = () => this.toggle();

        // Painel de debug
        const panel = document.createElement('div');
        panel.id = 'hexaDebugPanel';
        panel.style.cssText = `
            position: fixed;
            top: 50px;
            right: 10px;
            width: 400px;
            height: 500px;
            background: rgba(0, 0, 0, 0.95);
            border: 2px solid #ff0000;
            border-radius: 10px;
            padding: 15px;
            font-family: 'Orbitron', monospace;
            font-size: 11px;
            color: #ffffff;
            z-index: 999999;
            display: none;
            overflow: hidden;
            box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
        `;

        panel.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h3 style="color: #ff0000; margin: 0;">🔍 H.E.X.A DEBUG</h3>
                <button onclick="hexaDebug.clearLogs()" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 5px 10px; border-radius: 3px; cursor: pointer;">Limpar</button>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h4 style="color: #ff0000; margin-bottom: 5px;">📊 STATUS</h4>
                <div id="debugStatus" style="background: rgba(255,0,0,0.1); padding: 10px; border-radius: 5px;">
                    <div>🔐 Auth: <span id="authStatus">Verificando...</span></div>
                    <div>👤 User: <span id="userStatus">Verificando...</span></div>
                    <div>🌐 Sync: <span id="syncStatus">Verificando...</span></div>
                    <div>📡 API: <span id="apiStatus">Verificando...</span></div>
                    <div>👥 Users: <span id="usersStatus">0</span></div>
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h4 style="color: #ff0000; margin-bottom: 5px;">👥 USUÁRIOS CONECTADOS</h4>
                <div id="connectedUsers" style="background: rgba(0,255,0,0.1); padding: 10px; border-radius: 5px; max-height: 100px; overflow-y: auto;">
                    <div style="color: #888;">Nenhum usuário conectado</div>
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <h4 style="color: #ff0000; margin-bottom: 5px;">⚔️ ESTADO DO COMBATE</h4>
                <div id="combatState" style="background: rgba(0,0,255,0.1); padding: 10px; border-radius: 5px; font-size: 10px;">
                    <div>Ativo: <span id="combatActive">Não</span></div>
                    <div>Rodada: <span id="combatRound">1</span></div>
                    <div>Turno: <span id="combatTurn">0</span></div>
                    <div>Iniciativa: <span id="combatInitiative">[]</span></div>
                </div>
            </div>
            
            <div>
                <h4 style="color: #ff0000; margin-bottom: 5px;">📝 LOG DE EVENTOS</h4>
                <div id="debugLog" style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 5px; height: 200px; overflow-y: auto; font-family: monospace;">
                    <div style="color: #888;">Aguardando eventos...</div>
                </div>
            </div>
        `;

        document.body.appendChild(toggleBtn);
        document.body.appendChild(panel);
        
        this.debugPanel = panel;
    }

    toggle() {
        this.isVisible = !this.isVisible;
        if (this.debugPanel) {
            this.debugPanel.style.display = this.isVisible ? 'block' : 'none';
        }
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = {
            timestamp: timestamp,
            message: message,
            type: type
        };

        this.logEntries.unshift(logEntry);
        if (this.logEntries.length > this.maxLogEntries) {
            this.logEntries.pop();
        }

        this.updateLogDisplay();
    }

    updateLogDisplay() {
        const logContainer = document.getElementById('debugLog');
        if (logContainer) {
            logContainer.innerHTML = this.logEntries.map(entry => {
                const color = this.getLogColor(entry.type);
                return `<div style="color: ${color}; margin-bottom: 2px;">
                    [${entry.timestamp}] ${entry.message}
                </div>`;
            }).join('');
        }
    }

    getLogColor(type) {
        switch(type) {
            case 'error': return '#ff0000';
            case 'success': return '#00ff00';
            case 'warning': return '#ffff00';
            case 'info': return '#00ffff';
            default: return '#ffffff';
        }
    }

    clearLogs() {
        this.logEntries = [];
        this.updateLogDisplay();
    }

    startMonitoring() {
        // Monitorar status a cada 2 segundos
        setInterval(() => {
            this.updateStatus();
        }, 2000);

        // Monitorar usuários a cada 5 segundos
        setInterval(() => {
            this.updateConnectedUsers();
        }, 5000);

        // Monitorar combate a cada 3 segundos
        setInterval(() => {
            this.updateCombatState();
        }, 3000);
    }

    updateStatus() {
        // Auth
        const authStatus = document.getElementById('authStatus');
        if (authStatus) {
            if (typeof hexaAuth !== 'undefined') {
                authStatus.textContent = hexaAuth.isAuthenticated ? '✅ OK' : '❌ Não autenticado';
                authStatus.style.color = hexaAuth.isAuthenticated ? '#00ff00' : '#ff0000';
            } else {
                authStatus.textContent = '❌ Não carregado';
                authStatus.style.color = '#ff0000';
            }
        }

        // User
        const userStatus = document.getElementById('userStatus');
        if (userStatus) {
            if (typeof hexaUser !== 'undefined' && hexaUser.isIdentified) {
                userStatus.textContent = `✅ ${hexaUser.getUsername()}`;
                userStatus.style.color = '#00ff00';
            } else {
                userStatus.textContent = '❌ Não identificado';
                userStatus.style.color = '#ff0000';
            }
        }

        // Sync
        const syncStatus = document.getElementById('syncStatus');
        if (syncStatus) {
            if (typeof hexaSync !== 'undefined' && hexaSync) {
                syncStatus.textContent = hexaSync.isConnected ? '✅ Conectado' : '❌ Desconectado';
                syncStatus.style.color = hexaSync.isConnected ? '#00ff00' : '#ff0000';
            } else {
                syncStatus.textContent = '❌ Não carregado';
                syncStatus.style.color = '#ff0000';
            }
        }

        // API
        const apiStatus = document.getElementById('apiStatus');
        if (apiStatus) {
            this.testAPIConnection().then(status => {
                apiStatus.textContent = status ? '✅ OK' : '❌ Erro';
                apiStatus.style.color = status ? '#00ff00' : '#ff0000';
            });
        }
    }

    async testAPIConnection() {
        try {
            if (typeof hexaSync !== 'undefined' && hexaSync) {
                const response = await hexaSync.fetchWithAuth(
                    `https://api.github.com/repos/${hexaSync.repoOwner}/${hexaSync.repoName}/issues?state=open&per_page=1`
                );
                return response.ok;
            }
            return false;
        } catch (error) {
            return false;
        }
    }

    updateConnectedUsers() {
        const usersContainer = document.getElementById('connectedUsers');
        const usersStatus = document.getElementById('usersStatus');
        
        if (usersContainer && typeof hexaSync !== 'undefined' && hexaSync) {
            const users = hexaSync.getActiveUsers();
            
            if (users.length > 0) {
                usersContainer.innerHTML = users.map(user => `
                    <div style="display: flex; align-items: center; margin-bottom: 5px;">
                        <div style="width: 10px; height: 10px; background: ${user.color || '#007bff'}; border-radius: 50%; margin-right: 10px;"></div>
                        <div style="flex: 1;">
                            <div style="color: ${user.color || '#007bff'}; font-weight: bold;">${user.username || 'Anônimo'}</div>
                            <div style="color: #888; font-size: 9px;">${new Date(user.lastSeen).toLocaleTimeString()}</div>
                        </div>
                    </div>
                `).join('');
                
                usersStatus.textContent = users.length;
                usersStatus.style.color = '#00ff00';
            } else {
                usersContainer.innerHTML = '<div style="color: #888;">Nenhum usuário conectado</div>';
                usersStatus.textContent = '0';
                usersStatus.style.color = '#ffff00';
            }
        }
    }

    updateCombatState() {
        if (typeof hexaSync !== 'undefined' && hexaSync) {
            const combat = hexaSync.getCombatState();
            
            const combatActive = document.getElementById('combatActive');
            const combatRound = document.getElementById('combatRound');
            const combatTurn = document.getElementById('combatTurn');
            const combatInitiative = document.getElementById('combatInitiative');
            
            if (combatActive) {
                combatActive.textContent = combat.isActive ? '✅ Sim' : '❌ Não';
                combatActive.style.color = combat.isActive ? '#00ff00' : '#ff0000';
            }
            
            if (combatRound) {
                combatRound.textContent = combat.currentRound || 1;
            }
            
            if (combatTurn) {
                combatTurn.textContent = combat.currentTurn || 0;
            }
            
            if (combatInitiative) {
                combatInitiative.textContent = JSON.stringify(combat.initiative || []);
            }
        }
    }

    // Sobrescrever console.log para capturar eventos
    interceptConsole() {
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        
        console.log = (...args) => {
            originalLog.apply(console, args);
            this.log(args.join(' '), 'info');
        };
        
        console.error = (...args) => {
            originalError.apply(console, args);
            this.log(args.join(' '), 'error');
        };
        
        console.warn = (...args) => {
            originalWarn.apply(console, args);
            this.log(args.join(' '), 'warning');
        };
    }
}

// Criar instância global
const hexaDebug = new HexaDebug();
window.hexaDebug = hexaDebug;

// Inicializar quando carregar
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        hexaDebug.init();
        hexaDebug.interceptConsole();
        hexaDebug.log('Painel de debug inicializado', 'success');
    }, 1000);
});
