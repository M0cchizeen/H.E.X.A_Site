// Sistema de Autenticação H.E.X.A
class HexaAuth {
    constructor() {
        this.masterPassword = 'adm1818'; // Senha master (pode ser alterada)
        this.sessionKey = 'hexa_authenticated';
        this.init();
    }

    init() {
        // Verificar se já está autenticado
        if (!this.isAuthenticated()) {
            this.showLoginScreen();
        }
    }

    isAuthenticated() {
        return sessionStorage.getItem(this.sessionKey) === 'true';
    }

    showLoginScreen() {
        // Criar tela de login
        const loginHTML = `
            <div id="hexa-login" style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 999999;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            ">
                <div style="
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(10px);
                    padding: 40px;
                    border-radius: 15px;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                    text-align: center;
                    max-width: 400px;
                    width: 90%;
                ">
                    <h1 style="
                        color: white;
                        margin-bottom: 10px;
                        font-size: 2.5rem;
                        text-shadow: 0 0 20px rgba(102, 126, 234, 0.8);
                    ">H.E.X.A</h1>
                    <p style="
                        color: rgba(255, 255, 255, 0.8);
                        margin-bottom: 30px;
                        font-size: 1rem;
                    ">Sistema de Acesso Restrito</p>
                    
                    <div style="margin-bottom: 20px;">
                        <input 
                            type="password" 
                            id="hexa-password-input" 
                            placeholder="Digite a senha de acesso"
                            style="
                                width: 100%;
                                padding: 15px;
                                background: rgba(255, 255, 255, 0.1);
                                border: 1px solid rgba(255, 255, 255, 0.3);
                                border-radius: 8px;
                                color: white;
                                font-size: 16px;
                                text-align: center;
                                box-sizing: border-box;
                            "
                        >
                    </div>
                    
                    <button 
                        id="hexa-login-btn"
                        style="
                            width: 100%;
                            padding: 15px;
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            border: none;
                            border-radius: 8px;
                            color: white;
                            font-size: 16px;
                            font-weight: bold;
                            cursor: pointer;
                            transition: all 0.3s ease;
                            margin-bottom: 15px;
                        "
                    >
                        ACESSAR SISTEMA
                    </button>
                    
                    <div id="hexa-error" style="
                        color: #ff6b6b;
                        font-size: 14px;
                        margin-top: 10px;
                        display: none;
                    ">Senha incorreta. Tente novamente.</div>
                    
                    <p style="
                        color: rgba(255, 255, 255, 0.6);
                        font-size: 12px;
                        margin-top: 20px;
                    ">Acesso autorizado apenas para usuários credenciados</p>
                </div>
            </div>
        `;

        // Adicionar tela de login ao body
        document.body.insertAdjacentHTML('beforeend', loginHTML);
        
        // Configurar eventos
        this.setupLoginEvents();
        
        // Esconder conteúdo principal
        document.body.style.overflow = 'hidden';
        
        // Esconder todos os elementos existentes
        const existingElements = document.body.children;
        for (let element of existingElements) {
            if (element.id !== 'hexa-login') {
                element.style.display = 'none';
            }
        }
    }

    setupLoginEvents() {
        const passwordInput = document.getElementById('hexa-password-input');
        const loginBtn = document.getElementById('hexa-login-btn');
        const errorDiv = document.getElementById('hexa-error');

        // Evento de clique no botão
        loginBtn.addEventListener('click', () => this.attemptLogin());

        // Evento de Enter no input
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.attemptLogin();
            }
        });

        // Foco no input
        passwordInput.focus();
    }

    async attemptLogin() {
        const passwordInput = document.getElementById('hexa-password-input');
        const errorDiv = document.getElementById('hexa-error');
        const loginBtn = document.getElementById('hexa-login-btn');
        
        const password = passwordInput.value.trim();
        
        // Desabilitar botão durante verificação
        loginBtn.disabled = true;
        loginBtn.textContent = 'VERIFICANDO...';
        
        // Simular verificação (em produção poderia ser API call)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (password === this.masterPassword) {
            // Sucesso!
            sessionStorage.setItem(this.sessionKey, 'true');
            this.hideLoginScreen();
        } else {
            // Erro
            errorDiv.style.display = 'block';
            passwordInput.value = '';
            passwordInput.focus();
            
            // Resetar botão
            loginBtn.disabled = false;
            loginBtn.textContent = 'ACESSAR SISTEMA';
            
            // Esconder erro após 3 segundos
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 3000);
        }
    }

    hideLoginScreen() {
        const loginScreen = document.getElementById('hexa-login');
        
        // Fade out
        loginScreen.style.transition = 'opacity 0.5s ease';
        loginScreen.style.opacity = '0';
        
        setTimeout(() => {
            // Remover tela de login
            loginScreen.remove();
            
            // Mostrar conteúdo principal
            document.body.style.overflow = 'auto';
            
            // Mostrar todos os elementos existentes
            const existingElements = document.body.children;
            for (let element of existingElements) {
                element.style.display = '';
            }
            
            // Inicializar o site normalmente
            if (typeof initializeSite === 'function') {
                initializeSite();
            }
        }, 500);
    }

    // Método para logout (opcional)
    logout() {
        sessionStorage.removeItem(this.sessionKey);
        location.reload();
    }
}

// Inicializar sistema de autenticação
const hexaAuth = new HexaAuth();

// Adicionar método de logout global
window.hexaLogout = () => hexaAuth.logout();
