import React, { useRef, useEffect, useState } from 'react'
import { useEditor } from '../context/EditorContext'
import { cn } from '../lib/utils'

interface PreviewProps {
  className?: string
}

export function Preview({ className }: PreviewProps) {
  const { state, selectElement, styles } = useEditor()
  const previewRef = useRef<HTMLDivElement>(null)
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null)
  const styleElementRef = useRef<HTMLStyleElement | null>(null)

  // Sample HTML content for demonstration
  const sampleHTML = `
    <div class="container">
      <header class="header">
        <h1 class="title">Welcome to Visual CSS Editor</h1>
        <nav class="navigation">
          <a href="#" class="nav-link">Home</a>
          <a href="#" class="nav-link">About</a>
          <a href="#" class="nav-link">Services</a>
          <a href="#" class="nav-link">Contact</a>
        </nav>
      </header>
      
      <main class="main-content">
        <section class="hero">
          <h2 class="hero-title">Build Beautiful Websites</h2>
          <p class="hero-description">
            Create stunning web designs with our visual CSS editor. 
            Click on any element to start editing its styles in real-time.
          </p>
          <button class="cta-button">Get Started</button>
        </section>
        
        <section class="features">
          <h3 class="section-title">Features</h3>
          <div class="feature-grid">
            <div class="feature-card">
              <h4 class="feature-title">Visual Editing</h4>
              <p class="feature-description">Edit CSS properties with intuitive visual controls</p>
            </div>
            <div class="feature-card">
              <h4 class="feature-title">Real-time Preview</h4>
              <p class="feature-description">See your changes instantly as you edit</p>
            </div>
            <div class="feature-card">
              <h4 class="feature-title">Export Ready</h4>
              <p class="feature-description">Export clean CSS or JSON for your projects</p>
            </div>
          </div>
        </section>
      </main>
      
      <footer class="footer">
        <p class="footer-text">&copy; 2024 Visual CSS Editor. All rights reserved.</p>
      </footer>
    </div>
  `

  // Default styles for the sample content
  const defaultStyles = `
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 0;
      border-bottom: 2px solid #e2e8f0;
      margin-bottom: 40px;
    }
    
    .title {
      font-size: 2rem;
      font-weight: bold;
      color: #1a202c;
      margin: 0;
    }
    
    .navigation {
      display: flex;
      gap: 20px;
    }
    
    .nav-link {
      text-decoration: none;
      color: #4a5568;
      font-weight: 500;
      padding: 8px 16px;
      border-radius: 6px;
      transition: all 0.2s;
    }
    
    .nav-link:hover {
      background-color: #e2e8f0;
      color: #2d3748;
    }
    
    .main-content {
      margin-bottom: 60px;
    }
    
    .hero {
      text-align: center;
      padding: 60px 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      color: white;
      margin-bottom: 60px;
    }
    
    .hero-title {
      font-size: 3rem;
      font-weight: bold;
      margin-bottom: 20px;
    }
    
    .hero-description {
      font-size: 1.25rem;
      margin-bottom: 30px;
      opacity: 0.9;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }
    
    .cta-button {
      background-color: #ffffff;
      color: #667eea;
      border: none;
      padding: 12px 30px;
      font-size: 1.1rem;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    }
    
    .features {
      padding: 40px 0;
    }
    
    .section-title {
      font-size: 2.5rem;
      text-align: center;
      margin-bottom: 40px;
      color: #1a202c;
    }
    
    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
    }
    
    .feature-card {
      background: #f7fafc;
      padding: 30px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      transition: all 0.2s;
    }
    
    .feature-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    }
    
    .feature-title {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 15px;
      color: #2d3748;
    }
    
    .feature-description {
      color: #4a5568;
      margin: 0;
    }
    
    .footer {
      text-align: center;
      padding: 30px 0;
      border-top: 1px solid #e2e8f0;
      margin-top: 60px;
    }
    
    .footer-text {
      color: #718096;
      margin: 0;
    }
  `

  // Update styles when editor styles change
  useEffect(() => {
    if (!styleElementRef.current) {
      styleElementRef.current = document.createElement('style')
      document.head.appendChild(styleElementRef.current)
    }

    const customStyles = styles
      .map(rule => {
        const styleDeclarations = Object.entries(rule.styles)
          .map(([prop, value]) => `${prop}: ${value};`)
          .join(' ')
        return `${rule.selector} { ${styleDeclarations} }`
      })
      .join('\n')

    styleElementRef.current.textContent = defaultStyles + '\n' + customStyles

    return () => {
      if (styleElementRef.current) {
        document.head.removeChild(styleElementRef.current)
        styleElementRef.current = null
      }
    }
  }, [styles])

  // Handle element selection
  const handleElementClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const target = e.target as HTMLElement
    if (target && target !== previewRef.current) {
      selectElement(target)
    }
  }

  // Handle element hover
  const handleElementMouseEnter = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target && target !== previewRef.current && target !== hoveredElement) {
      setHoveredElement(target)
      target.classList.add('element-hover')
    }
  }

  const handleElementMouseLeave = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target && target === hoveredElement) {
      target.classList.remove('element-hover')
      setHoveredElement(null)
    }
  }

  // Highlight selected element
  useEffect(() => {
    // Remove previous highlights
    const previousHighlights = document.querySelectorAll('.element-highlight')
    previousHighlights.forEach(el => el.classList.remove('element-highlight'))

    // Add highlight to selected element
    if (state.selectedElement?.element) {
      state.selectedElement.element.classList.add('element-highlight')
    }
  }, [state.selectedElement])

  return (
    <div className={cn('h-full bg-white overflow-auto', className)}>
      <style>{`
        .element-hover {
          outline: 1px dashed #3b82f6 !important;
          outline-offset: -1px !important;
        }
        
        .element-highlight {
          outline: 2px solid #3b82f6 !important;
          outline-offset: -2px !important;
          position: relative;
        }
        
        .element-highlight::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(59, 130, 246, 0.1);
          pointer-events: none;
        }
      `}</style>
      
      <div
        ref={previewRef}
        className="min-h-full"
        style={{ transform: `scale(${state.zoom})`, transformOrigin: 'top left' }}
        onClick={handleElementClick}
        onMouseEnter={handleElementMouseEnter}
        onMouseLeave={handleElementMouseLeave}
        dangerouslySetInnerHTML={{ __html: sampleHTML }}
      />
    </div>
  )
}