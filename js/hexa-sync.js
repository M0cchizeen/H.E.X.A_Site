// Sistema de Sincronização H.E.X.A via GitHub API
class HexaSync {
    constructor() {
        this.repoOwner = 'm0cchizimM0cchizeen'; // Default para testes
        this.repoName = 'H.E.X.A_Site'; // Default para testes
        this.token = null; // Token opcional para maior limite de rate
        this.lastSync = 0;
        this.syncInterval = 5000; // 5 segundos
        this.onStateUpdate = null;
        this.onTimerUpdate = null;
        this.onConnect = null;
        this.onDisconnect = null;
        this.isConnected = false;
        this.syncTimer = null;
        
        // Estado local
        this.localState = {
            combat: {
                isActive: false,
                currentRound: 1,
                currentTurn: 0,
                initiative: [],
                timer: {
                    duration: 60,
                    timeRemaining: 60,
                    isRunning: false
                },
                logs: []
            },
            social: {
                messages: []
            }
        };
    }

    init() {
        console.log('🚀 Inicializando sistema de sincronização H.E.X.A...');
        this.loadFromLocalStorage();
        this.startSync();
        this.isConnected = true;
        
        if (this.onConnect) {
            this.onConnect();
        }
    }

    // Configuração do repositório
    setRepo(owner, name, token = null) {
        this.repoOwner = owner;
        this.repoName = name;
        this.token = token;
        console.log(`📁 Repositório configurado: ${owner}/${name} (modo online)`);
    }

    // Iniciar sincronização periódica
    startSync() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
        }
        
        this.syncTimer = setInterval(() => {
            this.syncFromGitHub();
        }, this.syncInterval);
        
        // Sincronizar imediatamente
        this.syncFromGitHub();
    }

    // Sincronizar do GitHub
    async syncFromGitHub() {
        try {
            console.log('🌐 Sincronizando com GitHub API...');
            
            // Sincronizar estado do combate
            await this.syncCombatState();
            // Sincronizar mensagens do social
            await this.syncSocialMessages();
            
            this.lastSync = Date.now();
            console.log('✅ Sincronização concluída');
        } catch (error) {
            console.warn('⚠️ Erro na sincronização:', error.message);
            // Manter dados locais como fallback
            this.syncFromLocalStorage();
        }
    }

    // Sincronização local (apenas como backup)
    syncFromLocalStorage() {
        try {
            // Carregar mensagens do localStorage como backup
            const savedMessages = localStorage.getItem('hexaSocialMessages');
            if (savedMessages && this.localState.social.messages.length === 0) {
                this.localState.social.messages = JSON.parse(savedMessages);
                console.log('📦 Usando mensagens locais como backup');
            }
            
            // Carregar estado do combate como backup
            const savedCombat = localStorage.getItem('hexaCombatState');
            if (savedCombat && !this.localState.combat.isActive) {
                this.localState.combat = { ...this.localState.combat, ...JSON.parse(savedCombat) };
                console.log('📦 Usando estado local como backup');
            }
        } catch (error) {
            console.warn('⚠️ Erro no backup local:', error.message);
        }
    }

    // Sincronizar estado do combate
    async syncCombatState() {
        try {
            const issue = await this.getIssue('HEXA_COMBAT_STATE');
            if (issue) {
                const remoteState = JSON.parse(issue.body);
                
                // Verificar se o estado remoto é mais recente
                if (remoteState.timestamp > this.localState.combat.lastUpdate) {
                    this.localState.combat = { ...remoteState, lastUpdate: remoteState.timestamp };
                    
                    if (this.onStateUpdate) {
                        this.onStateUpdate(this.localState.combat);
                    }
                }
            }
        } catch (error) {
            // Se não encontrar issue, usar estado local
            console.log('📝 Estado local do combate sendo usado');
        }
    }

    // Sincronizar mensagens do social
    async syncSocialMessages() {
        try {
            const issues = await this.getIssuesByLabel('HEXA_SOCIAL_MESSAGE');
            const messages = issues.map(issue => {
                const data = JSON.parse(issue.body);
                return {
                    id: issue.id,
                    ...data,
                    githubId: issue.id,
                    createdAt: issue.created_at,
                    updatedAt: issue.updated_at
                };
            });
            
            // Ordenar por data
            messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            this.localState.social.messages = messages;
            
            // Atualizar localStorage para o H.E.X.A Social
            localStorage.setItem('hexaSocialMessages', JSON.stringify(messages));
            
        } catch (error) {
            console.log('📝 Mensagens locais sendo usadas');
        }
    }

    // Salvar estado no GitHub
    async saveCombatState() {
        try {
            const stateData = {
                ...this.localState.combat,
                timestamp: Date.now()
            };
            
            await this.createOrUpdateIssue('HEXA_COMBAT_STATE', 'Estado do Combate H.E.X.A', JSON.stringify(stateData), ['HEXA_STATE']);
            console.log('💾 Estado do combate salvo no GitHub');
        } catch (error) {
            console.error('❌ Erro ao salvar estado do combate:', error);
        }
    }

    // Salvar mensagem no social
    async saveSocialMessage(messageData) {
        try {
            console.log('💾 Salvando mensagem no GitHub...');
            
            const title = `[HEXA_SOCIAL] ${messageData.username}`;
            const body = JSON.stringify(messageData);
            
            const issue = await this.createIssue(title, body, ['HEXA_SOCIAL_MESSAGE']);
            console.log('✅ Mensagem social salva no GitHub:', issue.id);
            
            // Atualizar cache local imediatamente
            this.localState.social.messages.unshift({
                id: issue.id,
                ...messageData,
                githubId: issue.id,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            
            // Salvar no localStorage como backup
            localStorage.setItem('hexaSocialMessages', JSON.stringify(this.localState.social.messages));
            
            return issue;
        } catch (error) {
            console.error('❌ Erro ao salvar mensagem social:', error);
            // Fallback: salvar localmente
            this.localState.social.messages.unshift({
                id: Date.now(),
                ...messageData,
                timestamp: Date.now()
            });
            localStorage.setItem('hexaSocialMessages', JSON.stringify(this.localState.social.messages));
            console.log('💾 Mensagem salva localmente (fallback)');
            throw error;
        }
    }

    // Métodos da API GitHub
    async getIssue(title) {
        const url = `https://api.github.com/search/issues?q=${encodeURIComponent(`repo:${this.repoOwner}/${this.repoName} ${title} in:title`)}`;
        const response = await this.fetchWithAuth(url);
        const data = await response.json();
        
        return data.items.length > 0 ? data.items[0] : null;
    }

    async getIssuesByLabel(label) {
        const url = `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/issues?labels=${label}&state=open`;
        const response = await this.fetchWithAuth(url);
        return response.json();
    }

    async createIssue(title, body, labels = []) {
        const url = `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/issues`;
        const response = await this.fetchWithAuth(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: title,
                body: body,
                labels: labels
            })
        });
        
        return response.json();
    }

    async createOrUpdateIssue(title, body, labels = []) {
        // Verificar se issue já existe
        const existing = await this.getIssue(title);
        
        if (existing) {
            // Atualizar issue existente
            const url = `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/issues/${existing.number}`;
            const response = await this.fetchWithAuth(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    body: body
                })
            });
            
            return response.json();
        } else {
            // Criar nova issue
            return this.createIssue(title, body, labels);
        }
    }

    async fetchWithAuth(url, options = {}) {
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            ...options.headers
        };
        
        if (this.token) {
            headers['Authorization'] = `token ${this.token}`;
        }
        
        const response = await fetch(url, {
            ...options,
            headers: headers
        });
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }
        
        return response;
    }

    // Métodos de controle do combate
    updateInitiative(initiative) {
        this.localState.combat.initiative = initiative;
        this.saveCombatState();
    }

    nextTurn() {
        const initiative = this.localState.combat.initiative;
        if (initiative.length > 0) {
            this.localState.combat.currentTurn = (this.localState.combat.currentTurn + 1) % initiative.length;
            
            if (this.localState.combat.currentTurn === 0) {
                this.localState.combat.currentRound++;
            }
            
            this.saveCombatState();
        }
    }

    startCombat() {
        this.localState.combat.isActive = true;
        this.localState.combat.currentRound = 1;
        this.localState.combat.currentTurn = 0;
        this.saveCombatState();
    }

    endCombat() {
        this.localState.combat.isActive = false;
        this.saveCombatState();
    }

    updateTimer(duration, timeRemaining) {
        this.localState.combat.timer = {
            duration: duration,
            timeRemaining: timeRemaining,
            isRunning: timeRemaining > 0
        };
        this.saveCombatState();
    }

    addLogEntry(logType, message) {
        this.localState.combat.logs.push({
            type: logType,
            message: message,
            timestamp: Date.now()
        });
        this.saveCombatState();
    }

    // Métodos do social
    async addSocialMessage(username, content) {
        const messageData = {
            username: username,
            content: content,
            timestamp: Date.now()
        };
        
        const issue = await this.saveSocialMessage(messageData);
        
        // Forçar sincronização imediata
        setTimeout(() => this.syncSocialMessages(), 1000);
        
        return issue;
    }

    async deleteSocialMessage(messageId) {
        try {
            // Encontrar a issue correspondente
            const issues = await this.getIssuesByLabel('HEXA_SOCIAL_MESSAGE');
            const issue = issues.find(i => i.id == messageId);
            
            if (issue) {
                // Fechar a issue (equivalente a deletar)
                const url = `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/issues/${issue.number}`;
                await this.fetchWithAuth(url, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        state: 'closed'
                    })
                });
                
                console.log('🗑️ Mensagem social deletada:', messageId);
                
                // Forçar sincronização
                setTimeout(() => this.syncSocialMessages(), 1000);
            }
        } catch (error) {
            console.error('❌ Erro ao deletar mensagem social:', error);
            throw error;
        }
    }

    // Métodos utilitários
    loadFromLocalStorage() {
        try {
            const savedState = localStorage.getItem('hexaCombatState');
            if (savedState) {
                this.localState.combat = { ...this.localState.combat, ...JSON.parse(savedState) };
            }
        } catch (error) {
            console.warn('⚠️ Erro ao carregar estado do localStorage:', error);
        }
    }

    saveToLocalStorage() {
        try {
            localStorage.setItem('hexaCombatState', JSON.stringify(this.localState.combat));
        } catch (error) {
            console.warn('⚠️ Erro ao salvar estado no localStorage:', error);
        }
    }

    getCombatState() {
        return this.localState.combat;
    }

    getSocialMessages() {
        return this.localState.social.messages;
    }

    disconnect() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
            this.syncTimer = null;
        }
        
        this.isConnected = false;
        
        if (this.onDisconnect) {
            this.onDisconnect();
        }
        
        console.log('🔌 Sistema de sincronização desconectado');
    }
}

// Instância global do sistema de sincronização
let hexaSync = null;

// Inicializar quando autenticado
document.addEventListener('DOMContentLoaded', () => {
    // Aguardar autenticação
    setTimeout(() => {
        if (typeof hexaAuth !== 'undefined' && hexaAuth.isAuthenticated()) {
            hexaSync = new HexaSync();
            window.hexaSync = hexaSync;
            console.log('🚀 Sistema de sincronização H.E.X.A inicializado');
        }
    }, 100);
});
