import * as vscode from 'vscode';

export class SidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'superpowers-sidebar-view';
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    const messageDisposable = webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'onInfo': {
          if (!data.value) return;
          vscode.window.showInformationMessage(data.value);
          break;
        }
        case 'runCommand': {
          if (typeof data.value !== 'string' || !data.value.trim()) return;
          this.runLocalCommand(data.value);
          break;
        }
      }
    });

    webviewView.onDidDispose(() => {
      messageDisposable.dispose();
      this._view = undefined;
    });
  }

  private runLocalCommand(command: string) {
    const terminal =
      vscode.window.terminals.find((t) => t.name === 'Superpowers Runner') ||
      vscode.window.createTerminal(`Superpowers Runner`);
    terminal.show();
    terminal.sendText(command);
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview.js')
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'dist', 'webview.css')
    );
    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src ${webview.cspSource};">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Superpowers Dashboard</title>
        <link href="${styleUri}" rel="stylesheet">
        <style>
          body { font-family: var(--vscode-font-family); color: var(--vscode-foreground); background-color: var(--vscode-sideBar-background); }
        </style>
      </head>
      <body>
        <div id="root"></div>
        <script src="${scriptUri}"></script>
      </body>
      </html>`;
  }
}
