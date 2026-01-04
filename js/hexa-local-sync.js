// Sistema de Sincronização Local (Fallback)
class HexaLocalSync {
    constructor() {
        this.storageKey = 'hexa_combat_state';
        this.logKey = 'hexa_combat_log';
        this.onStateUpdate = null;
        this.onLogUpdate = null;
        
        this.init();
    }

    init() {
        // Escutar mudanças no localStorage (sincronização entre abas)
        window.addEventListener('storage', (e) => {
            if (e.key === this.storageKey) {
                this.handleStateUpdate(e.newValue);
            } else if (e.key === this.logKey) {
                this.handleLogUpdate(e.newValue);
            }
        });

        console.log('🔄 Sistema de sincronização local inicializado');
    }

    handleStateUpdate(newValue) {
        if (newValue && this.onStateUpdate) {
            try {
                const state = JSON.parse(newValue);
                console.log('📥 Estado atualizado via localStorage:', state);
                this.onStateUpdate(state);
            } catch (error) {
                console.error('❌ Erro ao processar estado do localStorage:', error);
            }
        }
    }

    handleLogUpdate(newValue) {
        if (newValue && this.onLogUpdate) {
            try {
                const log = JSON.parse(newValue);
                console.log('📥 Log atualizado via localStorage:', log);
                this.onLogUpdate(log);
            } catch (error) {
                console.error('❌ Erro ao processar log do localStorage:', error);
            }
        }
    }

    // Salvar estado no localStorage
    saveState(state) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(state));
            console.log('💾 Estado salvo no localStorage');
        } catch (error) {
            console.error('❌ Erro ao salvar estado no localStorage:', error);
        }
    }

    // Carregar estado do localStorage
    loadState() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('❌ Erro ao carregar estado do localStorage:', error);
            return null;
        }
    }

    // Salvar log no localStorage
    saveLog(logEntries) {
        try {
            localStorage.setItem(this.logKey, JSON.stringify(logEntries));
            console.log('💾 Log salvo no localStorage');
        } catch (error) {
            console.error('❌ Erro ao salvar log no localStorage:', error);
        }
    }

    // Carregar log do localStorage
    loadLog() {
        try {
            const data = localStorage.getItem(this.logKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('❌ Erro ao carregar log do localStorage:', error);
            return [];
        }
    }

    // Adicionar entrada ao log
    addLogEntry(logType, message) {
        try {
            const currentLog = this.loadLog();
            const newEntry = {
                type: logType,
                message: message,
                timestamp: new Date().toISOString(),
                id: Date.now()
            };

            currentLog.unshift(newEntry);
            
            // Manter apenas as últimas 50 entradas
            if (currentLog.length > 50) {
                currentLog.splice(50);
            }

            this.saveLog(currentLog);
            console.log('📝 Entrada de log adicionada via localStorage');
        } catch (error) {
            console.error('❌ Erro ao adicionar entrada de log:', error);
        }
    }
}

// Instância global
let hexaLocalSync = null;

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    hexaLocalSync = new HexaLocalSync();
    window.hexaLocalSync = hexaLocalSync;
});
