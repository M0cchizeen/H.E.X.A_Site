// Sistema de Sincronização H.E.X.A em Tempo Real via GitHub API
class HexaSync {
    constructor() {
        this.repoOwner = 'M0cchizeen'; // Username GitHub correto
        this.repoName = 'H.E.X.A_Site'; // Nome do repositório
        this.token = null;
        this.lastSync = 0;
        this.syncInterval = 3000; // 3 segundos para mais real-time
        this.isConnected = false;
        this.syncTimer = null;
        this.retryCount = 0;
        this.maxRetries = 3;
        
        // Estado completo do site
        this.siteState = {
            combat: {
                isActive: false,
                currentRound: 1,
                currentTurn: 0,
                initiative: [],
                timer: {
                    duration: 60,
                    timeRemaining: 60,
                    isRunning: false,
                    startTime: null
                },
                logs: [],
                characters: []
            },
            social: {
                messages: []
            },
            system: {
                lastUpdate: Date.now(),
                activeUsers: [],
                globalTimer: null
            }
        };
        
        // Callbacks para atualizar UI
        this.callbacks = {
            onCombatUpdate: null,
            onSocialUpdate: null,
            onTimerUpdate: null,
            onUserJoined: null,
            onUserLeft: null
        };
    }

    init() {
        console.log('🌐 Iniciando sincronização em tempo real...');
        this.startSync();
        this.startHeartbeat();
    }

    // Configurar repositório
    setRepo(owner, name, token = null) {
        this.repoOwner = owner;
        this.repoName = name;
        this.token = token;
        console.log(`📁 Repositório: ${owner}/${name}`);
    }

    // Iniciar sincronização
    startSync() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
        }

        // OTIMIZAÇÃO EXTREMA: Aumentar ainda mais para múltiplas páginas
        this.syncInterval = 20000; // 20 segundos (era 15 segundos)
        
        console.log(`⏱️ Iniciando sincronização a cada ${this.syncInterval/1000} segundos...`);
        
        // Sincronização inicial
        this.syncFromGitHub();
        
        // Configurar sincronização periódica
        this.syncTimer = setInterval(() => {
            this.syncFromGitHub();
        }, this.syncInterval);
    }

    // Heartbeat para detectar usuários ativos
    startHeartbeat() {
        // OTIMIZAÇÃO EXTREMA: Aumentar ainda mais para múltiplos usuários
        setInterval(() => {
            this.sendHeartbeat();
        }, 45000); // 45 segundos (era 30 segundos)
    }

    // Enviar heartbeat
    async sendHeartbeat() {
        try {
            const userId = this.getUserId();
            const username = this.getUsername();
            const userColor = typeof hexaUser !== 'undefined' ? hexaUser.getUserColor() : '#007bff';
            
            const heartbeatData = {
                userId: userId,
                username: username,
                color: userColor,
                timestamp: Date.now(),
                page: window.location.pathname,
                userAgent: navigator.userAgent.substring(0, 50)
            };

            await this.createOrUpdateIssue(
                `HEXA_HEARTBEAT_${userId}`,
                `Heartbeat ${username}`,
                JSON.stringify(heartbeatData),
                ['HEXA_HEARTBEAT']
            );
        } catch (error) {
            console.warn('⚠️ Erro no heartbeat:', error.message);
        }
    }

    // Obter ID único do usuário
    getUserId() {
        if (typeof hexaUser !== 'undefined' && hexaUser.getUserId()) {
            return hexaUser.getUserId();
        }
        
        // Fallback para ID local
        let userId = localStorage.getItem('hexaUserId');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('hexaUserId', userId);
        }
        return userId;
    }

    // Obter nome do usuário
    getUsername() {
        if (typeof hexaUser !== 'undefined' && hexaUser.getUsername()) {
            return hexaUser.getUsername();
        }
        return 'Jogador Anônimo';
    }

    // Sincronização principal com otimização
    async syncFromGitHub() {
        try {
            console.log('🔄 Sincronizando estado completo...');
            
            // OTIMIZAÇÃO: Verificar se há mudanças antes de buscar
            const hasChanges = await this.checkForChanges();
            
            if (hasChanges || !this.lastSync) {
                // Sincronizar estado do combate
                await this.syncCombatState();
                
                // Sincronizar mensagens sociais
                await this.syncSocialMessages();
                
                // Sincronizar usuários ativos
                await this.syncActiveUsers();
                
                // Sincronizar timer global
                await this.syncGlobalTimer();
                
                this.lastSync = Date.now();
                this.isConnected = true;
                this.retryCount = 0;
                
                console.log('✅ Sincronização concluída com mudanças');
            } else {
                console.log('⏭️ Sem mudanças, pulando sincronização');
            }
            
        } catch (error) {
            console.warn('⚠️ Erro na sincronização:', error.message);
            this.isConnected = false;
            this.retryCount++;
            
            if (this.retryCount < this.maxRetries) {
                console.log(`🔄 Tentando novamente (${this.retryCount}/${this.maxRetries})`);
                setTimeout(() => this.syncFromGitHub(), 2000);
            } else {
                console.error('❌ Máximo de tentativas atingido');
            }
        }
    }

    // Verificar se há mudanças sem fazer requisições completas
    async checkForChanges() {
        try {
            // Buscar apenas as issues mais recentes para verificar timestamps
            const recentIssues = await this.getIssuesByLabel('HEXA_HEARTBEAT', 1);
            
            if (recentIssues.length > 0) {
                const latestUpdate = new Date(recentIssues[0].updated_at).getTime();
                // Se houver atualização mais recente que nossa última sincronização
                return latestUpdate > this.lastSync;
            }
            
            // Se não houver issues, considerar que há mudanças na primeira vez
            return !this.lastSync;
            
        } catch (error) {
            // Se falhar, assumir que há mudanças para não perder nada
            return true;
        }
    }

    // Sincronizar estado do combate
    async syncCombatState() {
        try {
            const issue = await this.getIssue('HEXA_COMBAT_STATE');
            if (issue) {
                const remoteState = JSON.parse(issue.body);
                
                // Verificar se mudou
                if (JSON.stringify(remoteState) !== JSON.stringify(this.siteState.combat)) {
                    this.siteState.combat = { ...this.siteState.combat, ...remoteState };
                    
                    // Atualizar UI
                    if (this.callbacks.onCombatUpdate) {
                        this.callbacks.onCombatUpdate(this.siteState.combat);
                    }
                    
                    console.log('⚔️ Estado do combate atualizado');
                }
            }
        } catch (error) {
            console.warn('⚠️ Erro ao sincronizar combate:', error.message);
        }
    }

    // Sincronizar mensagens sociais
    async syncSocialMessages() {
        try {
            const issues = await this.getIssuesByLabel('HEXA_SOCIAL_MESSAGE');
            const messages = issues.map(issue => ({
                id: issue.id,
                githubId: issue.number,
                username: issue.title.replace('[HEXA_SOCIAL] ', ''),
                content: JSON.parse(issue.body).content || issue.body,
                timestamp: new Date(issue.created_at).getTime(),
                updatedAt: new Date(issue.updated_at).getTime()
            })).sort((a, b) => b.timestamp - a.timestamp);

            // Verificar se mudou
            if (JSON.stringify(messages) !== JSON.stringify(this.siteState.social.messages)) {
                this.siteState.social.messages = messages;
                
                // Atualizar UI
                if (this.callbacks.onSocialUpdate) {
                    this.callbacks.onSocialUpdate(messages);
                }
                
                console.log('💬 Mensagens sociais atualizadas:', messages.length);
            }
        } catch (error) {
            console.warn('⚠️ Erro ao sincronizar mensagens:', error.message);
        }
    }

    // Sincronizar usuários ativos
    async syncActiveUsers() {
        try {
            const issues = await this.getIssuesByLabel('HEXA_HEARTBEAT');
            const now = Date.now();
            const activeUsers = [];

            issues.forEach(issue => {
                try {
                    const heartbeat = JSON.parse(issue.body);
                    // Considerar ativo se heartbeat < 30 segundos
                    if (now - heartbeat.timestamp < 30000) {
                        activeUsers.push({
                            userId: heartbeat.userId,
                            lastSeen: heartbeat.timestamp,
                            page: heartbeat.page
                        });
                    }
                } catch (e) {
                    // Ignorar heartbeats inválidos
                }
            });

            this.siteState.system.activeUsers = activeUsers;
            console.log('👥 Usuários ativos:', activeUsers.length);
            
        } catch (error) {
            console.warn('⚠️ Erro ao sincronizar usuários:', error.message);
        }
    }

    // Sincronizar timer global
    async syncGlobalTimer() {
        try {
            const issue = await this.getIssue('HEXA_GLOBAL_TIMER');
            if (issue) {
                const timerData = JSON.parse(issue.body);
                
                // Se timer está rodando, calcular tempo restante
                if (timerData.isRunning && timerData.startTime) {
                    const elapsed = Date.now() - timerData.startTime;
                    timerData.timeRemaining = Math.max(0, timerData.duration - elapsed);
                }
                
                this.siteState.system.globalTimer = timerData;
                
                // Atualizar UI
                if (this.callbacks.onTimerUpdate) {
                    this.callbacks.onTimerUpdate(timerData);
                }
            }
        } catch (error) {
            console.warn('⚠️ Erro ao sincronizar timer:', error.message);
        }
    }

    // Salvar estado do combate
    async saveCombatState(combatData) {
        try {
            this.siteState.combat = { ...this.siteState.combat, ...combatData };
            
            await this.createOrUpdateIssue(
                'HEXA_COMBAT_STATE',
                'Estado do Combate H.E.X.A',
                JSON.stringify(this.siteState.combat),
                ['HEXA_STATE']
            );
            
            console.log('💾 Estado do combate salvo');
        } catch (error) {
            console.error('❌ Erro ao salvar combate:', error);
        }
    }

    // Adicionar mensagem social
    async addSocialMessage(username, content) {
        try {
            const messageData = {
                username: username,
                content: content,
                timestamp: Date.now()
            };

            const issue = await this.createIssue(
                `[HEXA_SOCIAL] ${username}`,
                JSON.stringify(messageData),
                ['HEXA_SOCIAL_MESSAGE']
            );

            console.log('💾 Mensagem social salva:', issue.id);
            
            // Sincronizar imediatamente
            setTimeout(() => this.syncFromGitHub(), 1000);
            
            return issue;
        } catch (error) {
            console.error('❌ Erro ao salvar mensagem:', error);
            throw error;
        }
    }

    // Atualizar iniciativa
    async updateInitiative(initiative) {
        await this.saveCombatState({ initiative: initiative });
    }

    // Próximo turno
    async nextTurn() {
        const combat = this.siteState.combat;
        combat.currentTurn = (combat.currentTurn + 1) % combat.initiative.length;
        await this.saveCombatState({ currentTurn: combat.currentTurn });
    }

    // Iniciar timer
    async startTimer(duration = 60) {
        const timerData = {
            duration: duration,
            timeRemaining: duration,
            isRunning: true,
            startTime: Date.now()
        };

        await this.createOrUpdateIssue(
            'HEXA_GLOBAL_TIMER',
            'Timer Global H.E.X.A',
            JSON.stringify(timerData),
            ['HEXA_TIMER']
        );

        console.log('⏱️ Timer iniciado:', duration, 'segundos');
    }

    // Parar timer
    async stopTimer() {
        const timerData = {
            ...this.siteState.system.globalTimer,
            isRunning: false,
            startTime: null
        };

        await this.createOrUpdateIssue(
            'HEXA_GLOBAL_TIMER',
            'Timer Global H.E.X.A',
            JSON.stringify(timerData),
            ['HEXA_TIMER']
        );

        console.log('⏹️ Timer parado');
    }

    // Adicionar log de combate
    async addCombatLog(entry) {
        const combat = this.siteState.combat;
        combat.logs.unshift({
            text: entry,
            timestamp: Date.now(),
            type: 'combat'
        });

        // Manter apenas últimos 50 logs
        if (combat.logs.length > 50) {
            combat.logs = combat.logs.slice(0, 50);
        }

        await this.saveCombatState({ logs: combat.logs });
    }

    // Métodos da API GitHub
    async fetchWithAuth(url, options = {}) {
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `token ${this.token}`;
        }

        const response = await fetch(url, {
            ...options,
            headers
        });

        // Tratar diferentes tipos de erro
        if (response.status === 403) {
            const errorData = await response.json().catch(() => ({}));
            if (errorData.message && errorData.message.includes('rate limit')) {
                throw new Error(`Rate limit excedido. Aguarde o reset ou configure um token GitHub.`);
            }
            throw new Error(`Acesso negado: ${response.statusText}`);
        } else if (response.status === 404) {
            throw new Error(`Recurso não encontrado: ${url}`);
        } else if (response.status === 401) {
            throw new Error(`Token inválido ou expirado`);
        }

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }

        return response;
    }

    async getIssue(title) {
        const url = `https://api.github.com/search/issues?q=${encodeURIComponent(`repo:${this.repoOwner}/${this.repoName} ${title} in:title`)}`;
        const response = await this.fetchWithAuth(url);
        const data = await response.json();
        
        return data.items.length > 0 ? data.items[0] : null;
    }

    async getIssuesByLabel(label) {
        const url = `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/issues?labels=${encodeURIComponent(label)}&state=open&sort=created&direction=desc`;
        const response = await this.fetchWithAuth(url);
        return response.json();
    }

    async createIssue(title, body, labels = []) {
        const url = `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/issues`;
        const response = await this.fetchWithAuth(url, {
            method: 'POST',
            body: JSON.stringify({
                title: title,
                body: body,
                labels: labels
            })
        });
        return response.json();
    }

    async createOrUpdateIssue(title, defaultTitle, body, labels = []) {
        try {
            // Tentar encontrar issue existente
            const existingIssue = await this.getIssue(title);
            
            if (existingIssue) {
                // Atualizar issue existente
                const url = `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/issues/${existingIssue.number}`;
                const response = await this.fetchWithAuth(url, {
                    method: 'PATCH',
                    body: JSON.stringify({
                        body: body
                    })
                });
                return response.json();
            } else {
                // Criar nova issue
                return this.createIssue(defaultTitle, body, labels);
            }
        } catch (error) {
            console.error('❌ Erro ao criar/atualizar issue:', error);
            throw error;
        }
    }

    // Getters para acesso ao estado
    getCombatState() {
        return this.siteState.combat;
    }

    getSocialMessages() {
        return this.siteState.social.messages;
    }

    getActiveUsers() {
        return this.siteState.system.activeUsers;
    }

    getGlobalTimer() {
        return this.siteState.system.globalTimer;
    }

    // Configurar callbacks
    on(event, callback) {
        if (this.callbacks.hasOwnProperty(`on${event.charAt(0).toUpperCase() + event.slice(1)}`)) {
            this.callbacks[`on${event.charAt(0).toUpperCase() + event.slice(1)}`] = callback;
        }
    }

    // Desconectar
    disconnect() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
        }
        this.isConnected = false;
        console.log('🔌 Sincronização desconectada');
    }
}

// Criar instância global
let hexaSync = null;

// Inicializar quando carregar
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        // Verificar se usuário está autenticado E identificado
        const isAuthenticated = typeof hexaAuth !== 'undefined' && hexaAuth.isAuthenticated;
        const isIdentified = typeof hexaUser !== 'undefined' && hexaUser.isIdentified;
        
        console.log('🔍 Status inicialização:', { isAuthenticated, isIdentified });
        
        if (isAuthenticated && isIdentified) {
            // Inicializar sincronização imediatamente
            hexaSync = new HexaSync();
            window.hexaSync = hexaSync;
            
            // Configurar repositório
            if (typeof HexaConfig !== 'undefined') {
                hexaSync.setRepo(HexaConfig.github.owner, HexaConfig.github.repo, HexaConfig.github.token);
            }
            
            hexaSync.init();
            console.log('🌐 Sistema de sincronização H.E.X.A pronto');
        } else if (isAuthenticated && !isIdentified) {
            console.log('⏳ Aguardando identificação do usuário...');
            // Tentar novamente em 2 segundos
            setTimeout(() => {
                if (typeof hexaUser !== 'undefined' && hexaUser.isIdentified) {
                    hexaSync = new HexaSync();
                    window.hexaSync = hexaSync;
                    
                    if (typeof HexaConfig !== 'undefined') {
                        hexaSync.setRepo(HexaConfig.github.owner, HexaConfig.github.repo, HexaConfig.github.token);
                    }
                    
                    hexaSync.init();
                    console.log('🌐 Sistema de sincronização H.E.X.A pronto (delayed)');
                } else {
                    console.log('❌ Usuário não identificado após timeout');
                }
            }, 2000);
        } else {
            console.log('🔒 Aguardando autenticação para iniciar sincronização...');
        }
    }, 100);
});
