# Superpowers AI

**Agentic workflows for TDD, brainstorming, and debugging inside VS Code.**

Superpowers AI is a comprehensive VS Code extension that brings advanced agentic coding capabilities right into your editor. Built as a monorepo, it features a native VS Code Sidebar Dashboard, a robust Model Context Protocol (MCP) server for tool integration, and seamless Copilot Chat participant integration.

![Superpowers AI Demo](https://raw.githubusercontent.com/kasimkazmi/intelligent-bardeen/master/docs/demo.gif)
*(Placeholder: Add your animated demo GIF here by recording your screen and placing it in `docs/demo.gif`)*

## Features

### 🤖 Chat Participants (`@superpowers`)
Superpowers AI seamlessly registers as a **Chat Participant** within VS Code's native Copilot Chat view. By typing `@superpowers`, you invoke our specialized AI agent which handles intent-specific workflows using slash commands.
* **`/brainstorm`**: Start a design session where the AI asks clarifying questions before writing code.
* **`/tdd`**: Kick off a Test-Driven Development loop. Generates failing tests and provides inline action buttons to execute and verify them.
* **`/debug`**: Paste your error logs for systematic root-cause analysis.

*(Placeholder: Add GIF demo of Copilot Chat here)*

### 🗂️ View Containers & Views
We leverage VS Code's **View Containers** to add a dedicated icon in your Activity Bar (the far left menu). Clicking this opens the **Superpowers Dashboard View**.
* **Superpowers Dashboard (`superpowers-sidebar-view`)**: A rich React-based webview hosted inside the Sidebar. It dynamically tracks your project's active state, current phase, and active branches. It natively maps to your active VS Code theme using CSS variables, ensuring a beautiful, integrated aesthetic (whether you use dark mode or light mode).

*(Placeholder: Add GIF demo of the Sidebar Dashboard here)*

### 🔌 Model Context Protocol (MCP) Server
An integrated standard stdio MCP Server that exposes your workspace tools (such as listing files, parsing ASTs, and tracking state) directly to AI agents, providing a unified architecture for local context gathering.

## Architecture

This project is structured as an npm monorepo with three core packages:

1. **`packages/core`**: Contains the state management engine (`tracker.ts`) and AST analysis tools (`parser.ts`).
2. **`packages/mcp-server`**: An MCP-compliant server exposing the core functionalities over a standard stdio interface.
3. **`packages/vscode-extension`**: The frontend VS Code extension containing the `SidebarProvider`, the React webview, and the Copilot `chatHandler`.

## Installation

### From the Marketplace
You can install this extension directly from the VS Code Marketplace. Search for **Superpowers AI** in the Extensions tab.

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

3. **Run tests:**
   ```bash
   npm test
   ```

4. **Package the extension:**
   ```bash
   cd packages/vscode-extension
   npx @vscode/vsce package --no-dependencies
   ```

## Developer

Developed by **Kasim Kazmi**
- GitHub: [kasimkazmi](https://github.com/kasimkazmi)
- Website: [kasimkazmi.com](https://kasimkazmi.com)

## License

MIT License
