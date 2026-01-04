// Configuração do H.E.X.A para GitHub Pages
// ATENÇÃO: Altere estes valores antes de publicar!

const HexaConfig = {
    // Configurações do repositório GitHub
    github: {
        owner: 'm0cchizimM0cchizeen', // Altere para seu username GitHub
        repo: 'H.E.X.A_Site',     // Altere para o nome do seu repositório
        token: null           // Opcional: token para maior limite de API
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
                this.github.owner = pathParts[0];
                this.github.repo = pathParts[1] || this.github.owner + '.github.io';
            }
            
            console.log('🌐 Detectado GitHub Pages:', this.github.owner, '/', this.github.repo);
        }
        
        // Configurar sistema de sincronização
        if (typeof hexaSync !== 'undefined' && hexaSync) {
            hexaSync.setRepo(this.github.owner, this.github.repo, this.github.token);
        }
        
        // Configurar sistema de autenticação
        if (typeof hexaAuth !== 'undefined' && hexaAuth) {
            hexaAuth.masterPassword = this.auth.masterPassword;
        }
        
        console.log('⚙️ Configuração H.E.X.A carregada');
    }
};

// Auto-inicializar quando carregar
document.addEventListener('DOMContentLoaded', () => {
    HexaConfig.init();
    
    // Disponibilizar globalmente
    window.HexaConfig = HexaConfig;
});
