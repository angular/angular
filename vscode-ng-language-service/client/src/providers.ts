/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as vscode from 'vscode';

export const ANGULAR_SCHEME = 'ng';

/**
 * Allocate a provider of documents corresponding to the `ng` URI scheme,
 * which we will use to provide a virtual document with the TCB contents.
 *
 * We use a virtual document provider rather than opening an untitled file to
 * ensure the buffer remains readonly (https://github.com/microsoft/vscode/issues/4873).
 */
export class TcbContentProvider implements vscode.TextDocumentContentProvider {
  /**
   * Event emitter used to notify VSCode of a change to the TCB virtual document,
   * prompting it to re-evaluate the document content. This is needed to bust
   * VSCode's document cache if someone requests a TCB that was previously opened.
   * https://code.visualstudio.com/api/extension-guides/virtual-documents#update-virtual-documents
   */
  private readonly onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
  /**
   * Name of the typecheck file.
   */
  private tcbFile: vscode.Uri | null = null;
  /**
   * Content of the entire typecheck file.
   */
  private tcbContent: string | null = null;

  /**
   * This callback is invoked only when user explicitly requests to view or
   * update typecheck file. We do not automatically update the typecheck document
   * when the source file changes.
   */
  readonly onDidChange = this.onDidChangeEmitter.event;

  provideTextDocumentContent(
    uri: vscode.Uri,
    token: vscode.CancellationToken,
  ): vscode.ProviderResult<string> {
    if (uri.toString() !== this.tcbFile?.toString()) {
      return null;
    }
    return this.tcbContent;
  }

  update(uri: vscode.Uri, content: string) {
    this.tcbFile = uri;
    this.tcbContent = content;
    this.onDidChangeEmitter.fire(uri);
  }

  clear() {
    this.tcbFile = null;
    this.tcbContent = null;
  }
}
