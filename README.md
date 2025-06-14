# Visual CSS Editor

A modern, real-time visual CSS editor built with React, TypeScript, and Tailwind CSS. This application allows you to visually edit CSS properties of HTML elements with live preview, similar to browser DevTools or tools like Webflow.

## Features

### Editor Visual
- **Live CSS Editing**: Real-time visual editing of CSS properties
- **Interactive Preview**: Click on elements to select and edit their styles
- **Comprehensive Style Panel**: Edit colors, typography, spacing, and layout properties
- **Color Picker**: Advanced color selection with preset colors and hex input
- **Responsive Controls**: Adjust spacing, sizing, and positioning with sliders
- **Typography Controls**: Font family, size, weight, and text styling options
- **Layout Tools**: Flexbox and grid layout controls
- **History Management**: Undo/redo functionality for style changes

### Integração GitHub
- **GitHub OAuth**: Login seguro com sua conta GitHub
- **Repository Browser**: Visualize e selecione seus repositórios
- **CSS File Detection**: Encontra automaticamente arquivos CSS no projeto
- **Live Editing**: Edite arquivos CSS diretamente do GitHub
- **Direct Commit**: Salve mudanças diretamente no repositório com commits automáticos
- **File Creation**: Crie novos arquivos CSS diretamente no repositório
- **Branch Support**: Trabalhe com diferentes branches do seu projeto

### Interface
- **Modern UI**: Clean, intuitive interface built with Radix UI components
- **Dual Mode**: Alterne entre modo Editor e modo GitHub
- **Responsive Design**: Interface adaptável para diferentes tamanhos de tela

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Framer Motion** for smooth animations
- **Monaco Editor** for code editing
- **React Colorful** for color picking
- **Lucide React** for icons

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager
- GitHub account (para integração com repositórios)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd visual-css-editor
```

2. Install dependencies:
```bash
npm install
```

3. Configure GitHub OAuth (opcional, mas recomendado):
   - Vá para [GitHub Developer Settings](https://github.com/settings/developers)
   - Clique em "New OAuth App"
   - Preencha os campos:
     - **Application name**: Visual CSS Editor
     - **Homepage URL**: `http://localhost:3000`
     - **Authorization callback URL**: `http://localhost:3000`
   - Copie o **Client ID** gerado
   - Renomeie `.env.example` para `.env`
   - Cole o Client ID no arquivo `.env`:
     ```
     VITE_GITHUB_CLIENT_ID=seu_client_id_aqui
     ```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000`

## Usage

### Modo Editor (Local)

1. **Select an Element**: Click on any element in the preview area to select it
2. **Edit Styles**: Use the style panel on the right to modify CSS properties:
   - **Colors**: Background, text, and border colors with color picker
   - **Typography**: Font family, size, weight, line height, and text alignment
   - **Spacing**: Margin and padding controls with visual sliders
   - **Layout**: Display, position, flexbox, and grid properties

3. **Visual Feedback**: See changes applied in real-time as you edit
4. **History**: Use Ctrl+Z (Undo) and Ctrl+Y (Redo) to navigate through changes

### Modo GitHub (Integração)

1. **Login**: Clique na aba "GitHub" e faça login com sua conta
2. **Selecionar Repositório**: 
   - Browse through your repositories
   - Use the search bar to find specific repos
   - Click on a repository to select it

3. **Escolher Arquivo CSS**:
   - The app automatically finds CSS files in your repository
   - Click on any CSS file to load it into the editor
   - Create new CSS files if needed

4. **Editar e Salvar**:
   - Switch back to "Editor" tab to make visual changes
   - Return to "GitHub" tab to save changes
   - Add a commit message and click "Salvar no GitHub"
   - Changes are committed directly to your repository

### Style Panel Sections

- **Colors**: Background, text, and border colors with color picker
- **Typography**: Font family, size, weight, line height, text alignment
- **Spacing**: Margin and padding controls with individual side editing
- **Layout**: Display, position, dimensions, flexbox, and grid properties
- **Border**: Border width, style, radius with individual corner controls
- **Effects**: Box shadow, opacity, and transform properties

### Toolbar Features

- **Undo/Redo**: Navigate through edit history
- **Zoom**: Adjust preview zoom from 25% to 200%
- **Grid Toggle**: Show/hide alignment grid
- **Box Model**: Toggle box model visualization
- **Branch Support**: Work with different branches of your repository
- **File Management**: Create new CSS files directly in your GitHub repo

### Keyboard Shortcuts

- `Ctrl+Z` / `Cmd+Z`: Undo
- `Ctrl+Y` / `Cmd+Y`: Redo
- `Ctrl+S` / `Cmd+S`: Export styles
- `Escape`: Deselect current element

## Project Structure

```
src/
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── Preview.tsx         # Main preview area
│   ├── StylePanel.tsx      # Style editing panel
│   └── Toolbar.tsx         # Top toolbar
├── context/
│   └── EditorContext.tsx   # Global state management
├── lib/
│   └── utils.ts           # Utility functions
├── types/
│   └── index.ts           # TypeScript type definitions
├── App.tsx                # Main application component
├── main.tsx              # Application entry point
└── index.css             # Global styles
```

## Customization

### Adding New Style Properties

1. Update the `CSSProperties` interface in `src/types/index.ts`
2. Add the new property controls in `StylePanel.tsx`
3. Update the style application logic in the editor context

### Custom Themes

The application uses CSS variables for theming. Modify the variables in `src/index.css` to customize the appearance:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... other variables */
}
```

### Adding New Components

The preview area renders a sample HTML structure. To add your own content:

1. Modify the `sampleHTML` in `Preview.tsx`
2. Update the default styles if needed
3. Ensure proper element selection handling

## Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint
- `npm run type-check`: Run TypeScript compiler check

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Roadmap

- [ ] CSS Grid visual editor
- [ ] Flexbox visual controls
- [ ] Animation timeline editor
- [ ] Component library integration
- [ ] Collaborative editing
- [ ] Plugin system
- [ ] Mobile responsive editing
- [ ] CSS custom properties support

## Troubleshooting

### Common Issues

1. **Styles not applying**: Check browser console for errors
2. **Element selection not working**: Ensure proper event handling setup
3. **Performance issues**: Consider reducing the number of style updates

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Acknowledgments

- Inspired by browser DevTools and visual design tools
- Built with amazing open-source libraries
- UI components from Radix UI and Shadcn/ui