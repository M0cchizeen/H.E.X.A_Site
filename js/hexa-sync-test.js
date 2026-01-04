// Script de teste para sincronização H.E.X.A
console.log('🧪 Iniciando teste de sincronização...');

// Verificar status atual
function checkSystemStatus() {
    const status = {
        auth: typeof hexaAuth !== 'undefined' && hexaAuth.isAuthenticated,
        user: typeof hexaUser !== 'undefined' && hexaUser.isIdentified,
        sync: typeof hexaSync !== 'undefined' && hexaSync,
        config: typeof HexaConfig !== 'undefined'
    };
    
    console.log('📊 Status do sistema:', status);
    return status;
}

// Forçar inicialização da sincronização
function forceSyncInitialization() {
    console.log('🔄 Forçando inicialização da sincronização...');
    
    const status = checkSystemStatus();
    
    if (status.auth && status.user && !status.sync) {
        // Criar instância de sincronização
        hexaSync = new HexaSync();
        window.hexaSync = hexaSync;
        
        // Configurar repositório
        if (status.config) {
            hexaSync.setRepo(HexaConfig.github.owner, HexaConfig.github.repo, HexaConfig.github.token);
        }
        
        // Iniciar sincronização
        hexaSync.init();
        console.log('✅ Sincronização forçada com sucesso!');
        
        // Testar conexão básica
        testBasicConnection();
        
    } else {
        console.log('❌ Não foi possível forçar sincronização. Status:', status);
    }
}

// Testar conexão básica sem autenticação
async function testBasicConnection() {
    try {
        console.log('🔍 Testando conexão básica...');
        
        // Testar leitura de issues públicas
        const response = await fetch(`https://api.github.com/repos/${HexaConfig.github.owner}/${HexaConfig.github.repo}/issues?state=open&per_page=5`);
        
        if (response.ok) {
            const issues = await response.json();
            console.log('✅ Conexão básica funcionando! Issues encontradas:', issues.length);
            
            // Mostrar issues HEXA se existirem
            const hexaIssues = issues.filter(issue => 
                issue.labels.some(label => 
                    label.name.includes('HEXA') || 
                    issue.title.includes('HEXA')
                )
            );
            
            if (hexaIssues.length > 0) {
                console.log('🎯 Issues HEXA encontradas:', hexaIssues.length);
                hexaIssues.forEach(issue => {
                    console.log(`  - ${issue.title} (#${issue.number})`);
                });
            } else {
                console.log('ℹ️ Nenhuma issue HEXA encontrada. Sistema pronto para criar.');
            }
            
        } else {
            console.log('❌ Erro na conexão básica:', response.status, response.statusText);
        }
        
    } catch (error) {
        console.error('❌ Erro ao testar conexão:', error);
    }
}

// Testar criação de issue (se tiver token)
async function testIssueCreation() {
    if (!HexaConfig.github.token) {
        console.log('⚠️ Sem token GitHub. Não é possível testar criação de issues.');
        return;
    }
    
    try {
        console.log('🧪 Testando criação de issue...');
        
        const testData = {
            title: '[HEXA_TEST] Teste de Sincronização',
            body: JSON.stringify({
                test: true,
                timestamp: Date.now(),
                username: hexaUser.getUsername(),
                message: 'Teste automatizado do sistema H.E.X.A'
            }),
            labels: ['HEXA_TEST']
        };

        const response = await fetch(`https://api.github.com/repos/${HexaConfig.github.owner}/${HexaConfig.github.repo}/issues`, {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'Authorization': `token ${HexaConfig.github.token}`
            },
            body: JSON.stringify(testData)
        });

        if (response.ok) {
            const issue = await response.json();
            console.log('✅ Issue de teste criada com sucesso:', `#${issue.number}`);
            
            // Fechar issue após 5 segundos
            setTimeout(() => closeTestIssue(issue.number), 5000);
            
        } else {
            const error = await response.json();
            console.log('❌ Erro ao criar issue:', error.message);
        }
        
    } catch (error) {
        console.error('❌ Erro ao testar criação:', error);
    }
}

// Fechar issue de teste
async function closeTestIssue(issueNumber) {
    try {
        const response = await fetch(`https://api.github.com/repos/${HexaConfig.github.owner}/${HexaConfig.github.repo}/issues/${issueNumber}`, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'Authorization': `token ${HexaConfig.github.token}`
            },
            body: JSON.stringify({ state: 'closed' })
        });
        
        if (response.ok) {
            console.log('🧹 Issue de teste fechada:', `#${issueNumber}`);
        }
    } catch (error) {
        console.warn('⚠️ Não foi possível fechar issue de teste:', error.message);
    }
}

// Função principal de teste
async function runSyncTest() {
    console.log('🚀 Iniciando teste completo de sincronização...');
    
    // Verificar status
    const status = checkSystemStatus();
    
    if (!status.auth) {
        console.log('❌ Sistema não autenticado. Faça login primeiro.');
        return;
    }
    
    if (!status.user) {
        console.log('❌ Usuário não identificado.');
        return;
    }
    
    // Forçar sincronização se necessário
    if (!status.sync) {
        forceSyncInitialization();
    }
    
    // Aguardar um pouco e testar
    setTimeout(() => {
        testBasicConnection();
        
        if (HexaConfig.github.token) {
            setTimeout(() => testIssueCreation(), 2000);
        } else {
            console.log('💡 Dica: Configure um token GitHub para testes completos.');
        }
    }, 1000);
}

// Disponibilizar funções globalmente
window.runSyncTest = runSyncTest;
window.forceSyncInitialization = forceSyncInitialization;
window.checkSystemStatus = checkSystemStatus;

// Executar teste automaticamente após 3 segundos
setTimeout(() => {
    console.log('⏰ Executando teste automático...');
    runSyncTest();
}, 3000);

console.log('🧪 Script de teste carregado. Use runSyncTest() para testar manualmente.');
