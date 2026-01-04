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
            this.isConnected = true;
            this.startPolling();
            
            if (this.onConnect) {
                this.onConnect();
            }
            
            console.log('🔗 Conectado à sincronização via GitHub API');
        } else {
            console.error('❌ GitHub API não encontrada');
            this.enableOfflineMode();
        }
    }

    enableOfflineMode() {
        console.log('📴 GitHub API desconectada - BLOQUEANDO SITE...');
        this.isConnected = false;
        
        // Bloquear completamente o site
        this.blockSite();
        
        if (this.onDisconnect) {
            this.onDisconnect();
        }
    }

    blockSite() {
        console.log('🚫 Site bloqueado - GitHub API não disponível');
        
        // Remover todo o conteúdo do body
        document.body.innerHTML = '';
        
        // Criar tela de bloqueio
        const blockScreen = document.createElement('div');
        blockScreen.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            color: #fff;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            z-index: 99999;
        `;
        
        blockScreen.innerHTML = `
            <div style="text-align: center; max-width: 600px; padding: 40px;">
                <div style="font-size: 4rem; margin-bottom: 20px;">🔒</div>
                <h1 style="color: #ff4444; margin-bottom: 20px; font-size: 2.5rem;">H.E.X.A BLOQUEADO</h1>
                <p style="font-size: 1.2rem; margin-bottom: 30px; opacity: 0.8;">
                    O sistema de sincronização via GitHub API não está disponível.
                </p>
                <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin-bottom: 30px;">
                    <h3 style="color: #ffaa00; margin-bottom: 15px;">🔧 Soluções:</h3>
                    <ul style="text-align: left; list-style: none; padding: 0;">
                        <li style="margin-bottom: 10px;">✅ Verifique sua conexão com a internet</li>
                        <li style="margin-bottom: 10px;">✅ Verifique se o repositório GitHub está acessível</li>
                        <li style="margin-bottom: 10px;">✅ Configure um token GitHub API se necessário</li>
                        <li style="margin-bottom: 10px;">✅ Tente recarregar a página em alguns minutos</li>
                    </ul>
                </div>
                <div style="font-size: 0.9rem; opacity: 0.6;">
                    <p>Erro: GitHub API 401/403 - Sem autenticação ou acesso negado</p>
                    <p style="margin-top: 10px;">Repositório: M0cchizeen/H.E.X.A_Site</p>
                </div>
                <button onclick="location.reload()" style="
                    margin-top: 30px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: none;
                    color: white;
                    padding: 15px 30px;
                    border-radius: 25px;
                    font-size: 1.1rem;
                    cursor: pointer;
                    transition: transform 0.2s;
                " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    🔄 TENTAR NOVAMENTE
                </button>
            </div>
        `;
        
        document.body.appendChild(blockScreen);
        
        // Parar todos os scripts
        throw new Error('H.E.X.A Site bloqueado - GitHub API não disponível');
    }

    showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
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
            console.log('🔍 Verificando atualizações no GitHub...');
            
            // Carregar estado atual do combate
            const stateResult = await window.hexaDatabase.loadCombatState();
            console.log('📊 Resultado do estado:', stateResult);
            
            if (stateResult.success && stateResult.combatState) {
                const serverTimestamp = new Date(stateResult.combatState.lastUpdate).getTime();
                const localTimestamp = this.lastUpdate;
                
                console.log('⏰ Timestamps - Servidor:', serverTimestamp, 'Local:', localTimestamp);
                
                // Se o estado no servidor for mais recente, atualizar
                if (serverTimestamp > localTimestamp) {
                    console.log('📥 Estado mais recente encontrado no GitHub, atualizando...');
                    this.lastUpdate = serverTimestamp;
                    
                    if (this.onStateUpdate) {
                        this.onStateUpdate(stateResult.combatState);
                    }
                } else {
                    console.log('📥 Estado local está atualizado');
                }
            }

            // Carregar log de combate
            const logResult = await window.hexaDatabase.loadCombatLog();
            console.log('📊 Resultado do log:', logResult);
            
            if (logResult.success && logResult.logEntries) {
                if (this.onLogUpdate) {
                    this.onLogUpdate(logResult.logEntries);
                }
            }

        } catch (error) {
            console.error('❌ Erro ao verificar atualizações:', error);
            
            // Se for erro de autenticação, bloquear o site
            if (error.message && (error.message.includes('401') || error.message.includes('403'))) {
                console.error('🔒 Erro de autenticação detectado - BLOQUEANDO SITE...');
                this.blockSite();
            }
        }
    }

    // Métodos de sincronização
    async updateInitiative(initiative) {
        if (!this.isConnected) {
            console.error('❌ Impossível sincronizar - GitHub API desconectada');
            this.blockSite();
            return;
        }

        try {
            console.log('🔄 Sincronizando iniciativa:', initiative);
            
            const currentState = await this.getCurrentState();
            if (currentState) {
                currentState.initiative = initiative;
                currentState.lastUpdate = new Date().toISOString();
                
                console.log('💾 Salvando estado no GitHub...');
                const result = await window.hexaDatabase.saveCombatState(currentState);
                if (result.success) {
                    this.lastUpdate = Date.now();
                    console.log('✅ Iniciativa sincronizada com sucesso via GitHub');
                } else {
                    console.error('❌ Falha ao sincronizar iniciativa via GitHub:', result.error);
                    throw new Error(result.error);
                }
            }
            
        } catch (error) {
            console.error('❌ Erro ao sincronizar iniciativa:', error);
            this.blockSite();
        }
    }

    async nextTurn() {
        try {
            console.log('⏭️ Avançando turno...');
            const currentState = await this.getCurrentState();
            if (currentState && currentState.initiative.length > 0) {
                currentState.currentTurn = (currentState.currentTurn + 1) % currentState.initiative.length;
                if (currentState.currentTurn === 0) {
                    currentState.round++;
                }
                currentState.lastUpdate = new Date().toISOString();
                
                console.log('💾 Salvando estado no GitHub...');
                const result = await window.hexaDatabase.saveCombatState(currentState);
                if (result.success) {
                    this.lastUpdate = Date.now();
                    
                    // Adicionar ao log
                    const currentCharacter = currentState.initiative[currentState.currentTurn];
                    await this.addLogEntry('turn', `Rodada ${currentState.round} - Vez de ${currentCharacter.name}`);
                    
                    console.log('✅ Próximo turno sincronizado com sucesso');
                } else {
                    console.error('❌ Falha ao sincronizar próximo turno:', result.error);
                }
            }
        } catch (error) {
            console.error('❌ Erro ao avançar turno:', error);
        }
    }

    async startCombat() {
        try {
            console.log('⚔️ Iniciando combate...');
            const currentState = await this.getCurrentState() || {};
            currentState.isActive = true;
            currentState.round = 1;
            currentState.currentTurn = 0;
            currentState.lastUpdate = new Date().toISOString();
            
            console.log('💾 Salvando estado no GitHub...');
            const result = await window.hexaDatabase.saveCombatState(currentState);
            if (result.success) {
                this.lastUpdate = Date.now();
                await this.addLogEntry('turn', 'Combate iniciado!');
                console.log('✅ Combate iniciado e sincronizado com sucesso');
            } else {
                console.error('❌ Falha ao iniciar combate:', result.error);
            }
        } catch (error) {
            console.error('❌ Erro ao iniciar combate:', error);
        }
    }

    async endCombat() {
        try {
            console.log('🏁 Finalizando combate...');
            const currentState = await this.getCurrentState() || {};
            currentState.isActive = false;
            currentState.initiative = [];
            currentState.currentTurn = 0;
            currentState.round = 1;
            currentState.lastUpdate = new Date().toISOString();
            
            console.log('💾 Salvando estado no GitHub...');
            const result = await window.hexaDatabase.saveCombatState(currentState);
            if (result.success) {
                this.lastUpdate = Date.now();
                await this.addLogEntry('turn', 'Combate finalizado!');
                console.log('✅ Combate finalizado e sincronizado com sucesso');
            } else {
                console.error('❌ Falha ao finalizar combate:', result.error);
            }
        } catch (error) {
            console.error('❌ Erro ao finalizar combate:', error);
        }
    }

    async updateTimer(duration, timeRemaining) {
        try {
            console.log('⏱️ Sincronizando timer...');
            const currentState = await this.getCurrentState();
            if (currentState) {
                currentState.timerDuration = duration;
                currentState.timeRemaining = timeRemaining;
                currentState.lastUpdate = new Date().toISOString();
                
                console.log('💾 Salvando estado no GitHub...');
                const result = await window.hexaDatabase.saveCombatState(currentState);
                if (result.success) {
                    this.lastUpdate = Date.now();
                    console.log('✅ Timer sincronizado com sucesso');
                } else {
                    console.error('❌ Falha ao sincronizar timer:', result.error);
                }
            }
        } catch (error) {
            console.error('❌ Erro ao sincronizar timer:', error);
        }
    }

    async addLogEntry(logType, message) {
        try {
            console.log('📝 Adicionando entrada ao log...');
            
            if (this.isConnected && window.hexaDatabase) {
                // Tentar sincronizar via GitHub
                const result = await window.hexaDatabase.addCombatLogEntry(logType, message);
                if (result.success) {
                    console.log('✅ Entrada de log sincronizada com sucesso via GitHub');
                    return;
                } else {
                    console.error('❌ Falha ao adicionar entrada de log via GitHub:', result.error);
                }
            }
            
            // Fallback para localStorage
            if (window.hexaLocalSync) {
                window.hexaLocalSync.addLogEntry(logType, message);
                console.log('✅ Entrada de log sincronizada via localStorage');
            }
            
        } catch (error) {
            console.error('❌ Erro ao adicionar entrada de log:', error);
            // Fallback para localStorage
            if (window.hexaLocalSync) {
                window.hexaLocalSync.addLogEntry(logType, message);
            }
        }
    }

    async requestState() {
        console.log('🔄 Solicitando estado atual...');
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

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Esperar um pouco para garantir que hexaDatabase esteja disponível
    setTimeout(() => {
        console.log('🔍 Verificando disponibilidade do hexaDatabase...');
        console.log('🔍 window.hexaDatabase disponível:', !!window.hexaDatabase);
        
        if (window.hexaDatabase) {
            console.log('🔍 hexaDatabase encontrado, criando sistema de sincronização...');
            hexaGitHubSync = new HexaGitHubSync();
            
            // Disponibilizar globalmente
            window.hexaGitHubSync = hexaGitHubSync;
            
            console.log('🔗 Sistema de sincronização GitHub H.E.X.A inicializado');
        } else {
            console.error('❌ hexaDatabase não encontrado após espera');
            // Tentar novamente após mais tempo
            setTimeout(() => {
                if (window.hexaDatabase) {
                    console.log('🔍 hexaDatabase encontrado na segunda tentativa...');
                    hexaGitHubSync = new HexaGitHubSync();
                    window.hexaGitHubSync = hexaGitHubSync;
                    console.log('🔗 Sistema de sincronização GitHub H.E.X.A inicializado (tardio)');
                } else {
                    console.error('❌ hexaDatabase não encontrado mesmo após espera extendida');
                }
            }, 2000);
        }
    }, 1500); // Aumentar espera para 1.5 segundos
});
