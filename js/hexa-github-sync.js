// Sistema de Sincronização H.E.X.A via GitHub API
// Usa Issues do GitHub para sincronizar estado entre múltiplos clientes

class HexaGitHubSync {
    constructor() {
        this.isPolling = false;
        this.pollInterval = null;
        this.lastUpdate = Date.now();
        this.onStateUpdate = null;
        this.onLogUpdate = null;
        this.onConnect = null;
        this.onDisconnect = null;
        this.pollingDelay = 3000; // 3 segundos entre polls
        this.isConnected = false;
        
        this.init();
    }

    init() {
        // Verificar se a API GitHub está disponível
        if (window.hexaDatabase) {
            this.startPolling();
            this.isConnected = true;
            
            if (this.onConnect) {
                this.onConnect();
            }
            
            console.log('🔗 Conectado à sincronização via GitHub API');
        } else {
            console.error('❌ GitHub API não encontrada');
            this.enableOfflineMode();
        }
    }

    // Iniciar polling para verificar atualizações
    startPolling() {
        if (this.isPolling) return;
        
        this.isPolling = true;
        console.log('🔄 Iniciando polling de sincronização...');
        
        // Verificar imediatamente
        this.checkForUpdates();
        
        // Configurar polling periódico
        this.pollInterval = setInterval(() => {
            this.checkForUpdates();
        }, this.pollingDelay);
    }

    // Parar polling
    stopPolling() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
        this.isPolling = false;
        console.log('⏹️ Polling de sincronização parado');
    }

    // Verificar atualizações no GitHub
    async checkForUpdates() {
        try {
            // Carregar estado atual do combate
            const stateResult = await window.hexaDatabase.loadCombatState();
            if (stateResult.success && stateResult.combatState) {
                const serverTimestamp = new Date(stateResult.combatState.lastUpdate).getTime();
                
                // Se o estado no servidor for mais recente, atualizar
                if (serverTimestamp > this.lastUpdate) {
                    console.log('📥 Estado atualizado do GitHub');
                    this.lastUpdate = serverTimestamp;
                    
                    if (this.onStateUpdate) {
                        this.onStateUpdate(stateResult.combatState);
                    }
                }
            }

            // Carregar log de combate
            const logResult = await window.hexaDatabase.loadCombatLog();
            if (logResult.success && logResult.logEntries) {
                if (this.onLogUpdate) {
                    this.onLogUpdate(logResult.logEntries);
                }
            }

        } catch (error) {
            console.error('❌ Erro ao verificar atualizações:', error);
        }
    }

    // Métodos de sincronização
    async updateInitiative(initiative) {
        try {
            const currentState = await this.getCurrentState();
            if (currentState) {
                currentState.initiative = initiative;
                currentState.lastUpdate = new Date().toISOString();
                
                const result = await window.hexaDatabase.saveCombatState(currentState);
                if (result.success) {
                    this.lastUpdate = Date.now();
                    console.log('📤 Iniciativa sincronizada');
                }
            }
        } catch (error) {
            console.error('❌ Erro ao sincronizar iniciativa:', error);
        }
    }

    async nextTurn() {
        try {
            const currentState = await this.getCurrentState();
            if (currentState && currentState.initiative.length > 0) {
                currentState.currentTurn = (currentState.currentTurn + 1) % currentState.initiative.length;
                if (currentState.currentTurn === 0) {
                    currentState.round++;
                }
                currentState.lastUpdate = new Date().toISOString();
                
                const result = await window.hexaDatabase.saveCombatState(currentState);
                if (result.success) {
                    this.lastUpdate = Date.now();
                    
                    // Adicionar ao log
                    const currentCharacter = currentState.initiative[currentState.currentTurn];
                    await this.addLogEntry('turn', `Rodada ${currentState.round} - Vez de ${currentCharacter.name}`);
                    
                    console.log('📤 Próximo turno sincronizado');
                }
            }
        } catch (error) {
            console.error('❌ Erro ao avançar turno:', error);
        }
    }

    async startCombat() {
        try {
            const currentState = await this.getCurrentState() || {};
            currentState.isActive = true;
            currentState.round = 1;
            currentState.currentTurn = 0;
            currentState.lastUpdate = new Date().toISOString();
            
            const result = await window.hexaDatabase.saveCombatState(currentState);
            if (result.success) {
                this.lastUpdate = Date.now();
                await this.addLogEntry('turn', 'Combate iniciado!');
                console.log('📤 Combate iniciado e sincronizado');
            }
        } catch (error) {
            console.error('❌ Erro ao iniciar combate:', error);
        }
    }

    async endCombat() {
        try {
            const currentState = await this.getCurrentState() || {};
            currentState.isActive = false;
            currentState.initiative = [];
            currentState.currentTurn = 0;
            currentState.round = 1;
            currentState.lastUpdate = new Date().toISOString();
            
            const result = await window.hexaDatabase.saveCombatState(currentState);
            if (result.success) {
                this.lastUpdate = Date.now();
                await this.addLogEntry('turn', 'Combate finalizado!');
                console.log('📤 Combate finalizado e sincronizado');
            }
        } catch (error) {
            console.error('❌ Erro ao finalizar combate:', error);
        }
    }

    async updateTimer(duration, timeRemaining) {
        try {
            const currentState = await this.getCurrentState();
            if (currentState) {
                currentState.timerDuration = duration;
                currentState.timeRemaining = timeRemaining;
                currentState.lastUpdate = new Date().toISOString();
                
                const result = await window.hexaDatabase.saveCombatState(currentState);
                if (result.success) {
                    this.lastUpdate = Date.now();
                    console.log('📤 Timer sincronizado');
                }
            }
        } catch (error) {
            console.error('❌ Erro ao sincronizar timer:', error);
        }
    }

    async addLogEntry(logType, message) {
        try {
            const result = await window.hexaDatabase.addCombatLogEntry(logType, message);
            if (result.success) {
                console.log('📤 Entrada de log sincronizada');
            }
        } catch (error) {
            console.error('❌ Erro ao adicionar entrada de log:', error);
        }
    }

    async requestState() {
        await this.checkForUpdates();
    }

    // Utilitários
    async getCurrentState() {
        try {
            const result = await window.hexaDatabase.loadCombatState();
            return result.success ? result.combatState : null;
        } catch (error) {
            console.error('❌ Erro ao carregar estado atual:', error);
            return null;
        }
    }

    enableOfflineMode() {
        console.log('📴 Modo offline ativado - usando localStorage');
        this.isConnected = false;
        
        if (this.onDisconnect) {
            this.onDisconnect();
        }
    }

    disconnect() {
        this.stopPolling();
        this.isConnected = false;
    }

    // Configurar polling mais rápido para testes
    setPollingDelay(delay) {
        this.pollingDelay = delay;
        if (this.isPolling) {
            this.stopPolling();
            this.startPolling();
        }
    }
}

// Instância global do sistema de sincronização GitHub
let hexaGitHubSync = null;

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Esperar um pouco para garantir que hexaDatabase esteja disponível
    setTimeout(() => {
        hexaGitHubSync = new HexaGitHubSync();
        
        // Disponibilizar globalmente
        window.hexaGitHubSync = hexaGitHubSync;
        
        console.log('🔗 Sistema de sincronização GitHub H.E.X.A inicializado');
    }, 500);
});
