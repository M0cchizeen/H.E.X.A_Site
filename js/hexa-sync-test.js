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
        
        // Testar 1: Requisição simples (como o curl)
        console.log('🧪 Teste 1: Requisição simples...');
        const simpleResponse = await fetch(`https://api.github.com/repos/${HexaConfig.github.owner}/${HexaConfig.github.repo}/issues?state=open&per_page=5`, {
            method: 'GET',
            mode: 'cors'
        });
        
        console.log('📊 Status requisição simples:', simpleResponse.status);
        console.log('📋 Headers:', [...simpleResponse.headers.entries()]);
        
        if (simpleResponse.ok) {
            const issues = await simpleResponse.json();
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
            console.log('❌ Erro na conexão básica:', simpleResponse.status, simpleResponse.statusText);
            const errorText = await simpleResponse.text();
            console.log('📄 Corpo do erro:', errorText);
        }
        
        // Testar 2: Requisição com headers padrão (como o sistema usa)
        console.log('🧪 Teste 2: Requisição com headers padrão...');
        const headerResponse = await fetch(`https://api.github.com/repos/${HexaConfig.github.owner}/${HexaConfig.github.repo}/issues?state=open&per_page=5`, {
            method: 'GET',
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            mode: 'cors'
        });
        
        console.log('📊 Status requisição com headers:', headerResponse.status);
        
        if (headerResponse.ok) {
            console.log('✅ Requisição com headers funcionando!');
        } else {
            console.log('❌ Erro com headers:', headerResponse.status);
            const errorText = await headerResponse.text();
            console.log('📄 Corpo do erro com headers:', errorText);
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

// Criar token de teste simulado (para demonstração)
function createDemoToken() {
    console.log('🎭 Criando ambiente de demonstração...');
    
    // Simular token para testes (não funciona realmente, mas evita erro 401)
    const demoToken = 'demo_token_' + Date.now();
    HexaConfig.saveGitHubToken(demoToken);
    
    console.log('🎭 Token demo configurado:', demoToken.substring(0, 20) + '...');
    console.log('⚠️ Este é um token de demonstração e não funcionará para criar issues reais.');
    console.log('💡 Para funcionamento completo, configure um token GitHub real.');
    
    // Forçar reinicialização da sincronização
    if (typeof hexaSync !== 'undefined' && hexaSync) {
        hexaSync.setRepo(HexaConfig.github.owner, HexaConfig.github.repo, demoToken);
    }
    
    return demoToken;
}

// Função para configurar token real
function setupRealToken(token) {
    if (!token || !token.startsWith('ghp_')) {
        console.log('❌ Token inválido. Tokens GitHub começam com "ghp_"');
        return false;
    }
    
    console.log('🔑 Configurando token GitHub real...');
    HexaConfig.saveGitHubToken(token);
    
    // Atualizar sincronização se existir
    if (typeof hexaSync !== 'undefined' && hexaSync) {
        hexaSync.setRepo(HexaConfig.github.owner, HexaConfig.github.repo, token);
    }
    
    console.log('✅ Token GitHub configurado com sucesso!');
    return true;
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
            console.log('🎭 Ou use createDemoToken() para criar ambiente de demonstração.');
        }
    }, 1000);
}

// Função para corrigir configuração do repositório
function fixRepositoryConfig() {
    console.log('🔧 Corrigindo configuração do repositório...');
    
    // Configurar manualmente o owner correto
    HexaConfig.github.owner = 'M0cchizeen';
    HexaConfig.github.repo = 'H.E.X.A_Site';
    
    console.log('✅ Configuração corrigida:');
    console.log('  - Owner:', HexaConfig.github.owner);
    console.log('  - Repo:', HexaConfig.github.repo);
    
    // Atualizar sincronização se existir
    if (typeof hexaSync !== 'undefined' && hexaSync) {
        hexaSync.setRepo(HexaConfig.github.owner, HexaConfig.github.repo, HexaConfig.github.token);
        console.log('🔄 Sincronização atualizada com nova configuração');
    }
    
    // Salvar no localStorage para persistir
    localStorage.setItem('hexaRepoOwner', 'M0cchizeen');
    localStorage.setItem('hexaRepoName', 'H.E.X.A_Site');
    
    return true;
}

// Função para verificar configuração atual
function checkRepositoryConfig() {
    console.log('📋 Verificando configuração do repositório...');
    console.log('  - Owner atual:', HexaConfig.github.owner);
    console.log('  - Repo atual:', HexaConfig.github.repo);
    console.log('  - URL esperada:', 'M0cchizeen/H.E.X.A_Site');
    
    const isCorrect = HexaConfig.github.owner === 'M0cchizeen' && 
                     HexaConfig.github.repo === 'H.E.X.A_Site';
    
    if (isCorrect) {
        console.log('✅ Configuração do repositório está correta!');
    } else {
        console.log('❌ Configuração do repositório está incorreta!');
        console.log('💡 Execute fixRepositoryConfig() para corrigir');
    }
    
    return isCorrect;
}
async function fullDiagnosis() {
    console.log('🔬 Iniciando diagnóstico completo...');
    
    // 1. Verificar configuração
    console.log('📋 Configuração atual:');
    console.log('  - Owner:', HexaConfig.github.owner);
    console.log('  - Repo:', HexaConfig.github.repo);
    console.log('  - Token:', HexaConfig.github.token ? 'Configurado' : 'Não configurado');
    console.log('  - Use Token:', HexaConfig.github.useToken);
    
    // 2. Testar diferentes endpoints
    const endpoints = [
        '/repos/' + HexaConfig.github.owner + '/' + HexaConfig.github.repo,
        '/repos/' + HexaConfig.github.owner + '/' + HexaConfig.github.repo + '/issues',
        '/repos/' + HexaConfig.github.owner + '/' + HexaConfig.github.repo + '/issues?state=open&per_page=1'
    ];
    
    for (const endpoint of endpoints) {
        try {
            console.log('🔍 Testando endpoint:', endpoint);
            const response = await fetch('https://api.github.com' + endpoint);
            console.log('  Status:', response.status);
            
            if (response.status === 401) {
                const error = await response.json();
                console.log('  Erro 401:', error.message);
            }
        } catch (error) {
            console.log('  Erro:', error.message);
        }
    }
    
    // 3. Verificar rate limit
    try {
        const rateResponse = await fetch('https://api.github.com/rate_limit');
        const rateData = await rateResponse.json();
        console.log('📊 Rate Limit:');
        console.log('  - Remaining:', rateData.resources.core.remaining);
        console.log('  - Limit:', rateData.resources.core.limit);
        console.log('  - Reset:', new Date(rateData.resources.core.reset * 1000).toLocaleString());
    } catch (error) {
        console.log('❌ Erro ao verificar rate limit:', error.message);
    }
}

// Disponibilizar funções globalmente
window.runSyncTest = runSyncTest;
window.forceSyncInitialization = forceSyncInitialization;
window.checkSystemStatus = checkSystemStatus;
window.createDemoToken = createDemoToken;
window.setupRealToken = setupRealToken;
window.fullDiagnosis = fullDiagnosis;
window.fixRepositoryConfig = fixRepositoryConfig;
window.checkRepositoryConfig = checkRepositoryConfig;

// Executar teste automaticamente após 3 segundos
setTimeout(() => {
    console.log('⏰ Executando teste automático...');
    
    // Primeiro verificar configuração do repositório
    checkRepositoryConfig();
    
    // Se estiver incorreto, corrigir automaticamente
    if (HexaConfig.github.owner !== 'M0cchizeen' || HexaConfig.github.repo !== 'H.E.X.A_Site') {
        console.log('🔧 Configuração incorreta detectada, corrigindo automaticamente...');
        fixRepositoryConfig();
        
        // Aguardar um pouco e executar teste
        setTimeout(() => {
            runSyncTest();
        }, 1000);
    } else {
        // Se estiver correto, executar teste normal
        runSyncTest();
    }
}, 3000);

console.log('🧪 Script de teste carregado. Use runSyncTest() para testar manualmente.');
