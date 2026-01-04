// Cliente WebSocket para sincronização em tempo real do H.E.X.A
class HexaCombatSync {
    constructor() {
        this.ws = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.isConnected = false;
        this.onStateUpdate = null;
        this.onTimerUpdate = null;
        this.onConnect = null;
        this.onDisconnect = null;
        
        this.connect();
    }

    connect() {
        try {
            // Determinar o servidor WebSocket baseado na URL atual
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${window.location.host}`;
            
            console.log('🔌 Conectando ao servidor WebSocket:', wsUrl);
            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                console.log('✅ Conectado ao servidor de sincronização');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                
                if (this.onConnect) {
                    this.onConnect();
                }
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('❌ Erro ao processar mensagem:', error);
                }
            };

            this.ws.onclose = () => {
                console.log('🔌 Desconectado do servidor');
                this.isConnected = false;
                
                if (this.onDisconnect) {
                    this.onDisconnect();
                }
                
                // Tentar reconectar
                this.attemptReconnect();
            };

            this.ws.onerror = (error) => {
                console.error('❌ Erro WebSocket:', error);
                this.isConnected = false;
            };

        } catch (error) {
            console.error('❌ Erro ao conectar WebSocket:', error);
            // Fallback para modo offline
            this.enableOfflineMode();
        }
    }

    handleMessage(data) {
        switch (data.type) {
            case 'combat_state':
                if (this.onStateUpdate) {
                    this.onStateUpdate(data.data);
                }
                break;
            case 'timer_update':
                if (this.onTimerUpdate) {
                    this.onTimerUpdate(data.data);
                }
                break;
            default:
                console.log('📨 Mensagem recebida:', data);
        }
    }

    send(type, data = null) {
        if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
            const message = {
                type: type,
                data: data,
                timestamp: Date.now()
            };
            this.ws.send(JSON.stringify(message));
            console.log('📤 Mensagem enviada:', message);
        } else {
            console.warn('⚠️ Não conectado - mensagem não enviada:', type);
        }
    }

    updateInitiative(initiative) {
        this.send('update_initiative', initiative);
    }

    nextTurn() {
        this.send('next_turn');
    }

    startCombat() {
        this.send('start_combat');
    }

    endCombat() {
        this.send('end_combat');
    }

    updateTimer(duration, timeRemaining) {
        this.send('update_timer', {
            duration: duration,
            timeRemaining: timeRemaining
        });
    }

    addLogEntry(logType, message) {
        this.send('add_log_entry', {
            logType: logType,
            message: message
        });
    }

    requestState() {
        this.send('request_state');
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`🔄 Tentando reconectar (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            
            setTimeout(() => {
                this.connect();
            }, this.reconnectDelay * this.reconnectAttempts);
        } else {
            console.error('❌ Máximo de tentativas de reconexão atingido');
            this.enableOfflineMode();
        }
    }

    enableOfflineMode() {
        console.log('📴 Modo offline ativado - usando localStorage');
        // Implementar fallback para localStorage aqui
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
        }
    }
}

// Instância global do cliente de sincronização
let hexaSync = null;

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    hexaSync = new HexaCombatSync();
    
    // Disponibilizar globalmente
    window.hexaSync = hexaSync;
    
    console.log('🚀 Sistema de sincronização H.E.X.A inicializado');
});
