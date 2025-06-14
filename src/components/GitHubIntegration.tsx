import React, { useState } from 'react';
import { useGitHub } from '../context/GitHubContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Github,
  GitBranch,
  FileText,
  Folder,
  Lock,
  Globe,
  Search,
  Plus,
  Save,
  LogOut,
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';

interface GitHubIntegrationProps {
  className?: string;
  onFileSelect?: (content: string) => void;
}

export function GitHubIntegration({ className, onFileSelect }: GitHubIntegrationProps) {
  const { state, login, logout, loadRepositories, selectRepository, selectFile, saveFile, createNewCSSFile } = useGitHub();
  const [searchTerm, setSearchTerm] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [showCreateFile, setShowCreateFile] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const filteredRepositories = state.repositories.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRepositorySelect = async (repoId: string) => {
    const repo = state.repositories.find(r => r.id.toString() === repoId);
    if (repo) {
      await selectRepository(repo);
    }
  };

  const handleFileSelect = async (filePath: string) => {
    const file = state.cssFiles.find(f => f.path === filePath);
    if (file) {
      await selectFile(file);
      if (onFileSelect) {
        onFileSelect(state.currentFileContent);
      }
    }
  };

  const handleSaveFile = async () => {
    if (!state.selectedFile) return;
    
    try {
      const message = saveMessage || 'Atualizar estilos via Visual CSS Editor';
      await saveFile(state.currentFileContent, message);
      setSaveMessage('');
      alert('Arquivo salvo com sucesso!');
    } catch (error) {
      alert('Erro ao salvar arquivo');
    }
  };

  const handleCreateFile = async () => {
    if (!newFileName) return;
    
    try {
      const fileName = newFileName.endsWith('.css') ? newFileName : `${newFileName}.css`;
      await createNewCSSFile(fileName, '/* Novo arquivo CSS criado via Visual CSS Editor */\n');
      setNewFileName('');
      setShowCreateFile(false);
      alert('Arquivo criado com sucesso!');
    } catch (error) {
      alert('Erro ao criar arquivo');
    }
  };

  if (!state.isAuthenticated) {
    return (
      <div className={cn('p-6', className)}>
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Github className="h-6 w-6" />
            </div>
            <CardTitle>Conectar ao GitHub</CardTitle>
            <CardDescription>
              Faça login com sua conta GitHub para editar arquivos CSS diretamente nos seus repositórios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={login} 
              className="w-full" 
              disabled={state.isLoading}
            >
              {state.isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Github className="mr-2 h-4 w-4" />
              )}
              Entrar com GitHub
            </Button>
            {state.error && (
              <p className="mt-2 text-sm text-destructive">{state.error}</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header do usuário */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src={state.user?.avatar_url} 
              alt={state.user?.name}
              className="h-8 w-8 rounded-full"
            />
            <div>
              <p className="font-medium">{state.user?.name}</p>
              <p className="text-sm text-muted-foreground">@{state.user?.login}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Seleção de repositório */}
      {!state.selectedRepository && (
        <div className="p-4 flex-1">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Selecionar Repositório</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadRepositories}
                disabled={state.isLoading}
              >
                {state.isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Atualizar'
                )}
              </Button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar repositórios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredRepositories.map((repo) => (
                <Card 
                  key={repo.id} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleRepositorySelect(repo.id.toString())}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{repo.name}</h4>
                          {repo.private ? (
                            <Lock className="h-3 w-3 text-muted-foreground" />
                          ) : (
                            <Globe className="h-3 w-3 text-muted-foreground" />
                          )}
                        </div>
                        {repo.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {repo.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <GitBranch className="h-3 w-3" />
                          <span className="text-xs">{repo.default_branch}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Repositório selecionado */}
      {state.selectedRepository && (
        <div className="flex-1 flex flex-col">
          {/* Info do repositório */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{state.selectedRepository.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {state.selectedRepository.full_name}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => selectRepository(null as any)}
              >
                Trocar
              </Button>
            </div>
          </div>

          {/* Arquivos CSS */}
          <div className="p-4 flex-1">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Arquivos CSS</h4>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowCreateFile(!showCreateFile)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Novo
                </Button>
              </div>

              {showCreateFile && (
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <Label htmlFor="fileName">Nome do arquivo</Label>
                      <Input
                        id="fileName"
                        placeholder="styles.css"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleCreateFile}>
                          Criar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setShowCreateFile(false)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                {state.cssFiles.map((file) => (
                  <Card 
                    key={file.path}
                    className={cn(
                      'cursor-pointer transition-colors',
                      state.selectedFile?.path === file.path 
                        ? 'bg-primary/10 border-primary' 
                        : 'hover:bg-muted/50'
                    )}
                    onClick={() => handleFileSelect(file.path)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="font-medium">{file.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {file.path}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {state.cssFiles.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Folder className="h-8 w-8 mx-auto mb-2" />
                  <p>Nenhum arquivo CSS encontrado</p>
                  <p className="text-sm">Crie um novo arquivo para começar</p>
                </div>
              )}
            </div>
          </div>

          {/* Controles de salvamento */}
          {state.selectedFile && (
            <div className="p-4 border-t">
              <div className="space-y-3">
                <Label htmlFor="commitMessage">Mensagem do commit</Label>
                <Input
                  id="commitMessage"
                  placeholder="Atualizar estilos via Visual CSS Editor"
                  value={saveMessage}
                  onChange={(e) => setSaveMessage(e.target.value)}
                />
                <Button 
                  onClick={handleSaveFile} 
                  className="w-full"
                  disabled={state.isLoading}
                >
                  {state.isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Salvar no GitHub
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {state.error && (
        <div className="p-4 border-t">
          <p className="text-sm text-destructive">{state.error}</p>
        </div>
      )}
    </div>
  );
}