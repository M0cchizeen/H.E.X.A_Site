// Teste de Conexão GitHub API
class HexaTest {
    constructor() {
        this.testResults = [];
    }

    async runAllTests() {
        console.log('🧪 Iniciando testes de conexão...');
        
        // Teste 1: Conexão básica com GitHub
        await this.testGitHubConnection();
        
        // Teste 2: Verificar repositório
        await this.testRepositoryAccess();
        
        // Teste 3: Criar issue de teste
        await this.testIssueCreation();
        
        // Teste 4: Buscar issues
        await this.testIssueRetrieval();
        
        // Teste 5: Rate limit
        await this.testRateLimit();
        
        this.displayResults();
    }

    async testGitHubConnection() {
        try {
            const response = await fetch('https://api.github.com/users/github');
            const data = await response.json();
            
            this.addResult('GitHub Connection', response.ok, 
                response.ok ? '✅ GitHub API acessível' : '❌ Falha na conexão',
                data.login
            );
        } catch (error) {
            this.addResult('GitHub Connection', false, '❌ Erro de rede', error.message);
        }
    }

    async testRepositoryAccess() {
        try {
            const owner = 'M0cchizeen'; // Username GitHub correto
            const repo = 'H.E.X.A_Site';
            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
            const data = await response.json();
            
            this.addResult('Repository Access', response.ok,
                response.ok ? '✅ Repositório acessível' : '❌ Repositório não encontrado',
                data.full_name || 'Erro'
            );
        } catch (error) {
            this.addResult('Repository Access', false, '❌ Erro ao acessar repositório', error.message);
        }
    }

    async testIssueCreation() {
        try {
            const owner = 'M0cchizeen'; // Username GitHub correto
            const repo = 'H.E.X.A_Site';
            
            const testData = {
                title: '[HEXA_TEST] Teste de Conexão',
                body: JSON.stringify({
                    test: true,
                    timestamp: Date.now(),
                    message: 'Teste automatizado de conexão com GitHub API'
                }),
                labels: ['HEXA_TEST']
            };

            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(testData)
            });

            const data = await response.json();
            
            this.addResult('Issue Creation', response.ok,
                response.ok ? '✅ Issue criada com sucesso' : '❌ Falha ao criar issue',
                `Issue #${data.number || 'Erro'}`
            );
            
            // Salvar ID para limpeza
            if (response.ok && data.id) {
                this.testIssueId = data.id;
                this.testIssueNumber = data.number;
            }
            
        } catch (error) {
            this.addResult('Issue Creation', false, '❌ Erro ao criar issue', error.message);
        }
    }

    async testIssueRetrieval() {
        try {
            const owner = 'M0cchizeen'; // Username GitHub correto
            const repo = 'H.E.X.A_Site';
            
            // Buscar issues com label HEXA_TEST
            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?labels=HEXA_TEST&state=open`);
            const data = await response.json();
            
            this.addResult('Issue Retrieval', response.ok,
                response.ok ? `✅ ${data.length} issues encontradas` : '❌ Falha ao buscar issues',
                `Total: ${data.length}`
            );
            
        } catch (error) {
            this.addResult('Issue Retrieval', false, '❌ Erro ao buscar issues', error.message);
        }
    }

    async testRateLimit() {
        try {
            const response = await fetch('https://api.github.com/rate_limit');
            const data = await response.json();
            
            const remaining = data.resources.core.remaining;
            const limit = data.resources.core.limit;
            const reset = new Date(data.resources.core.reset * 1000).toLocaleTimeString();
            
            const status = remaining > 1000 ? '✅ Bom' : remaining > 100 ? '⚠️ Médio' : '❌ Baixo';
            
            this.addResult('Rate Limit', true, status,
                `${remaining}/${limit} (reset: ${reset})`
            );
            
        } catch (error) {
            this.addResult('Rate Limit', false, '❌ Erro ao verificar rate limit', error.message);
        }
    }

    addResult(testName, success, message, details) {
        this.testResults.push({
            test: testName,
            success: success,
            message: message,
            details: details,
            timestamp: new Date().toLocaleTimeString()
        });
        
        console.log(`${message}: ${details}`);
    }

    displayResults() {
        console.log('\n🧪 === RESULTADOS DOS TESTES === 🧪\n');
        
        this.testResults.forEach(result => {
            const icon = result.success ? '✅' : '❌';
            console.log(`${icon} ${result.test}: ${result.message}`);
            console.log(`   ${result.details}\n`);
        });
        
        const successCount = this.testResults.filter(r => r.success).length;
        const totalCount = this.testResults.length;
        
        console.log(`📊 Status Geral: ${successCount}/${totalCount} testes passaram`);
        
        if (successCount === totalCount) {
            console.log('🎉 Todos os testes passaram! A conexão está funcionando.');
        } else {
            console.log('⚠️ Alguns testes falharam. Verifique os erros acima.');
        }
    }

    async cleanupTestIssues() {
        if (!this.testIssueNumber) return;
        
        try {
            const owner = 'M0cchizeen'; // Username GitHub correto
            const repo = 'H.E.X.A_Site';
            
            // Tentar fechar a issue de teste
            const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${this.testIssueNumber}`, {
                method: 'PATCH',
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    state: 'closed'
                })
            });
            
            if (response.ok) {
                console.log('🧹 Issue de teste fechada com sucesso');
            }
        } catch (error) {
            console.warn('⚠️ Não foi possível fechar a issue de teste:', error.message);
        }
    }
}

// Criar instância global
const hexaTest = new HexaTest();
window.hexaTest = hexaTest;

// Adicionar função global para executar testes
window.runHexaTests = async () => {
    await hexaTest.runAllTests();
    setTimeout(() => hexaTest.cleanupTestIssues(), 5000);
};

// Auto-executar testes após 5 segundos
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        console.log('🧪 Executando testes automáticos de conexão...');
        runHexaTests();
    }, 5000);
});
