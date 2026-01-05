// Script de Diagnóstico Rápido H.E.X.A
function quickDiagnosis() {
    console.log('🔍 INICIANDO DIAGNÓSTICO RÁPIDO H.E.X.A');
    
    // 1. Verificar configuração do repositório
    console.log('\n📁 CONFIGURAÇÃO DO REPOSITÓRIO:');
    console.log('Owner:', HexaConfig.github.owner);
    console.log('Repo:', HexaConfig.github.repo);
    console.log('Token:', HexaConfig.github.token ? '✅ Configurado' : '❌ Não configurado');
    console.log('UseToken:', HexaConfig.github.useToken);
    
    // 2. Verificar URL da API
    const apiUrl = `https://api.github.com/repos/${HexaConfig.github.owner}/${HexaConfig.github.repo}`;
    console.log('\n🌐 URL DA API:', apiUrl);
    
    // 3. Testar conexão básica
    console.log('\n🧪 TESTANDO CONEXÃO...');
    fetch(apiUrl, {
        headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': HexaConfig.github.token ? `token ${HexaConfig.github.token}` : ''
        }
    })
    .then(response => {
        console.log('Status:', response.status, response.statusText);
        if (response.ok) {
            console.log('✅ Conexão bem-sucedida!');
        } else {
            console.log('❌ Erro na conexão');
            if (response.status === 404) {
                console.log('🔧 SOLUÇÃO: Repositório não encontrado. Verifique owner/repo.');
            } else if (response.status === 403) {
                console.log('🔧 SOLUÇÃO: Token inválido ou rate limit esgotado.');
            } else if (response.status === 401) {
                console.log('🔧 SOLUÇÃO: Token inválido ou expirado.');
            }
        }
        return response.json();
    })
    .then(data => {
        if (data.id) {
            console.log('✅ Repositório encontrado:', data.name);
            console.log('👤 Dono:', data.owner.login);
            console.log('📊 Issues:', data.open_issues_count, 'abertas');
        }
    })
    .catch(error => {
        console.log('❌ Erro:', error.message);
    });
    
    // 4. Verificar rate limit
    console.log('\n📊 VERIFICANDO RATE LIMIT...');
    fetch('https://api.github.com/rate_limit', {
        headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': HexaConfig.github.token ? `token ${HexaConfig.github.token}` : ''
        }
    })
    .then(response => response.json())
    .then(data => {
        const core = data.resources.core;
        console.log('Limite:', core.limit);
        console.log('Restantes:', core.remaining);
        console.log('Reset:', new Date(core.reset * 1000).toLocaleString());
        
        if (core.remaining < 10) {
            console.log('⚠️ ATENÇÃO: Rate limit quase esgotado!');
        }
    });
    
    // 5. Verificar usuários ativos
    console.log('\n👥 VERIFICANDO USUÁRIOS ATIVOS...');
    const usersUrl = `https://api.github.com/repos/${HexaConfig.github.owner}/${HexaConfig.github.repo}/issues?labels=HEXA_HEARTBEAT&state=open`;
    fetch(usersUrl, {
        headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': HexaConfig.github.token ? `token ${HexaConfig.github.token}` : ''
        }
    })
    .then(response => response.json())
    .then(issues => {
        console.log('Usuários ativos encontrados:', issues.length);
        issues.forEach(issue => {
            try {
                const data = JSON.parse(issue.body);
                console.log(`- ${data.username} (${data.color}) - ${new Date(data.timestamp).toLocaleTimeString()}`);
            } catch (e) {
                console.log('- Erro ao parsear usuário:', issue.title);
            }
        });
    })
    .catch(error => {
        console.log('❌ Erro ao buscar usuários:', error.message);
    });
    
    // 6. Verificar estado de combate
    console.log('\n⚔️ VERIFICANDO ESTADO DE COMBATE...');
    const combatUrl = `https://api.github.com/search/issues?q=repo%3A${HexaConfig.github.owner}%2F${HexaConfig.github.repo}%20HEXA_COMBAT_STATE%20in%3Atitle`;
    fetch(combatUrl, {
        headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': HexaConfig.github.token ? `token ${HexaConfig.github.token}` : ''
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.items && data.items.length > 0) {
            const issue = data.items[0];
            try {
                const combatState = JSON.parse(issue.body);
                console.log('✅ Estado de combate encontrado:');
                console.log('- Ativo:', combatState.active ? 'Sim' : 'Não');
                console.log('- Rodada:', combatState.round);
                console.log('- Turno:', combatState.turn);
                console.log('- Iniciativa:', combatState.initiative.length || 0, 'personagens');
                console.log('- Última atualização:', new Date(issue.updated_at).toLocaleString());
            } catch (e) {
                console.log('❌ Erro ao parsear estado de combate');
            }
        } else {
            console.log('❌ Nenhum estado de combate encontrado');
        }
    })
    .catch(error => {
        console.log('❌ Erro ao buscar estado de combate:', error.message);
    });
    
    console.log('\n🔧 RECOMENDAÇÕES:');
    console.log('1. Se o repositório estiver errado, use: fixRepositoryConfig()');
    console.log('2. Se o token estiver inválido, use: setupRealToken("seu_token")');
    console.log('3. Se rate limit esgotado, aguarde o reset ou use token');
    console.log('4. Recarregue a página após correções');
}

// Função para corrigir configuração rapidamente
function quickFix() {
    console.log('🔧 APLICANDO CORREÇÕES RÁPIDAS...');
    
    // Forçar repositório correto
    HexaConfig.github.owner = 'M0cchizeen';
    HexaConfig.github.repo = 'H.E.X.A_Site';
    
    // Limpar token se estiver causando problemas
    if (HexaConfig.github.token && HexaConfig.github.token.includes(' ')) {
        console.log('🧹 Limpando token com espaços...');
        HexaConfig.github.token = HexaConfig.github.token.trim();
        HexaConfig.saveGitHubToken(HexaConfig.github.token);
    }
    
    // Atualizar sincronização
    if (typeof hexaSync !== 'undefined' && hexaSync) {
        hexaSync.setRepo(HexaConfig.github.owner, HexaConfig.github.repo, HexaConfig.github.token);
    }
    
    console.log('✅ Correções aplicadas!');
    console.log('📁 Novo repo:', HexaConfig.github.owner, '/', HexaConfig.github.repo);
    console.log('🔑 Token:', HexaConfig.github.token ? 'Configurado' : 'Não configurado');
    
    // Recarregar página em 3 segundos
    console.log('🔄 Recarregando página em 3 segundos...');
    setTimeout(() => {
        location.reload();
    }, 3000);
}

// Disponibilizar globalmente
window.quickDiagnosis = quickDiagnosis;
window.quickFix = quickFix;

console.log('🚀 Script de diagnóstico rápido carregado');
console.log('💡 Use quickDiagnosis() para diagnosticar ou quickFix() para corrigir');
