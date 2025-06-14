# Deploy no Netlify - Visual CSS Editor

Este guia explica como fazer deploy da aplicação no Netlify para resolver problemas de OAuth com localhost.

## Por que Netlify?

- ✅ HTTPS automático (necessário para OAuth em produção)
- ✅ URL estável para configurar no GitHub OAuth
- ✅ Deploy automático via Git
- ✅ Variáveis de ambiente seguras
- ✅ Gratuito para projetos pessoais

## Passo 1: Preparar o Projeto

### 1.1 Criar arquivo de build para produção

Crie `netlify.toml` na raiz do projeto:

```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[functions]
  directory = "netlify/functions"
```

### 1.2 Converter servidor para Netlify Functions

Crie `netlify/functions/auth.js`:

```javascript
exports.handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { code } = JSON.parse(event.body);
    
    if (!code) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Código de autorização é obrigatório' })
      };
    }

    // Trocar código por token de acesso
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.VITE_GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: tokenData.error_description })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ access_token: tokenData.access_token })
    };
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro interno do servidor' })
    };
  }
};
```

## Passo 2: Deploy no Netlify

### 2.1 Via GitHub (Recomendado)

1. **Commit e push do código**:
   ```bash
   git add .
   git commit -m "Preparar para deploy Netlify"
   git push origin main
   ```

2. **Conectar ao Netlify**:
   - Acesse [netlify.com](https://netlify.com)
   - Faça login com GitHub
   - Clique "New site from Git"
   - Selecione seu repositório
   - Configure:
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`

3. **Configurar variáveis de ambiente**:
   - No dashboard do Netlify, vá em "Site settings" > "Environment variables"
   - Adicione:
     ```
     VITE_GITHUB_CLIENT_ID=seu_client_id
     GITHUB_CLIENT_SECRET=seu_client_secret
     ```

## Passo 3: Configurar GitHub OAuth

1. **Obter URL do Netlify**:
   - Após deploy, você receberá uma URL como: `https://seu-app.netlify.app`

2. **Atualizar GitHub OAuth App**:
   - Vá para [GitHub Developer Settings](https://github.com/settings/developers)
   - Edite sua OAuth App
   - Atualize:
     - **Homepage URL**: `https://seu-app.netlify.app`
     - **Authorization callback URL**: `https://seu-app.netlify.app`

## Vantagens do Deploy

- ✅ **HTTPS**: Segurança completa
- ✅ **URL Estável**: Sem problemas de localhost
- ✅ **OAuth Funcional**: GitHub aceita URLs HTTPS
- ✅ **Performance**: CDN global
- ✅ **Gratuito**: Para projetos pessoais
- ✅ **Deploy Automático**: A cada push no Git

Com o deploy no Netlify, sua aplicação terá uma URL HTTPS estável que resolverá todos os problemas de OAuth com GitHub!