# Como Configurar Token GitHub para Sincronização H.E.X.A

## 🎯 Objetivo
Configurar um token de acesso pessoal do GitHub para melhorar a sincronização em tempo real e evitar limites de taxa.

## 📋 Pré-requisitos
- Conta no GitHub
- Acesso ao repositório `M0cchizeen/H.E.X.A_Site`

## 🔧 Passos para Criar o Token

### 1. Acessar Configurações de Tokens
1. Faça login no GitHub
2. Vá para: **github.com/settings/tokens**
3. Clique em **"Generate new token"** → **"Generate new token (classic)"**

### 2. Configurar o Token
1. **Note**: Dê um nome descritivo (ex: "H.E.X.A Sistema")
2. **Expiration**: Escolha um período (recomendo 90 dias)
3. **Scopes**: Marque apenas as permissões necessárias:
   - ✅ **repo** (Acesso completo a repositórios)
   - ✅ **read:org** (Se o repositório for de uma organização)

### 3. Gerar e Copiar
1. Clique em **"Generate token"**
2. **IMPORTANTE**: Copie o token imediatamente (ele não será mostrado novamente!)
3. O token começa com `ghp_`

## 🔐 Como Usar no H.E.X.A

### Método 1: Tela de Login
1. Ao fazer login no sistema H.E.X.A
2. No campo "Token GitHub (Opcional)", cole seu token
3. O sistema salvará automaticamente

### Método 2: Console do Navegador
```javascript
// Abra o console (F12) e execute:
HexaConfig.saveGitHubToken('seu_token_aqui');
```

## 📊 Benefícios do Token

| Sem Token | Com Token |
|-----------|-----------|
| 60 requisições/hora | 5000 requisições/hora |
| Rate limit rápido | Sincronização estável |
| Apenas leitura pública | Leitura e escrita |
| Limitações de uso | Experiência completa |

## 🛡️ Segurança

### ✅ Boas Práticas
- Mantenha seu token em segredo
- Não compartilhe o token
- Use escopo mínimo necessário (`repo` apenas)
- Revogue tokens não utilizados

### ❌ O Que Evitar
- Não commitar o token em repositórios
- Não compartilhar em chats públicos
- Não usar em computadores públicos

## 🔍 Verificar Configuração

### Verificar Status do Token
1. Abra o painel de debug (botão 🔍 DEBUG)
2. Verifique o status da API
3. Se mostrar "✅ OK", o token está funcionando

### Testar Conexão
```javascript
// No console do navegador:
runHexaTests();
```

## 🔄 Renovação do Token

### Quando Renovar?
- Token expirou
- Suspeita de comprometimento
- Mudança de permissões

### Processo de Renovação
1. Revoke o token antigo em github.com/settings/tokens
2. Crie um novo token
3. Atualize no sistema H.E.X.A

## 🚀 Dicas Avançadas

### Token de Serviço (Opcional)
Para uso em servidores ou automação:
- Use GitHub Apps em vez de Personal Access Tokens
- Configure IP whitelist se possível
- Use variáveis de ambiente

### Monitoramento
Monitore o uso do token:
```javascript
// Ver rate limit atual
fetch('https://api.github.com/rate_limit')
  .then(r => r.json())
  .then(d => console.log(`Remaining: ${d.resources.core.remaining}/${d.resources.core.limit}`));
```

## 🆘 Solução de Problemas

### "Token inválido ou expirado"
- Verifique se o token foi digitado corretamente
- Crie um novo token se o antigo expirou

### "Rate limit excedido"
- Aguarde o reset (mostrado no erro)
- Configure um token para aumentar o limite

### "Acesso negado"
- Verifique se o token tem permissão `repo`
- Confirme se tem acesso ao repositório

---

**📝 Nota**: O token é salvo localmente no navegador e usado apenas para comunicação com a API GitHub.
