
class HexaGitHubDatabase {
    constructor() {
        this.config = {
            owner: 'M0cchizim',
            repo: 'HEXA_Site',
            token: null, // Token opcional para mais requests
        };
        
        this.messageLabel = 'hexa-social-message';
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

// Instância global do banco de dados
const hexaDatabase = new HexaGitHubDatabase();

// Disponibilizar globalmente
window.hexaDatabase = hexaDatabase;
