// Script de Emergência H.E.X.A
function emergencyFix() {
    console.log('🚨 INICIANDO CORREÇÃO DE EMERGÊNCIA');
    
    // 1. Limpar token problemático
    console.log('🧹 Limpando token com espaços...');
    localStorage.removeItem('hexaGitHubToken');
    
    // 2. Forçar repositório correto
    if (typeof HexaConfig !== 'undefined') {
        HexaConfig.github.owner = 'M0cchizeen';
        HexaConfig.github.repo = 'H.E.X.A_Site';
        HexaConfig.github.token = null;
        HexaConfig.github.useToken = false;
        console.log('✅ Repositório corrigido:', HexaConfig.github.owner, '/', HexaConfig.github.repo);
    }
    
    // 3. Limpar sessão para forçar login
    sessionStorage.removeItem('hexaAuth');
    console.log('🔓 Sessão limpa - forçando novo login');
    
    // 4. Parar sincronização atual
    if (typeof hexaSync !== 'undefined' && hexaSync) {
        if (hexaSync.syncTimer) {
            clearInterval(hexaSync.syncTimer);
        }
        if (hexaSync.heartbeatTimer) {
            clearInterval(hexaSync.heartbeatTimer);
        }
        console.log('⏹️ Sincronização parada');
    }
    
    // 5. Recarregar página
    console.log('🔄 Recarregando página em 2 segundos...');
    setTimeout(() => {
        location.reload();
    }, 2000);
}

function setupTokenCorrectly() {
    // Limpar token antigo
    localStorage.removeItem('hexaGitHubToken');
    
    // Salvar token sem espaços
    if (typeof HexaConfig !== 'undefined') {
        HexaConfig.saveGitHubToken(token.trim());
        console.log('✅ Token configurado sem espaços');
    }
    
    // Atualizar sincronização
    if (typeof hexaSync !== 'undefined' && hexaSync) {
        hexaSync.setRepo(HexaConfig.github.owner, HexaConfig.github.repo, token.trim());
        console.log('🔄 Sincronização atualizada com novo token');
    }
    
    console.log('🎯 Token configurado! Recarregue a página.');
}

function testConnection() {
    console.log('🧪 TESTANDO CONEXÃO COM TOKEN');
    
    const owner = 'M0cchizeen';
    const repo = 'H.E.X.A_Site';
    
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;
    
    fetch(apiUrl, {
        headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `token ${token.trim()}`
        }
    })
    .then(response => {
        console.log('Status:', response.status, response.statusText);
        if (response.ok) {
            console.log('✅ Conexão bem-sucedida com token!');
            return response.json();
        } else {
            console.log('❌ Erro:', response.status);
            if (response.status === 403) {
                console.log('🔍 Possíveis causas:');
                console.log('  - Token expirado');
                console.log('  - Rate limit esgotado');
                console.log('  - Token sem permissão repo');
            }
            throw new Error('Falha na conexão');
        }
    })
    .then(data => {
        console.log('✅ Repositório:', data.full_name);
        console.log('👤 Dono:', data.owner.login);
        console.log('📊 Issues abertas:', data.open_issues_count);
    })
    .catch(error => {
        console.log('❌ Erro completo:', error.message);
    });
    
    // Testar rate limit
    fetch('https://api.github.com/rate_limit', {
        headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `token ${token.trim()}`
        }
    })
    .then(response => response.json())
    .then(data => {
        const core = data.resources.core;
        console.log('📊 Rate Limit com token:');
        console.log('  - Limite:', core.limit);
        console.log('  - Restantes:', core.remaining);
        console.log('  - Reset:', new Date(core.reset * 1000).toLocaleString());
        
        if (core.remaining < 100) {
            console.log('⚠️ ATENÇÃO: Rate limit baixo!');
        }
    });
}

// Disponibilizar globalmente
window.emergencyFix = emergencyFix;
window.setupTokenCorrectly = setupTokenCorrectly;
window.testConnection = testConnection;

console.log('🚨 Script de emergência carregado!');
console.log('💡 Comandos disponíveis:');
console.log('  - emergencyFix() // Corrigir tudo e recarregar');
console.log('  - setupTokenCorrectly() // Configurar token');
console.log('  - testConnection() // Testar conexão');
