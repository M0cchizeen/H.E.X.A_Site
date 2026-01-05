// Configuração do H.E.X.A para GitHub Pages
// ATENÇÃO: Altere estes valores antes de publicar!

const HexaConfig = {
    // Configurações do repositório GitHub
    github: {
        owner: 'M0cchizeen', // Username GitHub correto
        repo: 'H.E.X.A_Site',     // Nome do repositório
        token: null,           // Token de API GitHub (opcional, mas recomendado)
        useToken: false        // Habilitar uso de token quando disponível
    },
    
    // Configurações de autenticação
    auth: {
        masterPassword: 'hexa2026', // Senha de acesso ao site
        sessionTimeout: 24 * 60 * 60 * 1000 // 24 horas em milissegundos
    },
    
    // Configurações de sincronização
    sync: {
        interval: 5000,        // 5 segundos entre sincronizações
        retryAttempts: 3,      // Tentativas de reconexão
        retryDelay: 2000       // Delay entre tentativas (ms)
    },
    
    // Configurações do jogo
    game: {
        autoSave: true,         // Salvar automaticamente
        autoSaveInterval: 30000 // 30 segundos
    },
    
    // Inicializar configuração
    init() {
        // Detectar se está rodando no GitHub Pages
        const isGitHubPages = window.location.hostname.includes('github.io');
        
        if (isGitHubPages) {
            // CORREÇÃO CRÍTICA: Forçar repositório correto
            this.github.owner = 'M0cchizeen';
            this.github.repo = 'H.E.X.A_Site';
            
            console.log('🌐 Detectado GitHub Pages - Forçando repo correto:', this.github.owner, '/', this.github.repo);
        } else {
            console.log('🏠 Executando localmente, mas usando GitHub API online');
        }
        
        // Tentar carregar token salvo
        const savedToken = localStorage.getItem('hexaGitHubToken');
        if (savedToken && savedToken.trim()) {
            this.github.token = savedToken.trim();
            this.github.useToken = true;
            console.log('🔑 Token GitHub carregado do localStorage');
        } else {
            this.github.useToken = false;
            console.log('⚠️ Nenhum token GitHub encontrado');
        }
        
        if (typeof hexaSync !== 'undefined' && hexaSync) {
            hexaSync.setRepo(this.github.owner, this.github.repo, this.github.token);
        }
        
        // Configurar sistema de autenticação
        if (typeof hexaAuth !== 'undefined' && hexaAuth) {
            hexaAuth.masterPassword = this.auth.masterPassword;
        }
        
        console.log('⚙️ Configuração H.E.X.A carregada (modo online)');
    },
    
    // Salvar token GitHub
    saveGitHubToken(token) {
        if (token && token.trim()) {
            this.github.token = token.trim();
            this.github.useToken = true;
            localStorage.setItem('hexaGitHubToken', token.trim());
            console.log('🔑 Token GitHub salvo');
            
            // Atualizar sincronização se já estiver ativa
            if (typeof hexaSync !== 'undefined' && hexaSync) {
                hexaSync.setRepo(this.github.owner, this.github.repo, this.github.token);
            }
            
            return true;
        }
        return false;
    },
    
    // Remover token GitHub
    removeGitHubToken() {
        this.github.token = null;
        this.github.useToken = false;
        localStorage.removeItem('hexaGitHubToken');
        console.log('🗑️ Token GitHub removido');
        
        // Atualizar sincronização se já estiver ativa
        if (typeof hexaSync !== 'undefined' && hexaSync) {
            hexaSync.setRepo(this.github.owner, this.github.repo, null);
        }
    }
};

// Auto-inicializar quando carregar
document.addEventListener('DOMContentLoaded', () => {
    HexaConfig.init();
    
    // Disponibilizar globalmente
    window.HexaConfig = HexaConfig;
});
