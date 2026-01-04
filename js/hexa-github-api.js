
class HexaGitHubDatabase {
    constructor() {
        this.config = {
            owner: 'M0cchizeen',
            repo: 'H.E.X.A_Site',
            token: null, // Token opcional para mais requests
        };
        
        this.messageLabel = 'hexa-social-message';
        this.combatLabel = 'hexa-combat-sync';
        this.init();
    }

    init() {
        // Tentar carregar token do localStorage (se houver)
        const savedToken = localStorage.getItem('github_token');
        if (savedToken) {
            this.config.token = savedToken;
        }
    }

    // Salvar mensagem como Issue
    async saveMessage(message, username = 'Hexa_User') {
        try {
            const issueData = {
                title: `[HEXA_MESSAGE] ${new Date().toISOString()}`,
                body: JSON.stringify({
                    message: message,
                    username: username,
                    timestamp: new Date().toISOString(),
                    id: Date.now().toString()
                }),
                labels: [this.messageLabel]
            };

            const response = await this.createIssue(issueData);
            
            if (response.ok) {
                const issue = await response.json();
                console.log('Mensagem salva com sucesso:', issue.html_url);
                return { success: true, issue: issue };
            } else {
                throw new Error('Falha ao salvar mensagem');
            }
        } catch (error) {
            console.error('Erro ao salvar mensagem:', error);
            return { success: false, error: error.message };
        }
    }

    // Carregar todas as mensagens
    async loadMessages() {
        try {
            const response = await this.getIssues(this.messageLabel);
            
            if (response.ok) {
                const issues = await response.json();
                const messages = issues.map(issue => {
                    try {
                        const data = JSON.parse(issue.body);
                        return {
                            id: data.id,
                            message: data.message,
                            username: data.username,
                            timestamp: data.timestamp,
                            issue_number: issue.number,
                            issue_url: issue.html_url
                        };
                    } catch (e) {
                        console.warn('Erro ao parsear mensagem da issue:', issue.number);
                        return null;
                    }
                }).filter(msg => msg !== null);

                // Ordenar por timestamp (mais recentes primeiro)
                messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                
                return { success: true, messages: messages };
            } else {
                throw new Error('Falha ao carregar mensagens');
            }
        } catch (error) {
            console.error('Erro ao carregar mensagens:', error);
            return { success: false, error: error.message, messages: [] };
        }
    }

    // Deletar mensagem
    async deleteMessage(issueNumber) {
        try {
            const response = await this.deleteIssue(issueNumber);
            
            if (response.ok) {
                console.log('Mensagem deletada com sucesso');
                return { success: true };
            } else {
                throw new Error('Falha ao deletar mensagem');
            }
        } catch (error) {
            console.error('Erro ao deletar mensagem:', error);
            return { success: false, error: error.message };
        }
    }

    // Métodos da GitHub API
    async createIssue(issueData) {
        const url = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/issues`;
        
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json'
        };

        if (this.config.token) {
            headers['Authorization'] = `token ${this.config.token}`;
        }

        return fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(issueData)
        });
    }

    async getIssues(label) {
        const url = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/issues?labels=${label}&state=all`;
        
        const headers = {
            'Accept': 'application/vnd.github.v3+json'
        };

        if (this.config.token) {
            headers['Authorization'] = `token ${this.config.token}`;
        }

        return fetch(url, {
            method: 'GET',
            headers: headers
        });
    }

    async deleteIssue(issueNumber) {
        const url = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/issues/${issueNumber}`;
        
        const headers = {
            'Accept': 'application/vnd.github.v3+json'
        };

        if (this.config.token) {
            headers['Authorization'] = `token ${this.config.token}`;
        }

        return fetch(url, {
            method: 'PATCH',
            headers: headers,
            body: JSON.stringify({
                state: 'closed'
            })
        });
    }

    // Configurar token do GitHub (opcional, para mais requests)
    setToken(token) {
        this.config.token = token;
        localStorage.setItem('github_token', token);
    }

    // Verificar configuração
    checkConfig() {
        if (this.config.owner === 'SEU_USERNAME' || this.config.repo === 'HEXA_Site') {
            console.warn('Configure seu username e repositório no HexaGitHubDatabase!');
            return false;
        }
        return true;
    }

    // Método para testar conexão
    async testConnection() {
        try {
            const url = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}`;
            const response = await fetch(url);
            
            if (response.ok) {
                const repo = await response.json();
                console.log('Conexão com GitHub API bem-sucedida:', repo.full_name);
                return { success: true, repo: repo };
            } else {
                throw new Error('Repositório não encontrado ou privado');
            }
        } catch (error) {
            console.error('Erro na conexão com GitHub API:', error);
            return { success: false, error: error.message };
        }
    }
}

// ===== MÉTODOS DE SINCRONIZAÇÃO DE COMBATE =====

// Salvar estado do combate
HexaGitHubDatabase.prototype.saveCombatState = async function(combatState) {
    try {
        const issueData = {
            title: `[HEXA_COMBAT] ${new Date().toISOString()}`,
            body: JSON.stringify({
                type: 'combat_state',
                state: combatState,
                timestamp: new Date().toISOString(),
                id: Date.now().toString()
            }),
            labels: [this.combatLabel]
        };

        const response = await this.createIssue(issueData);
        
        if (response.ok) {
            const issue = await response.json();
            console.log('Estado do combate salvo:', issue.html_url);
            
            // Manter apenas as últimas 10 issues de combate
            await this.cleanupOldCombatIssues();
            
            return { success: true, issue: issue };
        } else {
            throw new Error('Falha ao salvar estado do combate');
        }
    } catch (error) {
        console.error('Erro ao salvar estado do combate:', error);
        return { success: false, error: error.message };
    }
};

// Carregar estado mais recente do combate
HexaGitHubDatabase.prototype.loadCombatState = async function() {
    try {
        const response = await this.getIssues(this.combatLabel);
        
        if (response.ok) {
            const issues = await response.json();
            const combatStates = issues.map(issue => {
                try {
                    const data = JSON.parse(issue.body);
                    if (data.type === 'combat_state') {
                        return {
                            state: data.state,
                            timestamp: data.timestamp,
                            issue_number: issue.number,
                            issue_url: issue.html_url
                        };
                    }
                    return null;
                } catch (e) {
                    console.warn('Erro ao parsear estado de combate:', issue.number);
                    return null;
                }
            }).filter(state => state !== null);

            // Ordenar por timestamp (mais recente primeiro)
            combatStates.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            if (combatStates.length > 0) {
                return { success: true, combatState: combatStates[0].state };
            } else {
                return { success: true, combatState: null };
            }
        } else {
            throw new Error('Falha ao carregar estado do combate');
        }
    } catch (error) {
        console.error('Erro ao carregar estado do combate:', error);
        return { success: false, error: error.message, combatState: null };
    }
};

// Adicionar entrada no log de combate
HexaGitHubDatabase.prototype.addCombatLogEntry = async function(logType, message) {
    try {
        const issueData = {
            title: `[HEXA_LOG] ${new Date().toISOString()}`,
            body: JSON.stringify({
                type: 'combat_log',
                logType: logType,
                message: message,
                timestamp: new Date().toISOString(),
                id: Date.now().toString()
            }),
            labels: [this.combatLabel]
        };

        const response = await this.createIssue(issueData);
        
        if (response.ok) {
            const issue = await response.json();
            console.log('Entrada de log salva:', issue.html_url);
            
            // Manter apenas as últimas 50 entradas de log
            await this.cleanupOldCombatLogs();
            
            return { success: true, issue: issue };
        } else {
            throw new Error('Falha ao salvar entrada de log');
        }
    } catch (error) {
        console.error('Erro ao salvar entrada de log:', error);
        return { success: false, error: error.message };
    }
};

// Carregar log de combate
HexaGitHubDatabase.prototype.loadCombatLog = async function() {
    try {
        const response = await this.getIssues(this.combatLabel);
        
        if (response.ok) {
            const issues = await response.json();
            const logEntries = issues.map(issue => {
                try {
                    const data = JSON.parse(issue.body);
                    if (data.type === 'combat_log') {
                        return {
                            type: data.logType,
                            message: data.message,
                            timestamp: data.timestamp,
                            id: data.id,
                            issue_number: issue.number,
                            issue_url: issue.html_url
                        };
                    }
                    return null;
                } catch (e) {
                    console.warn('Erro ao parsear entrada de log:', issue.number);
                    return null;
                }
            }).filter(entry => entry !== null);

            // Ordenar por timestamp (mais recente primeiro)
            logEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            // Manter apenas as últimas 50 entradas
            const limitedEntries = logEntries.slice(0, 50);
            
            return { success: true, logEntries: limitedEntries };
        } else {
            throw new Error('Falha ao carregar log de combate');
        }
    } catch (error) {
        console.error('Erro ao carregar log de combate:', error);
        return { success: false, error: error.message, logEntries: [] };
    }
};

// Limpar issues antigas de combate (manter apenas as 10 mais recentes)
HexaGitHubDatabase.prototype.cleanupOldCombatIssues = async function() {
    try {
        const response = await this.getIssues(this.combatLabel);
        
        if (response.ok) {
            const issues = await response.json();
            const combatStates = issues.filter(issue => {
                try {
                    const data = JSON.parse(issue.body);
                    return data.type === 'combat_state';
                } catch (e) {
                    return false;
                }
            });

            // Se tiver mais de 10, fechar as mais antigas
            if (combatStates.length > 10) {
                const toClose = combatStates
                    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                    .slice(0, combatStates.length - 10);

                for (const issue of toClose) {
                    await this.closeIssue(issue.number);
                }
            }
        }
    } catch (error) {
        console.error('Erro ao limpar issues antigas de combate:', error);
    }
};

// Limpar logs antigos (manter apenas as 50 mais recentes)
HexaGitHubDatabase.prototype.cleanupOldCombatLogs = async function() {
    try {
        const response = await this.getIssues(this.combatLabel);
        
        if (response.ok) {
            const issues = await response.json();
            const logEntries = issues.filter(issue => {
                try {
                    const data = JSON.parse(issue.body);
                    return data.type === 'combat_log';
                } catch (e) {
                    return false;
                }
            });

            // Se tiver mais de 50, fechar as mais antigas
            if (logEntries.length > 50) {
                const toClose = logEntries
                    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                    .slice(0, logEntries.length - 50);

                for (const issue of toClose) {
                    await this.closeIssue(issue.number);
                }
            }
        }
    } catch (error) {
        console.error('Erro ao limpar logs antigos:', error);
    }
};

// Fechar issue (marcar como fechada)
HexaGitHubDatabase.prototype.closeIssue = async function(issueNumber) {
    try {
        const url = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/issues/${issueNumber}`;
        
        const headers = {
            'Accept': 'application/vnd.github.v3+json'
        };

        if (this.config.token) {
            headers['Authorization'] = `token ${this.config.token}`;
        }

        const response = await fetch(url, {
            method: 'PATCH',
            headers: headers,
            body: JSON.stringify({
                state: 'closed'
            })
        });

        return response;
    } catch (error) {
        console.error('Erro ao fechar issue:', error);
        return null;
    }
};

// Instância global do banco de dados GitHub
let hexaDatabase = null;

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    hexaDatabase = new HexaGitHubDatabase();
    
    // Disponibilizar globalmente
    window.hexaDatabase = hexaDatabase;
    
    console.log('🗄️ Banco de dados GitHub H.E.X.A inicializado');
});
