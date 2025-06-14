import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { githubService, GitHubUser, Repository, FileContent } from '../services/github';

interface GitHubState {
  isAuthenticated: boolean;
  user: GitHubUser | null;
  repositories: Repository[];
  selectedRepository: Repository | null;
  cssFiles: FileContent[];
  selectedFile: FileContent | null;
  currentFileContent: string;
  isLoading: boolean;
  error: string | null;
}

type GitHubAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_USER'; payload: GitHubUser | null }
  | { type: 'SET_REPOSITORIES'; payload: Repository[] }
  | { type: 'SET_SELECTED_REPOSITORY'; payload: Repository | null }
  | { type: 'SET_CSS_FILES'; payload: FileContent[] }
  | { type: 'SET_SELECTED_FILE'; payload: FileContent | null }
  | { type: 'SET_FILE_CONTENT'; payload: string }
  | { type: 'LOGOUT' };

const initialState: GitHubState = {
  isAuthenticated: false,
  user: null,
  repositories: [],
  selectedRepository: null,
  cssFiles: [],
  selectedFile: null,
  currentFileContent: '',
  isLoading: false,
  error: null,
};

function githubReducer(state: GitHubState, action: GitHubAction): GitHubState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_REPOSITORIES':
      return { ...state, repositories: action.payload };
    case 'SET_SELECTED_REPOSITORY':
      return { 
        ...state, 
        selectedRepository: action.payload,
        cssFiles: [],
        selectedFile: null,
        currentFileContent: ''
      };
    case 'SET_CSS_FILES':
      return { ...state, cssFiles: action.payload };
    case 'SET_SELECTED_FILE':
      return { ...state, selectedFile: action.payload };
    case 'SET_FILE_CONTENT':
      return { ...state, currentFileContent: action.payload };
    case 'LOGOUT':
      return {
        ...initialState,
        isAuthenticated: false,
      };
    default:
      return state;
  }
}

interface GitHubContextType {
  state: GitHubState;
  login: () => Promise<void>;
  logout: () => void;
  loadRepositories: () => Promise<void>;
  selectRepository: (repo: Repository) => Promise<void>;
  loadCSSFiles: () => Promise<void>;
  selectFile: (file: FileContent) => Promise<void>;
  saveFile: (content: string, commitMessage?: string) => Promise<boolean>;
  createNewCSSFile: (fileName: string, content: string) => Promise<boolean>;
}

const GitHubContext = createContext<GitHubContextType | undefined>(undefined);

export function useGitHub() {
  const context = useContext(GitHubContext);
  if (context === undefined) {
    throw new Error('useGitHub deve ser usado dentro de um GitHubProvider');
  }
  return context;
}

interface GitHubProviderProps {
  children: ReactNode;
}

export function GitHubProvider({ children }: GitHubProviderProps) {
  const [state, dispatch] = useReducer(githubReducer, initialState);

  // Verificar autenticação ao carregar
  useEffect(() => {
    const checkAuth = async () => {
      if (githubService.isAuthenticated()) {
        try {
          dispatch({ type: 'SET_LOADING', payload: true });
          const user = await githubService.getUser();
          dispatch({ type: 'SET_USER', payload: user });
          dispatch({ type: 'SET_AUTHENTICATED', payload: true });
        } catch (error) {
          console.error('Erro ao verificar autenticação:', error);
          githubService.logout();
          dispatch({ type: 'SET_AUTHENTICATED', payload: false });
        } finally {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    };

    checkAuth();
  }, []);

  // Processar callback de autenticação
  useEffect(() => {
    const handleAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');

      if (code && state) {
        try {
          dispatch({ type: 'SET_LOADING', payload: true });
          const success = await githubService.handleAuthCallback(code, state);
          
          if (success) {
            const user = await githubService.getUser();
            dispatch({ type: 'SET_USER', payload: user });
            dispatch({ type: 'SET_AUTHENTICATED', payload: true });
            
            // Limpar parâmetros da URL
            window.history.replaceState({}, document.title, window.location.pathname);
          } else {
            dispatch({ type: 'SET_ERROR', payload: 'Falha na autenticação' });
          }
        } catch (error) {
          dispatch({ type: 'SET_ERROR', payload: 'Erro durante autenticação' });
        } finally {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    };

    handleAuthCallback();
  }, []);

  const login = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const authUrl = await githubService.authenticate();
      window.location.href = authUrl;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao iniciar autenticação' });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = () => {
    githubService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const loadRepositories = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const repos = await githubService.getRepositories();
      dispatch({ type: 'SET_REPOSITORIES', payload: repos });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao carregar repositórios' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const selectRepository = async (repo: Repository) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      dispatch({ type: 'SET_SELECTED_REPOSITORY', payload: repo });
      
      // Carregar arquivos CSS automaticamente
      await loadCSSFiles();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao selecionar repositório' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadCSSFiles = async () => {
    if (!state.selectedRepository) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const [owner, repo] = state.selectedRepository.full_name.split('/');
      const files = await githubService.getCSSFiles(owner, repo, state.selectedRepository.default_branch);
      
      dispatch({ type: 'SET_CSS_FILES', payload: files });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao carregar arquivos CSS' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const selectFile = async (file: FileContent) => {
    if (!state.selectedRepository) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      dispatch({ type: 'SET_SELECTED_FILE', payload: file });
      
      const [owner, repo] = state.selectedRepository.full_name.split('/');
      const content = await githubService.getFileContent(
        owner, 
        repo, 
        file.path, 
        state.selectedRepository.default_branch
      );
      
      dispatch({ type: 'SET_FILE_CONTENT', payload: content });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao carregar arquivo' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const saveFile = async (content: string, commitMessage = 'Atualizar estilos via Visual CSS Editor') => {
    if (!state.selectedRepository || !state.selectedFile) {
      throw new Error('Nenhum repositório ou arquivo selecionado');
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const [owner, repo] = state.selectedRepository.full_name.split('/');
      
      // Obter SHA atual do arquivo
      const sha = await githubService.getFileSHA(
        owner,
        repo,
        state.selectedFile.path,
        state.selectedRepository.default_branch
      );
      
      const success = await githubService.updateFile(
        owner,
        repo,
        state.selectedFile.path,
        content,
        commitMessage,
        sha,
        state.selectedRepository.default_branch
      );
      
      if (success) {
        dispatch({ type: 'SET_FILE_CONTENT', payload: content });
      }
      
      return success;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao salvar arquivo' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createNewCSSFile = async (fileName: string, content: string) => {
    if (!state.selectedRepository) {
      throw new Error('Nenhum repositório selecionado');
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });
      
      const [owner, repo] = state.selectedRepository.full_name.split('/');
      const filePath = `src/styles/${fileName}`;
      
      const success = await githubService.createFile(
        owner,
        repo,
        filePath,
        content,
        `Criar ${fileName} via Visual CSS Editor`,
        state.selectedRepository.default_branch
      );
      
      if (success) {
        // Recarregar lista de arquivos CSS
        await loadCSSFiles();
      }
      
      return success;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Erro ao criar arquivo' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const value: GitHubContextType = {
    state,
    login,
    logout,
    loadRepositories,
    selectRepository,
    loadCSSFiles,
    selectFile,
    saveFile,
    createNewCSSFile,
  };

  return (
    <GitHubContext.Provider value={value}>
      {children}
    </GitHubContext.Provider>
  );
}