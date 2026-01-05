// Monitor de Rate Limit GitHub API
class HexaRateMonitor {
    constructor() {
        this.requestCount = 0;
        this.startTime = Date.now();
        this.hourlyLimit = 60; // Sem token
        this.withTokenLimit = 5000; // Com token
        this.resetTime = null;
        this.lastCheck = 0;
    }

    // Registrar requisição
    logRequest() {
        this.requestCount++;
        console.log(`📊 Requisição #${this.requestCount} registrada`);
    }

    // Verificar rate limit atual
    async checkRateLimit() {
        try {
            const response = await fetch('https://api.github.com/rate_limit');
            const data = await response.json();
            
            this.hourlyLimit = data.resources.core.limit;
            const remaining = data.resources.core.remaining;
            this.resetTime = new Date(data.resources.core.reset * 1000);
            
            console.log(`📊 Rate Limit Status:`);
            console.log(`  - Limite: ${this.hourlyLimit}/hora`);
            console.log(`  - Restantes: ${remaining}`);
            console.log(`  - Reset: ${this.resetTime.toLocaleString()}`);
            console.log(`  - Usadas: ${this.hourlyLimit - remaining}`);
            
            return {
                limit: this.hourlyLimit,
                remaining: remaining,
                resetTime: this.resetTime,
                used: this.hourlyLimit - remaining
            };
        } catch (error) {
            console.warn('⚠️ Erro ao verificar rate limit:', error.message);
            return null;
        }
    }

    // Calcular consumo estimado
    calculateConsumption() {
        const elapsedMinutes = (Date.now() - this.startTime) / 60000;
        const requestsPerMinute = this.requestCount / elapsedMinutes;
        const projectedHourly = requestsPerMinute * 60;
        
        console.log(`📈 Análise de Consumo:`);
        console.log(`  - Requisições/min: ${requestsPerMinute.toFixed(1)}`);
        console.log(`  - Projeção/hora: ${projectedHourly.toFixed(0)}`);
        console.log(`  - Tempo até esgotar: ${this.getTimeToExhaust(projectedHourly)}`);
        
        return {
            requestsPerMinute,
            projectedHourly,
            timeToExhaust: this.getTimeToExhaust(projectedHourly)
        };
    }

    // Calcular tempo até esgotar
    getTimeToExhaust(projectedHourly) {
        const limit = this.hourlyLimit;
        if (projectedHourly >= limit) {
            return '⚠️ Menos de 1 hora!';
        }
        
        const hoursToExhaust = limit / projectedHourly;
        if (hoursToExhaust < 1) {
            const minutes = (hoursToExhaust * 60).toFixed(0);
            return `⚠️ ${minutes} minutos`;
        } else if (hoursToExhaust < 24) {
            return `${hoursToExhaust.toFixed(1)} horas`;
        } else {
            const days = (hoursToExhaust / 24).toFixed(1);
            return `${days} dias`;
        }
    }

    // Reset contador
    reset() {
        this.requestCount = 0;
        this.startTime = Date.now();
        console.log('🔄 Contador de requisições resetado');
    }

    // Simular consumo com diferentes configurações
    simulateConfigurations() {
        console.log('\n🎮 Simulação de Configurações (CONSIDERANDO TODAS AS PÁGINAS):');
        
        // Configuração atual (extremamente otimizada)
        const currentConfig = {
            syncInterval: 20, // segundos
            heartbeatInterval: 45, // segundos
            requestsPerSync: 4, // combate, social, users, timer
            socialMessages: 15, // mensagens por hora
            socialTyping: 30, // status digitando por hora
            requestsPerHour: (3600 / 20) * 4 + (3600 / 45) + 15 + 30, // 720 + 80 + 45 = 845
            usersMultiple: 845 * 2 // Considerando 2 páginas abertas
        };
        
        console.log('\n📊 Configuração ATUAL (Extremamente Otimizada):');
        console.log(`  - Sync: ${currentConfig.syncInterval}s`);
        console.log(`  - Heartbeat: ${currentConfig.heartbeatInterval}s`);
        console.log(`  - Social (mensagens): ${currentConfig.socialMessages}/hora`);
        console.log(`  - Social (typing): ${currentConfig.socialTyping}/hora`);
        console.log(`  - Requisições/hora (1 página): ${currentConfig.requestsPerHour}`);
        console.log(`  - Requisições/hora (2 páginas): ${currentConfig.usersMultiple}`);
        console.log(`  - Tempo até esgotar (60/h): ${this.getTimeToExhaust(currentConfig.usersMultiple)}`);
        console.log(`  - Tempo até esgotar (5000/h): ${this.getTimeToExhaust(5000 - currentConfig.usersMultiple)}`);
        
        // Configuração ultra conservadora
        const ultraConfig = {
            syncInterval: 30, // segundos
            heartbeatInterval: 60, // segundos
            requestsPerSync: 4,
            socialMessages: 10,
            socialTyping: 20,
            requestsPerHour: (3600 / 30) * 4 + (3600 / 60) + 10 + 20, // 480 + 60 + 30 = 570
            usersMultiple: 570 * 2
        };
        
        console.log('\n📊 Configuração ULTRA Conservadora:');
        console.log(`  - Sync: ${ultraConfig.syncInterval}s`);
        console.log(`  - Heartbeat: ${ultraConfig.heartbeatInterval}s`);
        console.log(`  - Social (mensagens): ${ultraConfig.socialMessages}/hora`);
        console.log(`  - Social (typing): ${ultraConfig.socialTyping}/hora`);
        console.log(`  - Requisições/hora (1 página): ${ultraConfig.requestsPerHour}`);
        console.log(`  - Requisições/hora (2 páginas): ${ultraConfig.usersMultiple}`);
        console.log(`  - Tempo até esgotar (60/h): ${this.getTimeToExhaust(ultraConfig.usersMultiple)}`);
        console.log(`  - Tempo até esgotar (5000/h): ${this.getTimeToExhaust(5000 - ultraConfig.usersMultiple)}`);
        
        // Configuração original (para comparação)
        const originalConfig = {
            syncInterval: 5, // segundos
            heartbeatInterval: 10, // segundos
            requestsPerSync: 6,
            socialMessages: 30,
            socialTyping: 60,
            requestsPerHour: (3600 / 5) * 6 + (3600 / 10) + 30 + 60, // 4320 + 360 + 90 = 4770
            usersMultiple: 4770 * 2
        };
        
        console.log('\n📊 Configuração ORIGINAL (Problema Grave):');
        console.log(`  - Sync: ${originalConfig.syncInterval}s`);
        console.log(`  - Heartbeat: ${originalConfig.heartbeatInterval}s`);
        console.log(`  - Social (mensagens): ${originalConfig.socialMessages}/hora`);
        console.log(`  - Social (typing): ${originalConfig.socialTyping}/hora`);
        console.log(`  - Requisições/hora (1 página): ${originalConfig.requestsPerHour}`);
        console.log(`  - Requisições/hora (2 páginas): ${originalConfig.usersMultiple}`);
        console.log(`  - Tempo até esgotar (60/h): ${this.getTimeToExhaust(originalConfig.usersMultiple)}`);
        console.log(`  - Tempo até esgotar (5000/h): ${this.getTimeToExhaust(5000 - originalConfig.usersMultiple)}`);
        
        // Alerta sobre múltiplos usuários
        console.log('\n⚠️ ATENÇÃO - Múltiplos Usuários:');
        console.log('  - Com 3 usuários: multiplique por 3');
        console.log('  - Com 5 usuários: multiplique por 5');
        console.log('  - Recomendação: Token GitHub OBRIGATÓRIO para múltiplos usuários');
        
        return { currentConfig, ultraConfig, originalConfig };
    }
}

// Criar instância global
const hexaRateMonitor = new HexaRateMonitor();

// Interceptar fetch para contar requisições GitHub
const originalFetch = window.fetch;
window.fetch = function(...args) {
    const url = args[0];
    
    if (typeof url === 'string' && url.includes('api.github.com')) {
        hexaRateMonitor.logRequest();
    }
    
    return originalFetch.apply(this, args);
};

// Funções globais para monitoramento
window.checkRateLimit = () => hexaRateMonitor.checkRateLimit();
window.analyzeConsumption = () => hexaRateMonitor.calculateConsumption();
window.simulateConfigs = () => hexaRateMonitor.simulateConfigurations();
window.resetRateCounter = () => hexaRateMonitor.reset();

// Verificar automaticamente a cada 30 segundos
setInterval(() => {
    if (hexaRateMonitor.requestCount > 0) {
        hexaRateMonitor.calculateConsumption();
    }
}, 30000);

console.log('📊 Monitor de Rate Limit H.E.X.A carregado');
console.log('💡 Use checkRateLimit(), analyzeConsumption() ou simulateConfigs()');
