import React, { useState } from 'react';
import { EditorProvider } from './context/EditorContext';
import { GitHubProvider } from './context/GitHubContext';
import { Toolbar } from './components/Toolbar';
import { Preview } from './components/Preview';
import { StylePanel } from './components/StylePanel';
import { GitHubIntegration } from './components/GitHubIntegration';
import { Button } from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Github, Palette, Code, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from './lib/utils';
import './App.css';

function App() {
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [showCodeView, setShowCodeView] = useState(false);
  const [activeTab, setActiveTab] = useState('editor');

  const togglePanel = () => {
    setIsPanelCollapsed(!isPanelCollapsed);
  };

  const handleCodeView = () => {
    setShowCodeView(!showCodeView);
  };

  const handleExport = () => {
    // Custom export logic can be implemented here
    console.log('Export triggered');
  };

  const handleImport = () => {
    // Custom import logic can be implemented here
    console.log('Import triggered');
  };

  const handleFileSelect = (content: string) => {
    // TODO: Load CSS content into editor
    console.log('File selected:', content);
    setActiveTab('editor');
  };

  return (
    <GitHubProvider>
      <EditorProvider>
        <div className="h-screen flex flex-col bg-background">
          {/* Header with Tabs */}
          <header className="border-b bg-background px-4 py-2">
            <div className="flex items-center justify-between w-full">
              <h1 className="text-xl font-bold">Visual CSS Editor</h1>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                <TabsList>
                  <TabsTrigger value="editor" className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Editor
                  </TabsTrigger>
                  <TabsTrigger value="github" className="flex items-center gap-2">
                    <Github className="h-4 w-4" />
                    GitHub
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </header>

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full w-full">
              <TabsContent value="editor" className="h-full m-0">
                <div className="flex h-full">
                  {/* Toolbar */}
                  <div className="flex-1 flex flex-col">
                    <Toolbar
                      onExport={handleExport}
                      onImport={handleImport}
                      onCodeView={handleCodeView}
                      showCodeView={showCodeView}
                    />
                    
                    {/* Preview Area */}
                    <div className="flex-1 overflow-hidden">
                      <Preview />
                    </div>
                  </div>

                  {/* Panel Toggle Button */}
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={togglePanel}
                      className={cn(
                        "absolute top-1/2 -translate-y-1/2 z-10 h-12 w-6 p-0 rounded-l-md rounded-r-none border-l border-y bg-background shadow-sm",
                        isPanelCollapsed ? "-left-6" : "-left-6"
                      )}
                    >
                      {isPanelCollapsed ? (
                        <ChevronLeft className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {/* Style Panel */}
                  <div
                    className={cn(
                      "transition-all duration-300 ease-in-out border-l bg-background",
                      isPanelCollapsed ? "w-0 overflow-hidden" : "w-80"
                    )}
                  >
                    <StylePanel />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="github" className="h-full m-0">
                <GitHubIntegration onFileSelect={handleFileSelect} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Status Bar */}
          <div className="h-6 bg-muted/50 border-t flex items-center px-4 text-xs text-muted-foreground">
            <span>Visual CSS Editor - Ready</span>
            <div className="ml-auto flex items-center gap-4">
              <span>React + Vite + TypeScript</span>
              <span>•</span>
              <span>Tailwind CSS</span>
            </div>
          </div>
        </div>
      </EditorProvider>
    </GitHubProvider>
  );
}

export default App;