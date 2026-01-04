// Sistema de Identificação de Usuário H.E.X.A
class HexaUser {
    constructor() {
        this.currentUser = null;
        this.userId = null;
        this.username = null;
        this.userColor = null;
        this.isIdentified = false;
    }

    init() {
        // Verificar se usuário já existe
        this.loadUserData();
        
        if (!this.isIdentified) {
            this.showUserIdentification();
        } else {
            console.log('👤 Usuário já identificado:', this.username);
            this.startHeartbeat();
        }
    }

    loadUserData() {
        const userData = localStorage.getItem('hexaUserData');
        if (userData) {
            try {
                const data = JSON.parse(userData);
                this.userId = data.userId;
                this.username = data.username;
                this.userColor = data.userColor;
                this.isIdentified = true;
                return true;
            } catch (e) {
                localStorage.removeItem('hexaUserData');
            }
        }
        return false;
    }

    showUserIdentification() {
        // Criar overlay de identificação
        const userScreen = document.createElement('div');
        userScreen.id = 'hexaUserScreen';
        userScreen.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 999998;
            font-family: 'Orbitron', monospace;
        `;

        userScreen.innerHTML = `
            <div style="
                background: linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(26, 26, 46, 0.9) 100%);
                border: 2px solid #667eea;
                border-radius: 15px;
                padding: 40px;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 0 30px rgba(102, 126, 234, 0.5);
                text-align: center;
            ">
                <h2 style="
                    color: #667eea;
                    margin-bottom: 20px;
                    font-size: 1.8rem;
                    text-shadow: 0 0 20px rgba(102, 126, 234, 0.8);
                ">👤 Identificação do Jogador</h2>
                
                <p style="
                    color: #ffffff;
                    margin-bottom: 30px;
                    font-size: 0.9rem;
                    opacity: 0.8;
                ">Como você será identificado no combate?</p>
                
                <div style="margin-bottom: 20px;">
                    <label style="
                        display: block;
                        color: #667eea;
                        margin-bottom: 10px;
                        font-size: 0.8rem;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                    ">Seu Nome no Jogo</label>
                    <input 
                        type="text" 
                        id="hexaUsernameInput"
                        placeholder="Digite seu nome..."
                        maxlength="20"
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
                            text-align: center;
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
                        font-size: 0.8rem;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                    ">Cor de Identificação</label>
                    <div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
                        ${this.generateColorOptions()}
                    </div>
                </div>
                
                <button 
                    id="hexaUserBtn"
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
                    onclick="hexaUser.identifyUser()"
                >Entrar no Combate</button>
                
                <div style="
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 0.7rem;
                    margin-top: 20px;
                ">
                    <p>Seu nome será visível para outros jogadores</p>
                </div>
            </div>
        `;

        // Adicionar ao body
        document.body.appendChild(userScreen);
        
        // Focar no input
        setTimeout(() => {
            const input = document.getElementById('hexaUsernameInput');
            if (input) {
                input.focus();
                
                // Adicionar evento Enter
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.identifyUser();
                    }
                });
            }
        }, 100);
    }

    generateColorOptions() {
        const colors = [
            { name: 'Azul', value: '#007bff' },
            { name: 'Verde', value: '#28a745' },
            { name: 'Vermelho', value: '#dc3545' },
            { name: 'Amarelo', value: '#ffc107' },
            { name: 'Roxo', value: '#6f42c1' },
            { name: 'Laranja', value: '#fd7e14' },
            { name: 'Ciano', value: '#17a2b8' },
            { name: 'Rosa', value: '#e83e8c' }
        ];

        return colors.map((color, index) => `
            <div style="
                width: 40px;
                height: 40px;
                background: ${color.value};
                border-radius: 50%;
                cursor: pointer;
                border: 3px solid transparent;
                transition: all 0.3s;
                display: inline-block;
                margin: 5px;
            "
            id="colorOption${index}"
            onclick="hexaUser.selectColor('${color.value}', ${index})"
            onmouseover="this.style.transform='scale(1.1)'; this.style.borderColor='#ffffff'"
            onmouseout="this.style.transform='scale(1)'; this.style.borderColor='transparent'"
            title="${color.name}">
            </div>
        `).join('');
    }

    selectColor(color, index) {
        // Remover seleção anterior
        document.querySelectorAll('[id^="colorOption"]').forEach(el => {
            el.style.borderColor = 'transparent';
        });
        
        // Selecionar nova cor
        const selectedColor = document.getElementById(`colorOption${index}`);
        if (selectedColor) {
            selectedColor.style.borderColor = '#ffffff';
            selectedColor.style.boxShadow = `0 0 10px ${color}`;
        }
        
        this.userColor = color;
    }

    identifyUser() {
        const input = document.getElementById('hexaUsernameInput');
        const username = input ? input.value.trim() : '';
        
        if (username.length < 2) {
            this.showError();
            return;
        }

        // Gerar ID único
        this.userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        this.username = username;
        
        // Selecionar cor aleatória se não escolhida
        if (!this.userColor) {
            const colors = ['#007bff', '#28a745', '#dc3545', '#ffc107', '#6f42c1', '#fd7e14', '#17a2b8', '#e83e8c'];
            this.userColor = colors[Math.floor(Math.random() * colors.length)];
        }

        // Salvar dados
        this.saveUserData();
        this.isIdentified = true;
        this.currentUser = {
            id: this.userId,
            username: this.username,
            color: this.userColor,
            joinedAt: Date.now()
        };

        // Remover tela
        const userScreen = document.getElementById('hexaUserScreen');
        if (userScreen) {
            userScreen.style.opacity = '0';
            userScreen.style.transition = 'opacity 0.5s';
            setTimeout(() => {
                if (userScreen && userScreen.parentNode) {
                    userScreen.parentNode.removeChild(userScreen);
                }
            }, 500);
        }

        console.log('👤 Usuário identificado:', this.username);
        
        // Iniciar heartbeat
        this.startHeartbeat();
        
        // Disponibilizar globalmente
        window.hexaCurrentUser = this.currentUser;
        
        // Iniciar sincronização se existir
        if (typeof hexaSync !== 'undefined' && hexaSync) {
            hexaSync.init();
        }
    }

    saveUserData() {
        const userData = {
            userId: this.userId,
            username: this.username,
            userColor: this.userColor
        };
        localStorage.setItem('hexaUserData', JSON.stringify(userData));
    }

    showError() {
        const input = document.getElementById('hexaUsernameInput');
        const btn = document.getElementById('hexaUserBtn');
        
        if (input) {
            input.style.borderColor = '#ff0000';
            input.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.5)';
            input.value = '';
            input.placeholder = '❌ Nome muito curto!';
            
            setTimeout(() => {
                input.style.borderColor = '#667eea';
                input.style.boxShadow = 'none';
                input.placeholder = 'Digite seu nome...';
                input.focus();
            }, 2000);
        }
        
        if (btn) {
            btn.textContent = '❌ Nome Inválido';
            btn.style.background = 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)';
            
            setTimeout(() => {
                btn.textContent = 'Entrar no Combate';
                btn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            }, 2000);
        }
    }

    startHeartbeat() {
        // Enviar heartbeat inicial
        this.sendHeartbeat();
        
        // Enviar heartbeat a cada 30 segundos
        setInterval(() => {
            this.sendHeartbeat();
        }, 30000);
    }

    async sendHeartbeat() {
        try {
            if (typeof hexaSync !== 'undefined' && hexaSync) {
                const heartbeatData = {
                    userId: this.userId,
                    username: this.username,
                    color: this.userColor,
                    timestamp: Date.now(),
                    page: window.location.pathname,
                    isActive: true
                };

                await hexaSync.createOrUpdateIssue(
                    `HEXA_USER_${this.userId}`,
                    `User: ${this.username}`,
                    JSON.stringify(heartbeatData),
                    ['HEXA_USER', 'HEXA_HEARTBEAT']
                );
                
                console.log('💓 Heartbeat enviado:', this.username);
            }
        } catch (error) {
            console.warn('⚠️ Erro no heartbeat:', error.message);
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getUsername() {
        return this.username;
    }

    getUserId() {
        return this.userId;
    }

    getUserColor() {
        return this.userColor;
    }

    logout() {
        localStorage.removeItem('hexaUserData');
        this.isIdentified = false;
        this.currentUser = null;
        location.reload();
    }
}

// Criar instância global
const hexaUser = new HexaUser();

// Disponibilizar globalmente
window.hexaUser = hexaUser;

// Auto-inicializar quando carregar
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar sistema de usuário imediatamente
    hexaUser.init();
    
    // Disponibilizar globalmente
    window.hexaUser = hexaUser;
    
    console.log('👤 Sistema de identificação H.E.X.A carregado');
});
