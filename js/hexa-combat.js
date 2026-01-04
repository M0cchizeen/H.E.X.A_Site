// Sistema de Combate Sincronizado H.E.X.A via GitHub API
// Integra com GitHub API para sincronização entre múltiplos clientes

class HexaCombatSystem {
    constructor() {
        this.currentCombatState = {
            initiative: [],
            currentTurn: 0,
            round: 1,
            timerDuration: 60,
            timeRemaining: 60,
            combatLog: [],
            isActive: false,
            lastUpdate: new Date().toISOString()
        };
        
        this.timerInterval = null;
        this.isInitialized = false;
        
        this.init();
    }

    init() {
        // Esperar o sistema de sincronização GitHub estar disponível
        const checkSync = () => {
            if (window.hexaGitHubSync) {
                this.setupGitHubSyncHandlers();
                this.setupEventListeners();
                this.isInitialized = true;
                console.log('⚔️ Sistema de combate sincronizado via GitHub inicializado');
            } else {
                setTimeout(checkSync, 100);
            }
        };
        
        checkSync();
    }

    setupGitHubSyncHandlers() {
        // Configurar handlers para receber atualizações do GitHub
        window.hexaGitHubSync.onStateUpdate = (state) => {
            this.updateCombatState(state);
        };

        window.hexaGitHubSync.onLogUpdate = (logEntries) => {
            this.updateCombatLog(logEntries);
        };

        window.hexaGitHubSync.onConnect = () => {
            console.log('🔗 Conectado à sincronização GitHub');
            this.showSyncStatus('Conectado GitHub', 'success');
            // Solicitar estado atual ao conectar
            window.hexaGitHubSync.requestState();
        };

        window.hexaGitHubSync.onDisconnect = () => {
            console.log('🔌 Desconectado da sincronização GitHub');
            this.showSyncStatus('Desconectado', 'warning');
        };
    }

    setupEventListeners() {
        // Botões de controle de combate
        const startCombatBtn = document.getElementById('startCombatBtn');
        const endCombatBtn = document.getElementById('endCombatBtn');
        const nextTurnBtn = document.getElementById('nextTurnBtn');

        if (startCombatBtn) {
            startCombatBtn.addEventListener('click', () => this.startCombat());
        }

        if (endCombatBtn) {
            endCombatBtn.addEventListener('click', () => this.endCombat());
        }

        if (nextTurnBtn) {
            nextTurnBtn.addEventListener('click', () => this.nextTurn());
        }

        // Timer controls
        const timerDurationInput = document.getElementById('timerDuration');
        if (timerDurationInput) {
            timerDurationInput.addEventListener('change', (e) => {
                this.currentCombatState.timerDuration = parseInt(e.target.value) || 60;
                this.syncTimer();
            });
        }

        // Iniciativa drag and drop
        this.setupInitiativeDragDrop();
    }

    setupInitiativeDragDrop() {
        const initiativeList = document.getElementById('initiativeList');
        if (!initiativeList) return;

        // Configurar drag and drop para reordenar iniciativa
        new Sortable(initiativeList, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            onEnd: (evt) => {
                this.reorderInitiative(evt.oldIndex, evt.newIndex);
            }
        });
    }

    // Métodos de sincronização
    updateCombatState(state) {
        this.currentCombatState = { ...state };
        this.updateUI();
        console.log('📥 Estado do combate atualizado do GitHub:', state);
    }

    updateCombatLog(logEntries) {
        this.currentCombatState.combatLog = logEntries;
        this.updateLogUI();
        console.log('📥 Log de combate atualizado do GitHub');
    }

    async syncInitiative() {
        if (window.hexaGitHubSync && window.hexaGitHubSync.isConnected) {
            await window.hexaGitHubSync.updateInitiative(this.currentCombatState.initiative);
        }
    }

    async syncTimer() {
        if (window.hexaGitHubSync && window.hexaGitHubSync.isConnected) {
            await window.hexaGitHubSync.updateTimer(
                this.currentCombatState.timerDuration,
                this.currentCombatState.timeRemaining
            );
        }
    }

    // Métodos de controle de combate
    async startCombat() {
        this.currentCombatState.isActive = true;
        this.currentCombatState.round = 1;
        this.currentCombatState.currentTurn = 0;
        this.currentCombatState.timeRemaining = this.currentCombatState.timerDuration;
        this.currentCombatState.lastUpdate = new Date().toISOString();

        if (window.hexaGitHubSync && window.hexaGitHubSync.isConnected) {
            await window.hexaGitHubSync.startCombat();
        } else {
            this.addLogEntry('turn', 'Combate iniciado (modo offline)');
        }

        this.startTimer();
        this.updateUI();
        this.showNotification('⚔️ Combate iniciado!', 'success');
    }

    async endCombat() {
        this.currentCombatState.isActive = false;
        this.currentCombatState.initiative = [];
        this.currentCombatState.currentTurn = 0;
        this.currentCombatState.round = 1;
        this.currentCombatState.lastUpdate = new Date().toISOString();

        if (window.hexaGitHubSync && window.hexaGitHubSync.isConnected) {
            await window.hexaGitHubSync.endCombat();
        } else {
            this.addLogEntry('turn', 'Combate finalizado (modo offline)');
        }

        this.stopTimer();
        this.updateUI();
        this.showNotification('🏁 Combate finalizado!', 'info');
    }

    async nextTurn() {
        if (this.currentCombatState.initiative.length === 0) {
            this.showNotification('⚠️ Nenhum personagem na iniciativa!', 'warning');
            return;
        }

        if (window.hexaGitHubSync && window.hexaGitHubSync.isConnected) {
            await window.hexaGitHubSync.nextTurn();
        } else {
            // Modo offline
            this.currentCombatState.currentTurn = (this.currentCombatState.currentTurn + 1) % this.currentCombatState.initiative.length;
            if (this.currentCombatState.currentTurn === 0) {
                this.currentCombatState.round++;
            }
            this.currentCombatState.timeRemaining = this.currentCombatState.timerDuration;
            
            const currentCharacter = this.currentCombatState.initiative[this.currentCombatState.currentTurn];
            this.addLogEntry('turn', `Rodada ${this.currentCombatState.round} - Vez de ${currentCharacter.name}`);
            this.updateUI();
        }
    }

    // Métodos de iniciativa
    addToInitiative(character) {
        const initiativeItem = {
            id: Date.now().toString(),
            name: character.name,
            initiative: character.initiative || 10,
            hp: character.hp || { current: 100, max: 100 },
            type: character.type || 'player',
            avatar: character.avatar || '👤'
        };

        this.currentCombatState.initiative.push(initiativeItem);
        this.currentCombatState.initiative.sort((a, b) => b.initiative - a.initiative);
        
        this.syncInitiative();
        this.updateInitiativeUI();
        
        this.addLogEntry('turn', `${character.name} entrou na ordem de iniciativa`);
        this.showNotification(`${character.name} adicionado à iniciativa!`, 'success');
    }

    removeFromInitiative(id) {
        const index = this.currentCombatState.initiative.findIndex(item => item.id === id);
        if (index !== -1) {
            const removed = this.currentCombatState.initiative.splice(index, 1)[0];
            this.syncInitiative();
            this.updateInitiativeUI();
            
            this.addLogEntry('turn', `${removed.name} saiu da ordem de iniciativa`);
            this.showNotification(`${removed.name} removido da iniciativa!`, 'info');
        }
    }

    reorderInitiative(oldIndex, newIndex) {
        const item = this.currentCombatState.initiative.splice(oldIndex, 1)[0];
        this.currentCombatState.initiative.splice(newIndex, 0, item);
        this.syncInitiative();
        this.updateInitiativeUI();
    }

    // Métodos de timer
    startTimer() {
        this.stopTimer();
        this.timerInterval = setInterval(() => {
            if (this.currentCombatState.timeRemaining > 0) {
                this.currentCombatState.timeRemaining--;
                this.updateTimerUI();
                
                if (this.currentCombatState.timeRemaining === 0) {
                    this.nextTurn();
                }
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    // Métodos de log
    async addLogEntry(logType, message) {
        const logEntry = {
            type: logType,
            message: message,
            timestamp: new Date().toISOString(),
            id: Date.now()
        };

        this.currentCombatState.combatLog.unshift(logEntry);
        
        // Manter apenas as últimas 50 entradas
        if (this.currentCombatState.combatLog.length > 50) {
            this.currentCombatState.combatLog = this.currentCombatState.combatLog.slice(0, 50);
        }

        if (window.hexaGitHubSync && window.hexaGitHubSync.isConnected) {
            await window.hexaGitHubSync.addLogEntry(logType, message);
        }

        this.updateLogUI();
    }

    // Métodos de UI
    updateUI() {
        this.updateInitiativeUI();
        this.updateTimerUI();
        this.updateLogUI();
        this.updateCombatInfo();
    }

    updateInitiativeUI() {
        const initiativeList = document.getElementById('initiativeList');
        if (!initiativeList) return;

        initiativeList.innerHTML = '';

        this.currentCombatState.initiative.forEach((item, index) => {
            const isActive = index === this.currentCombatState.currentTurn;
            const isNext = index === (this.currentCombatState.currentTurn + 1) % this.currentCombatState.initiative.length;

            const itemElement = document.createElement('div');
            itemElement.className = `initiative-item ${isActive ? 'active' : ''} ${isNext ? 'next' : ''}`;
            itemElement.dataset.id = item.id;
            itemElement.draggable = true;

            itemElement.innerHTML = `
                <div class="initiative-avatar">${item.avatar}</div>
                <div class="initiative-info">
                    <div class="initiative-name">${item.name}</div>
                    <div class="initiative-stats">
                        <span>HP: ${item.hp.current}/${item.hp.max}</span>
                        <span class="initiative-value">${item.initiative}</span>
                    </div>
                </div>
                <button class="remove-initiative-btn" onclick="hexaCombat.removeFromInitiative('${item.id}')">×</button>
            `;

            initiativeList.appendChild(itemElement);
        });
    }

    updateTimerUI() {
        const timerDisplay = document.getElementById('timerDisplay');
        const turnDisplay = document.getElementById('turnDisplay');
        const roundDisplay = document.getElementById('roundDisplay');

        if (timerDisplay) {
            timerDisplay.textContent = this.formatTime(this.currentCombatState.timeRemaining);
        }

        if (turnDisplay) {
            const currentCharacter = this.currentCombatState.initiative[this.currentCombatState.currentTurn];
            turnDisplay.textContent = currentCharacter ? currentCharacter.name : 'N/A';
        }

        if (roundDisplay) {
            roundDisplay.textContent = this.currentCombatState.round;
        }
    }

    updateLogUI() {
        const logContent = document.getElementById('logContent');
        if (!logContent) return;

        logContent.innerHTML = '';

        this.currentCombatState.combatLog.forEach(entry => {
            const logElement = document.createElement('div');
            logElement.className = `log-entry ${entry.type}`;
            
            const timestamp = new Date(entry.timestamp).toLocaleTimeString();
            logElement.innerHTML = `
                <small>${timestamp}</small>
                ${entry.message}
            `;

            logContent.appendChild(logElement);
        });
    }

    updateCombatInfo() {
        const combatStatus = document.getElementById('combatStatus');
        if (combatStatus) {
            combatStatus.textContent = this.currentCombatState.isActive ? 'EM COMBATE' : 'FORA DE COMBATE';
            combatStatus.className = this.currentCombatState.isActive ? 'combat-active' : 'combat-inactive';
        }
    }

    // Utilitários
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    showNotification(message, type = 'info') {
        // Implementar notificação visual
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    showSyncStatus(status, type) {
        const syncIndicator = document.getElementById('syncStatus');
        if (syncIndicator) {
            syncIndicator.textContent = status;
            syncIndicator.className = `sync-status ${type}`;
        }
    }
}

// Instância global do sistema de combate
let hexaCombat = null;

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    hexaCombat = new HexaCombatSystem();
    
    // Disponibilizar globalmente
    window.hexaCombat = hexaCombat;
    
    console.log('⚔️ Sistema de combate H.E.X.A carregado');
});
