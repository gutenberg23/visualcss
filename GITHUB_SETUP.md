# Configuração da Integração GitHub

Este guia explica como configurar a integração completa com GitHub para o Visual CSS Editor.

## Pré-requisitos

1. Conta no GitHub
2. Node.js instalado
3. Projeto clonado localmente

## Passo 1: Criar OAuth App no GitHub

1. Acesse [GitHub Developer Settings](https://github.com/settings/developers)
2. Clique em "New OAuth App"
3. Preencha os campos:
   - **Application name**: Visual CSS Editor
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000`
   - **Application description**: Editor visual de CSS com integração GitHub

4. Clique em "Register application"
5. Anote o **Client ID** e **Client Secret**

## Passo 2: Configurar Variáveis de Ambiente

1. Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edite o arquivo `.env` e adicione suas credenciais:
   ```env
   # Frontend (Client ID é público)
   VITE_GITHUB_CLIENT_ID=seu_client_id_aqui
   
   # Backend (Client Secret deve ser mantido em segredo)
   GITHUB_CLIENT_SECRET=seu_client_secret_aqui
   
   # Server Configuration
   PORT=3001
   ```

## Passo 3: Instalar Dependências

Se ainda não instalou, execute:
```bash
npm install
```

## Passo 4: Executar a Aplicação

### Opção 1: Executar Frontend e Backend Separadamente

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### Opção 2: Executar Ambos Simultaneamente

```bash
npm run dev:full
```

## Passo 5: Testar a Integração

1. Acesse `http://localhost:3000`
2. Clique na aba "GitHub"
3. Clique em "Entrar com GitHub"
4. Autorize a aplicação no GitHub
5. Você será redirecionado de volta e autenticado

## Funcionalidades Disponíveis

### ✅ Implementadas

- **Autenticação OAuth**: Login seguro com GitHub
- **Listagem de Repositórios**: Visualizar todos os seus repositórios
- **Navegação de Arquivos**: Explorar arquivos CSS nos repositórios
- **Visualização de Conteúdo**: Ver conteúdo dos arquivos CSS
- **Edição de Arquivos**: Modificar arquivos CSS existentes
- **Criação de Arquivos**: Criar novos arquivos CSS
- **Commit Automático**: Salvar alterações com mensagens de commit

### 🔧 Fluxo de Trabalho

1. **Login**: Autentique-se com sua conta GitHub
2. **Selecionar Repositório**: Escolha o repositório que deseja editar
3. **Navegar Arquivos**: Explore os arquivos CSS disponíveis
4. **Editar**: Use o editor visual para modificar estilos
5. **Salvar**: Commit suas alterações diretamente no GitHub

## Segurança

- ✅ Client Secret mantido no servidor backend
- ✅ Tokens de acesso não expostos no frontend
- ✅ Validação de estado OAuth
- ✅ CORS configurado adequadamente

## Troubleshooting

### Erro: "VITE_GITHUB_CLIENT_ID não configurado"
- Verifique se o arquivo `.env` existe e contém o `VITE_GITHUB_CLIENT_ID`
- Reinicie o servidor de desenvolvimento

### Erro: "Erro na autenticação"
- Verifique se o `GITHUB_CLIENT_SECRET` está correto no `.env`
- Verifique se o servidor backend está rodando na porta 3001
- Confirme se a callback URL no GitHub está configurada como `http://localhost:3000`

### Erro: "Cannot connect to server"
- Verifique se o servidor backend está rodando: `npm run server`
- Confirme se a porta 3001 não está sendo usada por outro processo

### Repositórios não aparecem
- Verifique se você tem repositórios públicos ou privados com acesso
- Confirme se o token de acesso tem as permissões corretas (repo, user)

## Produção

Para deploy em produção:

1. Configure as variáveis de ambiente no seu provedor de hosting
2. Atualize a callback URL no GitHub para seu domínio de produção
3. Configure CORS no servidor backend para aceitar seu domínio
4. Use HTTPS em produção

## Suporte

Se encontrar problemas:

1. Verifique os logs do console do navegador
2. Verifique os logs do servidor backend
3. Confirme se todas as variáveis de ambiente estão configuradas
4. Teste a conectividade com a API do GitHub