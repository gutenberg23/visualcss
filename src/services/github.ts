import { Octokit } from '@octokit/rest';

interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  email: string;
}

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  default_branch: string;
  private: boolean;
}

interface FileContent {
  name: string;
  path: string;
  content: string;
  sha: string;
  type: 'file' | 'dir';
}

class GitHubService {
  private octokit: Octokit | null = null;
  private accessToken: string | null = null;

  constructor() {
    // Recuperar token do localStorage se existir
    this.accessToken = localStorage.getItem('github_token');
    if (this.accessToken) {
      this.octokit = new Octokit({
        auth: this.accessToken,
      });
    }
  }

  // Autenticar com GitHub
  async authenticate(): Promise<string> {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    if (!clientId) {
      throw new Error('VITE_GITHUB_CLIENT_ID não configurado');
    }

    const redirectUri = window.location.origin;
    const scope = 'repo,user';
    const state = Math.random().toString(36).substring(2, 15);
    
    // Salvar state para verificação posterior
    localStorage.setItem('github_oauth_state', state);
    
    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
    
    return authUrl;
  }

  // Lidar com callback de autenticação
  async handleAuthCallback(code: string, state: string): Promise<boolean> {
    const savedState = localStorage.getItem('github_oauth_state');
    
    if (state !== savedState) {
      throw new Error('Estado de OAuth inválido');
    }
    
    // Limpar state
    localStorage.removeItem('github_oauth_state');
    
    try {
      // Trocar código por token usando o servidor backend ou Netlify Function
      const isNetlify = window.location.hostname.includes('netlify.app') || window.location.hostname.includes('netlify.com');
      const authUrl = isNetlify 
        ? '/.netlify/functions/auth'
        : 'http://localhost:3001/api/auth/github';
      
      const response = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro na autenticação');
      }

      const { access_token } = await response.json();
      this.setAccessToken(access_token);
      return true;
    } catch (error) {
      console.error('Erro no callback de autenticação:', error);
      throw error;
    }
  }

  // Definir token de acesso
  setAccessToken(token: string): void {
    this.accessToken = token;
    localStorage.setItem('github_token', token);
    this.octokit = new Octokit({
      auth: token,
    });
  }

  // Verificar se está autenticado
  isAuthenticated(): boolean {
    return !!this.accessToken && !!this.octokit;
  }

  // Fazer logout
  logout(): void {
    this.accessToken = null;
    this.octokit = null;
    localStorage.removeItem('github_token');
    localStorage.removeItem('github_auth_state');
  }

  // Obter informações do usuário
  async getUser(): Promise<GitHubUser> {
    if (!this.octokit) {
      throw new Error('Não autenticado');
    }

    const { data } = await this.octokit.rest.users.getAuthenticated();
    return {
      login: data.login,
      name: data.name || data.login,
      avatar_url: data.avatar_url,
      email: data.email || '',
    };
  }

  // Listar repositórios do usuário
  async getRepositories(): Promise<Repository[]> {
    if (!this.octokit) {
      throw new Error('Não autenticado');
    }

    const { data } = await this.octokit.rest.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100,
    });

    return data.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description || '',
      html_url: repo.html_url,
      default_branch: repo.default_branch,
      private: repo.private,
    }));
  }

  // Obter conteúdo de um arquivo
  async getFileContent(owner: string, repo: string, path: string, branch = 'main'): Promise<string> {
    if (!this.octokit) {
      throw new Error('Não autenticado');
    }

    try {
      const { data } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref: branch,
      });

      if ('content' in data && data.type === 'file') {
        return atob(data.content.replace(/\s/g, ''));
      }
      throw new Error('Arquivo não encontrado ou é um diretório');
    } catch (error) {
      console.error('Erro ao obter arquivo:', error);
      throw error;
    }
  }

  // Listar arquivos CSS em um repositório
  async getCSSFiles(owner: string, repo: string, branch = 'main'): Promise<FileContent[]> {
    if (!this.octokit) {
      throw new Error('Não autenticado');
    }

    const cssFiles: FileContent[] = [];

    const searchPaths = [
      'src/styles',
      'src/css',
      'public/css',
      'assets/css',
      'css',
      'styles',
      'src',
      'public',
    ];

    for (const searchPath of searchPaths) {
      try {
        const { data } = await this.octokit.rest.repos.getContent({
          owner,
          repo,
          path: searchPath,
          ref: branch,
        });

        if (Array.isArray(data)) {
          const files = data.filter(item => 
            item.type === 'file' && 
            (item.name.endsWith('.css') || item.name.endsWith('.scss') || item.name.endsWith('.sass'))
          );

          for (const file of files) {
            cssFiles.push({
              name: file.name,
              path: file.path,
              content: '',
              sha: file.sha,
              type: 'file',
            });
          }
        }
      } catch (error) {
        // Diretório não existe, continuar
        continue;
      }
    }

    return cssFiles;
  }

  // Atualizar arquivo no repositório
  async updateFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    sha: string,
    branch = 'main'
  ): Promise<boolean> {
    if (!this.octokit) {
      throw new Error('Não autenticado');
    }

    try {
      await this.octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message,
        content: btoa(content),
        sha,
        branch,
      });
      return true;
    } catch (error) {
      console.error('Erro ao atualizar arquivo:', error);
      throw error;
    }
  }

  // Criar novo arquivo no repositório
  async createFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    branch = 'main'
  ): Promise<boolean> {
    if (!this.octokit) {
      throw new Error('Não autenticado');
    }

    try {
      await this.octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message,
        content: btoa(content),
        branch,
      });
      return true;
    } catch (error) {
      console.error('Erro ao criar arquivo:', error);
      throw error;
    }
  }

  // Obter SHA de um arquivo
  async getFileSHA(owner: string, repo: string, path: string, branch = 'main'): Promise<string> {
    if (!this.octokit) {
      throw new Error('Não autenticado');
    }

    try {
      const { data } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref: branch,
      });

      if ('sha' in data) {
        return data.sha;
      }
      throw new Error('SHA não encontrado');
    } catch (error) {
      console.error('Erro ao obter SHA:', error);
      throw error;
    }
  }
}

export const githubService = new GitHubService();
export type { GitHubUser, Repository, FileContent };