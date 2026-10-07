import * as vscode from 'vscode';
import {LanguageClient} from 'vscode-languageclient/node';

export function registerCommands(
  context: vscode.ExtensionContext,
  client: LanguageClient,
  outputChannel: vscode.OutputChannel,
) {
  const TCB_HIGHLIGHT_DECORATION = vscode.window.createTextEditorDecorationType({
    backgroundColor: new vscode.ThemeColor('editor.selectionHighlightBackground'),
  });

  const tcbProvider = new TcbContentProvider();
  context.subscriptions.push(
    vscode.workspace.registerTextDocumentContentProvider('ng', tcbProvider),
  );

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('angular.getTemplateTcb', async (textEditor) => {
      tcbProvider.clear();
      try {
        outputChannel.appendLine('Requesting TCB from server...');
        const response = (await client.sendRequest('angular/getTcb', {
          textDocument: client.code2ProtocolConverter.asTextDocumentIdentifier(textEditor.document),
          position: client.code2ProtocolConverter.asPosition(textEditor.selection.active),
        })) as {uri: string; content: string; selections: any[]} | null;

        if (!response) {
          vscode.window.showInformationMessage('No TCB available for this position.');
          return;
        }

        outputChannel.appendLine(
          `Received TCB response. Content length: ${response.content.length}`,
        );

        const tcbUri = vscode.Uri.parse(response.uri).with({
          scheme: 'ng',
        });
        tcbProvider.update(tcbUri, response.content);
        const editor = await vscode.window.showTextDocument(tcbUri, {
          viewColumn: vscode.ViewColumn.Beside,
          preserveFocus: true,
        });

        const selections = response.selections.map((s: any) => {
          return new vscode.Range(
            new vscode.Position(s.start.line, s.start.character),
            new vscode.Position(s.end.line, s.end.character),
          );
        });

        editor.setDecorations(TCB_HIGHLIGHT_DECORATION, selections);
      } catch (err) {
        vscode.window.showErrorMessage(`Failed to get TCB: ${err}`);
      }
    }),
  );
}

class TcbContentProvider implements vscode.TextDocumentContentProvider {
  private readonly _onDidChange = new vscode.EventEmitter<vscode.Uri>();
  readonly onDidChange = this._onDidChange.event;

  private readonly uisToContents = new Map<string, string>();

  provideTextDocumentContent(uri: vscode.Uri): string | undefined {
    return this.uisToContents.get(uri.toString());
  }

  update(uri: vscode.Uri, content: string) {
    this.uisToContents.set(uri.toString(), content);
    this._onDidChange.fire(uri);
  }

  clear() {
    this.uisToContents.clear();
  }
}
