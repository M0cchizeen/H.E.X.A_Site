// Sistema de Autenticação H.E.X.A - CORRIGIDO
class HexaAuth {
    constructor() {
        this.masterPassword = 'hexa2026';
        this.isAuthenticated = false;
        this.loginScreen = null;
        this.sessionTimeout = 24 * 60 * 60 * 1000; // 24 horas
    }

    init() {
        // Verificar se já está autenticado
        if (this.checkAuthentication()) {
            this.isAuthenticated = true;
            console.log('🔓 Usuário já autenticado');
            return true;
        }

        // Mostrar tela de login
        this.showLoginScreen();
        return false;
    }

    checkAuthentication() {
        const sessionData = sessionStorage.getItem('hexaAuth');
        if (sessionData) {
            try {
                const data = JSON.parse(sessionData);
                const now = Date.now();
                
                // Verificar se a sessão ainda é válida
                if (data.timestamp && (now - data.timestamp) < this.sessionTimeout) {
                    return true;
                } else {
                    // Sessão expirada
                    sessionStorage.removeItem('hexaAuth');
                }
            } catch (e) {
                sessionStorage.removeItem('hexaAuth');
            }
        }
        return false;
    }

    showLoginScreen() {
        // Criar overlay de login
        this.loginScreen = document.createElement('div');
        this.loginScreen.id = 'hexaLoginScreen';
        this.loginScreen.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #000000 0%, #1a1a2e 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 999999;
            font-family: 'Orbitron', monospace;
        `;

        this.loginScreen.innerHTML = `
            <div style="
                background: rgba(0, 0, 0, 0.9);
                border: 2px solid #667eea;
                border-radius: 15px;
                padding: 40px;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 0 30px rgba(102, 126, 234, 0.5);
                text-align: center;
            ">
                <h1 style="
                    color: #667eea;
                    margin-bottom: 10px;
                    font-size: 2.5rem;
                    text-shadow: 0 0 20px rgba(102, 126, 234, 0.8);
                    animation: glow 2s ease-in-out infinite alternate;
                ">H.E.X.A</h1>
                <p style="
                    color: #ffffff;
                    margin-bottom: 30px;
                    font-size: 0.9rem;
                    opacity: 0.8;
                ">Sistema de Combate Avançado</p>
                
                <div style="margin-bottom: 20px;">
                    <label style="
                        display: block;
                        color: #667eea;
                        margin-bottom: 10px;
                        font-size: 0.8rem;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                    ">Senha de Acesso</label>
                    <input 
                        type="password" 
                        id="hexaPasswordInput"
                        placeholder="Digite a senha..."
                        style="
                            width: 100%;
                            padding: 15px;
                            background: rgba(102, 126, 234, 0.1);
                            border: 1px solid #667eea;
                            border-radius: 8px;
                            color: #ffffff;
                            font-size: 1rem;
                            font-family: 'Orbitron', monospace;
                            outline: none;
                            transition: all 0.3s;
                        "
                        onfocus="this.style.borderColor='#007bff'; this.style.boxShadow='0 0 10px rgba(0, 123, 255, 0.5)'"
                        onblur="this.style.borderColor='#667eea'; this.style.boxShadow='none'"
                    >
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="
                        display: block;
                        color: #667eea;
                        margin-bottom: 10px;
                        font-size: 0.7rem;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                    ">Token GitHub (Opcional)</label>
                    <input 
                        type="password" 
                        id="hexaTokenInput"
                        placeholder="ghp_xxxxxxxxxxxx..."
                        style="
                            width: 100%;
                            padding: 12px;
                            background: rgba(102, 126, 234, 0.05);
                            border: 1px solid #444;
                            border-radius: 8px;
                            color: #ffffff;
                            font-size: 0.9rem;
                            font-family: 'Courier New', monospace;
                            outline: none;
                            transition: all 0.3s;
                        "
                        onfocus="this.style.borderColor='#007bff'; this.style.boxShadow='0 0 10px rgba(0, 123, 255, 0.3)'"
                        onblur="this.style.borderColor='#444'; this.style.boxShadow='none'"
                    >
                </div>
                
                <button 
                    id="hexaLoginBtn"
                    style="
                        width: 100%;
                        padding: 15px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        border: none;
                        border-radius: 8px;
                        color: white;
                        font-size: 1rem;
                        font-weight: bold;
                        cursor: pointer;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                        transition: all 0.3s;
                        margin-bottom: 10px;
                    "
                    onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 5px 20px rgba(102, 126, 234, 0.5)'"
                    onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'"
                    onclick="hexaAuth.login()"
                >Acessar Sistema</button>
                
                <div style="
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 0.7rem;
                    margin-top: 20px;
                ">
                    <p>Acesso restrito • Sistema protegido</p>
                </div>
            </div>
            
            <style>
                @keyframes glow {
                    from { text-shadow: 0 0 20px rgba(102, 126, 234, 0.8); }
                    to { text-shadow: 0 0 30px rgba(102, 126, 234, 1), 0 0 40px rgba(102, 126, 234, 0.6); }
                }
            </style>
        `;

        // Adicionar ao body
        document.body.appendChild(this.loginScreen);
        
        // Focar no input
        setTimeout(() => {
            const input = document.getElementById('hexaPasswordInput');
            if (input) {
                input.focus();
                
                // Adicionar evento Enter
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.login();
                    }
                });
            }
        }, 100);
    }

    login() {
        const input = document.getElementById('hexaPasswordInput');
        const tokenInput = document.getElementById('hexaTokenInput');
        const password = input ? input.value.trim() : '';
        const token = tokenInput ? tokenInput.value.trim() : '';
        
        if (password === this.masterPassword) {
            // Salvar sessão
            const sessionData = {
                timestamp: Date.now(),
                authenticated: true
            };
            sessionStorage.setItem('hexaAuth', JSON.stringify(sessionData));
            
            // Salvar token GitHub se fornecido
            if (token && typeof HexaConfig !== 'undefined') {
                HexaConfig.saveGitHubToken(token);
                console.log('🔑 Token GitHub configurado');
            }
            
            this.isAuthenticated = true;
            
            // Remover tela de login
            if (this.loginScreen) {
                this.loginScreen.style.opacity = '0';
                this.loginScreen.style.transition = 'opacity 0.5s';
                setTimeout(() => {
                    if (this.loginScreen && this.loginScreen.parentNode) {
                        this.loginScreen.parentNode.removeChild(this.loginScreen);
                    }
                }, 500);
            }
            
            console.log('🔓 Login bem-sucedido');
            
            // Iniciar sincronização
            if (typeof hexaSync !== 'undefined' && hexaSync) {
                hexaSync.init();
            }
            
            return true;
        } else {
            // Senha incorreta
            this.showError();
            return false;
        }
    }

    showError() {
        const input = document.getElementById('hexaPasswordInput');
        const btn = document.getElementById('hexaLoginBtn');
        
        if (input) {
            input.style.borderColor = '#ff0000';
            input.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.5)';
            input.value = '';
            input.placeholder = '❌ Senha incorreta!';
            
            setTimeout(() => {
                input.style.borderColor = '#667eea';
                input.style.boxShadow = 'none';
                input.placeholder = 'Digite a senha...';
                input.focus();
            }, 2000);
        }
        
        if (btn) {
            btn.textContent = '❌ Acesso Negado';
            btn.style.background = 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)';
            
            setTimeout(() => {
                btn.textContent = 'Acessar Sistema';
                btn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            }, 2000);
        }
    }

    logout() {
        sessionStorage.removeItem('hexaAuth');
        this.isAuthenticated = false;
        location.reload();
    }
}

// Criar instância global
const hexaAuth = new HexaAuth();

// Auto-inicializar quando carregar
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar sistema de autenticação
    const authenticated = hexaAuth.init();
    
    // Disponibilizar globalmente
    window.hexaAuth = hexaAuth;
    
    console.log('🔐 Sistema de autenticação H.E.X.A carregado');
});
