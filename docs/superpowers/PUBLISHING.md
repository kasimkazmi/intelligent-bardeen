# Publishing & Installation Guide

## 1. Local Testing
Your extension has been packaged successfully as a `.vsix` file. You can install it locally to test:

1. Open VS Code.
2. Go to the Extensions view (`Ctrl+Shift+X`).
3. Click the `...` in the top right corner of the Extensions view.
4. Select **Install from VSIX...** and choose `C:\Users\Kasim Kazmi\Documents\antigravity\intelligent-bardeen\packages\vscode-extension\superpowers-vscode-extension-1.0.0.vsix`.

Alternatively, you can install it via the terminal:
```bash
code --install-extension "C:\Users\Kasim Kazmi\Documents\antigravity\intelligent-bardeen\packages\vscode-extension\superpowers-vscode-extension-1.0.0.vsix"
```

### Manual Testing Checklist
1. Open a new VS Code window.
2. Ensure the **Superpowers AI** sidebar icon appears.
3. Open the sidebar and verify the React Checklist UI renders.
4. Click items and ensure state updates correctly.
5. Open GitHub Copilot Chat and type `@superpowers /brainstorm` - ensure it responds with the brainstorm text.
6. Test `@superpowers /tdd` and `@superpowers /debug` and verify that actionable buttons appear.
7. Click the action buttons and ensure they execute their respective VS Code commands.

## 2. Publishing to the VS Code Marketplace

Once you have verified the extension locally, you can publish it:

1. Ensure you have an **Azure DevOps** account and have created a **Personal Access Token (PAT)**. Ensure the PAT has the `Marketplace (manage)` scope.
2. Create a publisher on the [VS Code Marketplace Management Page](https://marketplace.visualstudio.com/manage) with the ID `kasim-kazmi` (as defined in `package.json`).
3. Run the following command in the terminal to publish:
   ```bash
   cd packages/vscode-extension
   npx @vscode/vsce publish
   ```
4. You will be prompted to input your PAT.
5. Once complete, your extension will be live on the Marketplace!

*Note: You may need to create a `LICENSE` file before publishing. VS Code expects standard open source licenses (e.g., MIT, Apache) when publishing.*
