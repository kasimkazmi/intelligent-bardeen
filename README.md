# Superpowers AI

**Agentic workflows for TDD, brainstorming, and debugging inside VS Code.**

Superpowers AI is a comprehensive VS Code extension that brings advanced agentic coding capabilities right into your editor. Built as a monorepo, it features a native VS Code Sidebar Dashboard, a robust Model Context Protocol (MCP) server for tool integration, and seamless Copilot Chat participant integration.

## Features

- **🧠 Native Copilot Chat Participant (`@superpowers`)**
  Engage with the Superpowers AI directly inside the VS Code Copilot Chat view using dedicated slash commands:
  - `@superpowers /brainstorm`: Initialize a design planning session to explore features step-by-step.
  - `@superpowers /tdd`: Kick off a Test-Driven Development loop. Generates failing tests and inline action buttons to execute them.
  - `@superpowers /debug`: Paste your error logs for systematic root-cause analysis and debugging.

- **🎛️ Interactive Sidebar Dashboard**
  A rich React-based webview in the VS Code Sidebar that tracks your workflow state. It integrates seamlessly with your VS Code theme using native CSS variables and allows you to trigger test suites and commands with one click.

- **🔌 Model Context Protocol (MCP) Server**
  An integrated standard stdio MCP Server that exposes your workspace tools (such as listing files, parsing ASTs, and tracking state) directly to AI agents.

## Architecture

This project is structured as an npm monorepo with three core packages:

1. **`packages/core`**: Contains the state management engine (`tracker.ts`) and AST analysis tools (`parser.ts`).
2. **`packages/mcp-server`**: An MCP-compliant server exposing the core functionalities over a standard stdio interface.
3. **`packages/vscode-extension`**: The frontend VS Code extension containing the `SidebarProvider`, the React webview, and the Copilot `chatHandler`.

## Installation

### From the Marketplace
*(Coming soon once published)*

### Local Installation (VSIX)
You can install the compiled `.vsix` file locally:
1. Open VS Code.
2. Go to the Extensions view (`Ctrl+Shift+X`).
3. Click the `...` in the top right corner.
4. Select **Install from VSIX...** and choose the `superpowers-vscode-extension-1.0.0.vsix` file.

Alternatively, from the terminal:
```bash
code --install-extension packages/vscode-extension/superpowers-vscode-extension-1.0.0.vsix
```

## Development & Building

To build the extension from source:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build everything:**
   ```bash
   npm run build
   ```
   This will compile the extension using `esbuild` and bundle the React webview into `dist/`.

3. **Run tests:**
   ```bash
   npm test
   ```
   This runs the Vitest test suites across all packages.

4. **Package the extension:**
   ```bash
   cd packages/vscode-extension
   npx @vscode/vsce package --no-dependencies
   ```

## Developer

Developed by **Kasim Kazmi**
- GitHub: [kasim-kazmi](https://github.com/kasim-kazmi)

## License

MIT License
