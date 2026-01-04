# H.E.X.A - Sistema de Sincronização via GitHub API

## 🚀 Novidades: Sistema Multiplayer Integrado ao GitHub!

O H.E.X.A agora possui sincronização **via GitHub API**, usando a infraestrutura que você já tem! Todas as ações de combate são compartilhadas através das Issues do repositório, sem necessidade de servidor adicional.

## 📋 O que é sincronizado:

✅ **Ordem de iniciativa** - Quando um jogador adiciona ou reordena personagens  
✅ **Turnos e rodadas** - Avanço automático sincronizado  
✅ **Timer de combate** - Contagem regressiva compartilhada  
✅ **Log de combate** - Todas as ações registradas para todos  
✅ **Status do combate** - Início/fim sincronizados  

❌ **Personagens individuais** - Cada jogador mantém suas fichas privadas  

## 🛠️ Como usar o sistema sincronizado:

### 1. Acessar o painel
Abra `index.html` em múltiplos navegadores/computadores (pode ser via GitHub Pages ou servidor local)

### 2. Usar os controles sincronizados

#### 🎮 Controles de Combate:
- **INICIAR COMBATE** - Começa uma sessão sincronizada
- **FINALIZAR COMBATE** - Encerra a sessão para todos
- **PRÓXIMO TURNO** - Avança o turno sincronizado
- **ROLAR INICIATIVA** - Rola dados para todos os personagens

#### 👥 Gestão de Personagens:
- **ADICIONAR** - Adiciona personagens à ordem de iniciativa
- **Reordenar** - Arraste e solte para reordenar a iniciativa
- **Remover** - Clique em "Remover" para tirar da lista

#### 📊 Status de Sincronização:
- **Conectado GitHub** (verde) - Sincronizando via Issues
- **Desconectado** (vermelho) - Modo offline, usando localStorage

## 🔧 Funcionalidades Técnicas:

### GitHub API Integration
- Usa Issues do repositório para armazenar estado do combate
- Polling automático a cada 3 segundos para verificar atualizações
- Labels organizadas: `hexa-combat-sync` para combate, `hexa-social-message` para social

### Sistema de Combate
- Estado compartilhado através das Issues do GitHub
- Log unificado de todas as ações
- Cleanup automático para manter repositório organizado

### Cliente de Sincronização
- Cliente GitHub API integrado ao sistema de combate
- Fallback para localStorage em modo offline
- Indicadores visuais de status de conexão

## 📁 Estrutura dos Arquivos:

```
├── js/
│   ├── hexa-github-api.js    # API GitHub existente + métodos de combate
│   ├── hexa-github-sync.js   # Cliente de sincronização GitHub
│   ├── hexa-combat.js        # Sistema de combate sincronizado
│   └── hexa-init.js         # Sistema de login (mantido)
├── index.html                # Painel de combate atualizado
└── hexa-social.html          # Sistema social (mantido)
```

## 🎯 Como funciona:

1. **Conexão**: Cada cliente se conecta à GitHub API
2. **Sincronização**: Ações são salvas como Issues com label `hexa-combat-sync`
3. **Polling**: Clientes verificam atualizações a cada 3 segundos
4. **Estado**: A Issue mais recente contém o estado oficial do combate
5. **Fallback**: Se offline, usa localStorage local

## 🌐 Modo de Uso:

### Multiplayer via GitHub (Recomendado)
- Todos os jogadores acessam o mesmo `index.html`
- Qualquer ação de combate é sincronizada via Issues
- Ideal para sessões de RPG online sem servidor dedicado

### Single Player / Offline
- Acesse `index.html` sem conexão à internet
- Usa localStorage para persistência local
- Funciona como antes, sem sincronização

## 📊 Labels no GitHub:

### `hexa-combat-sync`
- **Estado do combate**: Issues com `type: combat_state`
- **Log de combate**: Issues com `type: combat_log`
- Mantém apenas as 10 issues de estado mais recentes
- Mantém apenas as 50 issues de log mais recentes

### `hexa-social-message`
- Mensagens do sistema social (já existente)
- Não interfere com o sistema de combate

## 🔧 Solução de Problemas:

### Sincronização lenta:
- O polling é de 3 segundos (configurável)
- A GitHub API tem rate limits, mas é suficiente para RPG
- Em caso de muitos jogadores, pode aumentar o intervalo

### Issues não aparecem:
- Verifique se o repositório está correto: `M0cchizim/HEXA_Site`
- Confirme se não há firewall bloqueando a GitHub API
- Tente recarregar a página

### Personagens não sincronizam:
- Personagens individuais NÃO são sincronizados (é intencional)
- Apenas ordem de iniciativa, turnos e log são compartilhados
- Cada jogador mantém suas fichas privadas

## 🚀 Vantagens do Sistema GitHub:

✅ **Sem servidor necessário** - Usa infraestrutura existente  
✅ **Persistência automática** - Dados salvos no repositório  
✅ **Histórico completo** - Todas as ações registradas  
✅ **Acesso universal** - Qualquer pessoa com acesso ao repo pode jogar  
✅ **Backup automático** - GitHub mantém versão dos dados  

## 🔧 Configuração Avançada:

### Mudar polling delay:
```javascript
// No console do navegador
window.hexaGitHubSync.setPollingDelay(1000); // 1 segundo
```

### Verificar estado manualmente:
```javascript
// Forçar atualização
window.hexaGitHubSync.requestState();
```

---

**H.E.X.A v2.099 - Sistema Multiplayer via GitHub**  
*Integrado com sua infraestrutura existente*
