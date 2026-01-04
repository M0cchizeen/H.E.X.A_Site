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
            // Extrair owner e repo da URL
            const pathParts = window.location.pathname.split('/').filter(p => p);
            if (pathParts.length >= 1) {
                // CORREÇÃO: Forçar owner correto para este repositório
                this.github.owner = 'M0cchizeen'; // Username GitHub correto
                
                // Para GitHub Pages, o repo geralmente é username.github.io
                if (window.location.hostname === `${pathParts[0]}.github.io`) {
                    this.github.repo = pathParts[1] || this.github.owner + '.github.io';
                } else {
                    this.github.repo = pathParts[1] || this.github.owner;
                }
            }
            
            console.log('🌐 Detectado GitHub Pages:', this.github.owner, '/', this.github.repo);
        } else {
            console.log('🏠 Executando localmente, mas usando GitHub API online');
        }
        
        // Tentar carregar token salvo
        const savedToken = localStorage.getItem('hexaGitHubToken');
        if (savedToken) {
            this.github.token = savedToken;
            this.github.useToken = true;
            console.log('🔑 Token GitHub carregado do localStorage');
        }
        
        // Configurar sistema de sincronização
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
