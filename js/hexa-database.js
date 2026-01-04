// H.E.X.A Social - GitHub API Integration
// Sistema de banco de dados usando GitHub Issues

class HexaDatabase {
    constructor() {
        // Configuração - ATENÇÃO: Substitua com seus dados reais
        this.config = {
            owner: 'SEU_USERNAME', // Seu username do GitHub
            repo: 'SEU_REPOSITORIO', // Nome do seu repositório
            token: 'SEU_TOKEN', // Token de acesso pessoal (opcional, para mais requests)
            label: 'HEXA_SOCIAL_MESSAGE' // Label para identificar as mensagens
        };
        
        this.apiBase = 'https://api.github.com';
        this.cache = new Map();
        this.lastSync = null;
    }

    // Obter headers para requisições
    getHeaders() {
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        };
        
        if (this.config.token && this.config.token !== 'SEU_TOKEN') {
            headers['Authorization'] = `token ${this.config.token}`;
        }
        
        return headers;
    }

    // Salvar mensagem no GitHub (criar Issue)
    async saveMessage(messageData) {
        try {
            const issueData = {
                title: `[HEXA_MESSAGE] ${messageData.username || 'Anonymous'} - ${new Date().toISOString()}`,
                body: JSON.stringify({
                    username: messageData.username || 'Anonymous',
                    content: messageData.content,
                    timestamp: messageData.timestamp || new Date().toISOString(),
                    id: Date.now().toString()
                }),
                labels: [this.config.label]
            };

            const response = await fetch(`${this.apiBase}/repos/${this.config.owner}/${this.config.repo}/issues`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(issueData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Mensagem salva no GitHub:', result);
            
            // Limpar cache após salvar
            this.cache.clear();
            
            return {
                success: true,
                id: result.id,
                number: result.number
            };
            
        } catch (error) {
            console.error('Erro ao salvar mensagem:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Carregar todas as mensagens
    async loadMessages() {
        try {
            // Verificar cache (5 minutos)
            if (this.cache.has('messages') && this.lastSync && 
                (Date.now() - this.lastSync) < 300000) {
                return this.cache.get('messages');
            }

            const response = await fetch(
                `${this.apiBase}/repos/${this.config.owner}/${this.config.repo}/issues?` +
                `labels=${this.config.label}&state=open&sort=created&direction=desc`,
                {
                    headers: this.getHeaders()
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const issues = await response.json();
            
            // Converter issues para formato de mensagens
            const messages = issues.map(issue => {
                try {
                    const data = JSON.parse(issue.body);
                    return {
                        id: data.id || issue.id,
                        username: data.username || 'Anonymous',
                        content: data.content,
                        timestamp: data.timestamp || issue.created_at,
                        issueNumber: issue.number,
                        url: issue.html_url
                    };
                } catch (parseError) {
                    console.warn('Erro ao parsear mensagem:', issue.number);
                    return null;
                }
            }).filter(msg => msg !== null);

            // Salvar no cache
            this.cache.set('messages', messages);
            this.lastSync = Date.now();
            
            return messages;
            
        } catch (error) {
            console.error('Erro ao carregar mensagens:', error);
            
            // Retornar mensagens do cache se disponível
            if (this.cache.has('messages')) {
                console.log('Usando mensagens do cache');
                return this.cache.get('messages');
            }
            
            return [];
        }
    }

    // Excluir mensagem (fechar Issue)
    async deleteMessage(issueNumber) {
        try {
            const response = await fetch(
                `${this.apiBase}/repos/${this.config.owner}/${this.config.repo}/issues/${issueNumber}`,
                {
                    method: 'PATCH',
                    headers: this.getHeaders(),
                    body: JSON.stringify({
                        state: 'closed'
                    })
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Limpar cache
            this.cache.clear();
            
            return { success: true };
            
        } catch (error) {
            console.error('Erro ao excluir mensagem:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Limpar todas as mensagens (fechar todas as Issues)
    async clearAllMessages() {
        try {
            const messages = await this.loadMessages();
            const results = [];
            
            for (const message of messages) {
                if (message.issueNumber) {
                    const result = await this.deleteMessage(message.issueNumber);
                    results.push({
                        id: message.id,
                        success: result.success
                    });
                }
            }
            
            return results;
            
        } catch (error) {
            console.error('Erro ao limpar mensagens:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Verificar configuração
    async checkConnection() {
        try {
            const response = await fetch(
                `${this.apiBase}/repos/${this.config.owner}/${this.config.repo}`,
                {
                    headers: this.getHeaders()
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const repo = await response.json();
            return {
                success: true,
                repo: {
                    name: repo.name,
                    owner: repo.owner.login,
                    url: repo.html_url,
                    open_issues_count: repo.open_issues_count
                }
            };
            
        } catch (error) {
            console.error('Erro ao verificar conexão:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Obter estatísticas
    async getStats() {
        try {
            const messages = await this.loadMessages();
            const users = [...new Set(messages.map(msg => msg.username))];
            
            return {
                totalMessages: messages.length,
                totalUsers: users.length,
                lastMessage: messages[0]?.timestamp || null,
                users: users.map(username => ({
                    username,
                    messageCount: messages.filter(msg => msg.username === username).length
                })).sort((a, b) => b.messageCount - a.messageCount)
            };
            
        } catch (error) {
            console.error('Erro ao obter estatísticas:', error);
            return {
                totalMessages: 0,
                totalUsers: 0,
                lastMessage: null,
                users: []
            };
        }
    }
}

// Função de fallback para localStorage
class LocalStorageFallback {
    constructor() {
        this.storageKey = 'hexa_messages';
    }

    async saveMessage(messageData) {
        try {
            const messages = this.loadMessages();
            messages.push({
                ...messageData,
                id: Date.now().toString(),
                timestamp: messageData.timestamp || new Date().toISOString()
            });
            
            localStorage.setItem(this.storageKey, JSON.stringify(messages));
            return { success: true, id: Date.now().toString() };
        } catch (error) {
            console.error('Erro ao salvar no localStorage:', error);
            return { success: false, error: error.message };
        }
    }

    async loadMessages() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Erro ao carregar do localStorage:', error);
            return [];
        }
    }

    async deleteMessage(messageId) {
        try {
            const messages = this.loadMessages();
            const filtered = messages.filter(msg => msg.id !== messageId);
            localStorage.setItem(this.storageKey, JSON.stringify(filtered));
            return { success: true };
        } catch (error) {
            console.error('Erro ao excluir do localStorage:', error);
            return { success: false, error: error.message };
        }
    }

    async clearAllMessages() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify([]));
            return { success: true };
        } catch (error) {
            console.error('Erro ao limpar localStorage:', error);
            return { success: false, error: error.message };
        }
    }
}

// Sistema de banco de dados híbrido
class HexaSocialDatabase {
    constructor() {
        this.github = new HexaDatabase();
        this.local = new LocalStorageFallback();
        this.useGitHub = false;
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        // Tentar conectar ao GitHub
        const connectionTest = await this.github.checkConnection();
        
        if (connectionTest.success) {
            console.log('✅ Conectado ao GitHub - usando banco de dados online');
            this.useGitHub = true;
        } else {
            console.log('⚠️ Falha na conexão GitHub - usando localStorage');
            this.useGitHub = false;
        }

        this.initialized = true;
    }

    async saveMessage(messageData) {
        await this.init();
        
        if (this.useGitHub) {
            const result = await this.github.saveMessage(messageData);
            
            // Se falhar, tentar localStorage
            if (!result.success) {
                console.log('Fallback para localStorage');
                return await this.local.saveMessage(messageData);
            }
            
            return result;
        } else {
            return await this.local.saveMessage(messageData);
        }
    }

    async loadMessages() {
        await this.init();
        
        if (this.useGitHub) {
            const messages = await this.github.loadMessages();
            
            // Se falhar, tentar localStorage
            if (messages.length === 0) {
                console.log('Fallback para localStorage');
                return await this.local.loadMessages();
            }
            
            return messages;
        } else {
            return await this.local.loadMessages();
        }
    }

    async deleteMessage(messageId, issueNumber) {
        await this.init();
        
        if (this.useGitHub && issueNumber) {
            const result = await this.github.deleteMessage(issueNumber);
            
            // Se falhar, tentar localStorage
            if (!result.success) {
                console.log('Fallback para localStorage');
                return await this.local.deleteMessage(messageId);
            }
            
            return result;
        } else {
            return await this.local.deleteMessage(messageId);
        }
    }

    async clearAllMessages() {
        await this.init();
        
        if (this.useGitHub) {
            const result = await this.github.clearAllMessages();
            
            // Se falhar, tentar localStorage
            if (!result.success) {
                console.log('Fallback para localStorage');
                return await this.local.clearAllMessages();
            }
            
            return result;
        } else {
            return await this.local.clearAllMessages();
        }
    }

    async getStats() {
        await this.init();
        
        if (this.useGitHub) {
            return await this.github.getStats();
        } else {
            const messages = await this.local.loadMessages();
            const users = [...new Set(messages.map(msg => msg.username))];
            
            return {
                totalMessages: messages.length,
                totalUsers: users.length,
                lastMessage: messages[messages.length - 1]?.timestamp || null,
                users: users.map(username => ({
                    username,
                    messageCount: messages.filter(msg => msg.username === username).length
                })).sort((a, b) => b.messageCount - a.messageCount)
            };
        }
    }

    getConnectionStatus() {
        return {
            useGitHub: this.useGitHub,
            initialized: this.initialized
        };
    }
}

// Exportar para uso global
window.HexaDB = new HexaSocialDatabase();

// Auto-inicialização
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🔧 Inicializando H.E.X.A Database...');
    await window.HexaDB.init();
    console.log('✅ Database inicializado:', window.HexaDB.getConnectionStatus());
});
