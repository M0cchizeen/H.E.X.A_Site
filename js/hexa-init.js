// Script de inicialização do H.E.X.A com Sistema de Usuários
// Este script deve ser executado antes de tudo para garantir o funcionamento do login

(function() {
    // Sistema de usuários
    const users = {
        admin: {
            username: 'admin',
            password: 'adm1818',
            role: 'admin',
            permissions: ['all']
        }
    };
    
    // Verificar se já está autenticado ANTES de carregar qualquer conteúdo
    const sessionKey = 'hexa_authenticated';
    const userKey = 'hexa_current_user';
    const isAuthenticated = sessionStorage.getItem(sessionKey) === 'true';
    const currentUser = JSON.parse(sessionStorage.getItem(userKey) || '{}');
    
    if (!isAuthenticated) {
        // Esperar o DOM estar pronto para esconder conteúdo
        function hideContentAndShowLogin() {
            // Esconder conteúdo imediatamente
            if (document.documentElement) {
                document.documentElement.style.visibility = 'hidden';
            }
            if (document.body) {
                document.body.style.visibility = 'hidden';
            }
            
            // Mostrar apenas o conteúdo de login
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
                    visibility: visible;
                ">
                    <div style="
                        background: rgba(255, 255, 255, 0.1);
                        backdrop-filter: blur(10px);
                        padding: 40px;
                        border-radius: 15px;
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                        text-align: center;
                        max-width: 450px;
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
                        
                        <div id="login-form">
                            <div style="margin-bottom: 15px;">
                                <input 
                                    type="text" 
                                    id="hexa-username-input" 
                                    placeholder="Nome de usuário"
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
                                        margin-bottom: 10px;
                                    "
                                >
                            </div>
                            
                            <div style="margin-bottom: 20px;">
                                <input 
                                    type="password" 
                                    id="hexa-password-input" 
                                    placeholder="Senha"
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
                                ENTRAR
                            </button>
                        </div>
                        
                        <div style="margin: 20px 0; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 20px;">
                            <button 
                                id="hexa-register-btn"
                                style="
                                    width: 100%;
                                    padding: 12px;
                                    background: transparent;
                                    border: 1px solid rgba(102, 126, 234, 0.5);
                                    border-radius: 8px;
                                    color: rgba(102, 126, 234, 0.8);
                                    font-size: 14px;
                                    cursor: pointer;
                                    transition: all 0.3s ease;
                                    margin-bottom: 10px;
                                "
                            >
                                Criar Novo Usuário
                            </button>
                        </div>
                        
                        <div id="hexa-error" style="
                            color: #ff6b6b;
                            font-size: 14px;
                            margin-top: 10px;
                            display: none;
                        ">Usuário ou senha incorretos.</div>
                        
                        <p style="
                            color: rgba(255, 255, 255, 0.6);
                            font-size: 12px;
                            margin-top: 20px;
                        ">Acesso autorizado apenas para usuários credenciados</p>
                    </div>
                </div>
            `;
            
            // Limpar body e adicionar apenas login
            if (document.body) {
                document.body.innerHTML = loginHTML;
                document.body.style.visibility = 'visible';
                
                // Configurar eventos de login
                setupLoginEvents();
            }
        }
        
        // Executar imediatamente se DOM já estiver pronto, senão esperar
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', hideContentAndShowLogin);
        } else {
            hideContentAndShowLogin();
        }
    } else {
        // Se já está autenticado, mostrar conteúdo normalmente
        function showContent() {
            if (document.documentElement) {
                document.documentElement.style.visibility = 'visible';
            }
            if (document.body) {
                document.body.style.visibility = 'visible';
            }
            
            // Disponibilizar dados do usuário globalmente
            window.hexaCurrentUser = currentUser;
            
            // Adicionar indicador de usuário no painel admin se for admin
            if (currentUser.role === 'admin') {
                addUserIndicator();
            }
        }
        
        // Executar imediatamente se DOM já estiver pronto, senão esperar
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', showContent);
        } else {
            showContent();
        }
    }
    
    function addUserIndicator() {
        setTimeout(() => {
            const adminPanel = document.getElementById('adminPanel');
            if (adminPanel) {
                const indicator = document.createElement('div');
                indicator.style.cssText = `
                    background: rgba(255,255,255,0.1);
                    padding: 8px;
                    margin: 10px 0;
                    border-radius: 5px;
                    font-size: 12px;
                    text-align: center;
                `;
                indicator.innerHTML = `👤 Usuário: <strong>${currentUser.username}</strong> (ADMIN)`;
                adminPanel.appendChild(indicator);
            }
        }, 100);
    }
    
    function setupLoginEvents() {
        const usernameInput = document.getElementById('hexa-username-input');
        const passwordInput = document.getElementById('hexa-password-input');
        const loginBtn = document.getElementById('hexa-login-btn');
        const registerBtn = document.getElementById('hexa-register-btn');
        const errorDiv = document.getElementById('hexa-error');
        
        if (!usernameInput || !passwordInput || !loginBtn) return;
        
        // Evento de clique no botão de login
        loginBtn.addEventListener('click', attemptLogin);
        
        // Evento de clique no botão de registro
        registerBtn.addEventListener('click', showRegisterForm);
        
        // Evento de Enter nos inputs
        usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                passwordInput.focus();
            }
        });
        
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                attemptLogin();
            }
        });
        
        // Foco no username
        usernameInput.focus();
        
        async function attemptLogin() {
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();
            
            if (!username || !password) {
                showError('Preencha todos os campos.');
                return;
            }
            
            // Desabilitar botão durante verificação
            loginBtn.disabled = true;
            loginBtn.textContent = 'VERIFICANDO...';
            
            // Simular verificação
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Verificar usuário
            const user = users[username];
            if (user && user.password === password) {
                // Sucesso!
                sessionStorage.setItem(sessionKey, 'true');
                sessionStorage.setItem(userKey, JSON.stringify({
                    username: user.username,
                    role: user.role,
                    permissions: user.permissions
                }));
                
                // Fade out
                const loginScreen = document.getElementById('hexa-login');
                if (loginScreen) {
                    loginScreen.style.transition = 'opacity 0.5s ease';
                    loginScreen.style.opacity = '0';
                    
                    setTimeout(() => {
                        // Recarregar a página para mostrar o conteúdo real
                        location.reload();
                    }, 500);
                } else {
                    // Fallback se não encontrar o elemento
                    location.reload();
                }
            } else {
                // Erro
                showError('Usuário ou senha incorretos.');
                passwordInput.value = '';
                passwordInput.focus();
                
                // Resetar botão
                loginBtn.disabled = false;
                loginBtn.textContent = 'ENTRAR';
            }
        }
        
        function showRegisterForm() {
            const loginForm = document.getElementById('login-form');
            loginForm.innerHTML = `
                <h3 style="color: white; margin-bottom: 20px;">Criar Novo Usuário</h3>
                
                <div style="margin-bottom: 15px;">
                    <input 
                        type="text" 
                        id="reg-username-input" 
                        placeholder="Nome de usuário"
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
                            margin-bottom: 10px;
                        "
                    >
                </div>
                
                <div style="margin-bottom: 15px;">
                    <input 
                        type="password" 
                        id="reg-password-input" 
                        placeholder="Senha"
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
                            margin-bottom: 10px;
                        "
                    >
                </div>
                
                <div style="margin-bottom: 15px;">
                    <input 
                        type="password" 
                        id="reg-confirm-input" 
                        placeholder="Confirmar senha"
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
                            margin-bottom: 10px;
                        "
                    >
                </div>
                
                <button 
                    id="hexa-create-user-btn"
                    style="
                        width: 100%;
                        padding: 15px;
                        background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%);
                        border: none;
                        border-radius: 8px;
                        color: #000;
                        font-size: 16px;
                        font-weight: bold;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        margin-bottom: 15px;
                    "
                >
                    CRIAR USUÁRIO
                </button>
                
                <button 
                    id="hexa-back-login-btn"
                    style="
                        width: 100%;
                        padding: 12px;
                        background: transparent;
                        border: 1px solid rgba(255, 255, 255, 0.3);
                        border-radius: 8px;
                        color: rgba(255, 255, 255, 0.7);
                        font-size: 14px;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    "
                >
                    ← Voltar para Login
                </button>
                
                <div id="reg-error" style="
                    color: #ff6b6b;
                    font-size: 14px;
                    margin-top: 10px;
                    display: none;
                "></div>
            `;
            
            // Configurar eventos do formulário de registro
            setupRegisterEvents();
        }
        
        function setupRegisterEvents() {
            const usernameInput = document.getElementById('reg-username-input');
            const passwordInput = document.getElementById('reg-password-input');
            const confirmInput = document.getElementById('reg-confirm-input');
            const createBtn = document.getElementById('hexa-create-user-btn');
            const backBtn = document.getElementById('hexa-back-login-btn');
            const errorDiv = document.getElementById('reg-error');
            
            if (!usernameInput || !passwordInput || !confirmInput || !createBtn) return;
            
            createBtn.addEventListener('click', attemptRegister);
            backBtn.addEventListener('click', hideContentAndShowLogin);
            
            // Eventos de Enter
            usernameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') passwordInput.focus();
            });
            
            passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') confirmInput.focus();
            });
            
            confirmInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') attemptRegister();
            });
            
            usernameInput.focus();
            
            async function attemptRegister() {
                const username = usernameInput.value.trim();
                const password = passwordInput.value.trim();
                const confirm = confirmInput.value.trim();
                
                if (!username || !password || !confirm) {
                    showRegError('Preencha todos os campos.');
                    return;
                }
                
                if (password !== confirm) {
                    showRegError('As senhas não coincidem.');
                    return;
                }
                
                if (users[username]) {
                    showRegError('Este usuário já existe.');
                    return;
                }
                
                if (username.length < 3) {
                    showRegError('O usuário deve ter pelo menos 3 caracteres.');
                    return;
                }
                
                if (password.length < 4) {
                    showRegError('A senha deve ter pelo menos 4 caracteres.');
                    return;
                }
                
                // Desabilitar botão durante criação
                createBtn.disabled = true;
                createBtn.textContent = 'CRIANDO...';
                
                // Simular criação
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Criar novo usuário
                users[username] = {
                    username: username,
                    password: password,
                    role: 'user',
                    permissions: ['basic']
                };
                
                // Salvar no localStorage para persistência
                localStorage.setItem('hexa_users', JSON.stringify(users));
                
                showRegError('Usuário criado com sucesso! Redirecionando...', 'success');
                
                setTimeout(() => {
                    hideContentAndShowLogin();
                }, 1500);
            }
            
            function showRegError(message, type = 'error') {
                if (errorDiv) {
                    errorDiv.textContent = message;
                    errorDiv.style.display = 'block';
                    errorDiv.style.color = type === 'success' ? '#00ff88' : '#ff6b6b';
                    
                    if (type !== 'success') {
                        setTimeout(() => {
                            errorDiv.style.display = 'none';
                        }, 3000);
                    }
                }
            }
        }
        
        function showError(message) {
            if (errorDiv) {
                errorDiv.textContent = message;
                errorDiv.style.display = 'block';
                
                setTimeout(() => {
                    errorDiv.style.display = 'none';
                }, 3000);
            }
        }
    }
    
    // Carregar usuários do localStorage
    function loadUsers() {
        const savedUsers = localStorage.getItem('hexa_users');
        if (savedUsers) {
            Object.assign(users, JSON.parse(savedUsers));
        }
    }
    
    // Carregar usuários salvos
    loadUsers();
    
    // Disponibilizar funções globalmente
    window.hexaUsers = users;
    window.hexaIsAdmin = () => currentUser.role === 'admin';
    window.hexaGetCurrentUser = () => currentUser;
})();
