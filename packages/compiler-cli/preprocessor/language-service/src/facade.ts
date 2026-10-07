/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Location,
  LocationLink,
  Hover,
  Diagnostic,
  Range,
  CompletionList,
  CompletionItem,
  WorkspaceEdit,
  SignatureHelp,
  SignatureHelpContext,
} from 'vscode-languageserver';
import * as rpc from 'vscode-jsonrpc/node';
import {URI} from 'vscode-uri';
import {fileURLToPath} from 'node:url';
import * as path from 'node:path';

export interface StructuralQuickInfo {
  text: string;
  kind: string;
}

export interface DefinitionTarget {
  uri: string;
  range: Range;
}

import {canonicalizePath} from './utils.js';

async function toUri(filePath: string): Promise<string> {
  try {
    const rawPath = filePath.startsWith('file://') ? fileURLToPath(filePath) : filePath;
    const normalized = await canonicalizePath(rawPath);
    return URI.file(normalized).toString();
  } catch {
    return filePath;
  }
}

function normalizeLocations(
  response: Location | Location[] | LocationLink[] | null,
): DefinitionTarget[] | null {
  if (!response) return null;
  const items = Array.isArray(response) ? response : [response];
  if (items.length === 0) return null;

  return items.map((item) => {
    if ('targetUri' in item) {
      return {
        uri: item.targetUri,
        range: item.targetSelectionRange ?? item.targetRange,
      };
    }
    return {
      uri: item.uri,
      range: item.range,
    };
  });
}

export class TsGoFacade {
  private documentVersions = new Map<string, number>();

  constructor(private connection: rpc.MessageConnection) {}

  async ensureDocument(filePath: string, text: string): Promise<void> {
    if (!this.connection) return;
    const uri = await toUri(filePath);
    const existingVersion = this.documentVersions.get(uri);
    if (existingVersion === undefined) {
      const version = 1;
      this.documentVersions.set(uri, version);
      await this.connection.sendNotification('textDocument/didOpen', {
        textDocument: {uri, languageId: 'typescript', version, text},
      });
    } else {
      const version = existingVersion + 1;
      this.documentVersions.set(uri, version);
      await this.connection.sendNotification('textDocument/didChange', {
        textDocument: {uri, version},
        contentChanges: [{text}],
      });
    }
  }

  async isDocumentOpen(filePath: string): Promise<boolean> {
    return this.documentVersions.has(await toUri(filePath));
  }

  async getDefinitionAtPosition(
    filePath: string,
    position: {line: number; character: number},
  ): Promise<DefinitionTarget[] | null> {
    if (!this.connection) return null;
    const uri = await toUri(filePath);
    const response = await this.connection.sendRequest<
      Location | Location[] | LocationLink[] | null
    >('textDocument/definition', {textDocument: {uri}, position});
    return normalizeLocations(response);
  }

  async getTypeDefinitionAtPosition(
    filePath: string,
    position: {line: number; character: number},
  ): Promise<DefinitionTarget[] | null> {
    if (!this.connection) return null;
    const uri = await toUri(filePath);
    const response = await this.connection.sendRequest<
      Location | Location[] | LocationLink[] | null
    >('textDocument/typeDefinition', {textDocument: {uri}, position});
    return normalizeLocations(response);
  }

  async getQuickInfoAtPosition(
    filePath: string,
    position: {line: number; character: number},
  ): Promise<StructuralQuickInfo | null> {
    if (!this.connection) return null;
    const uri = await toUri(filePath);
    const response = await this.connection.sendRequest<Hover | null>('textDocument/hover', {
      textDocument: {uri},
      position,
    });
    return response ? this.mapHoverResponse(response) : null;
  }

  async getReferencesAtPosition(
    filePath: string,
    position: {line: number; character: number},
    context: {includeDeclaration: boolean} = {includeDeclaration: true},
  ): Promise<Location[] | null> {
    if (!this.connection) return null;
    const uri = await toUri(filePath);
    return await this.connection.sendRequest<Location[] | null>('textDocument/references', {
      textDocument: {uri},
      position,
      context,
    });
  }

  async prepareRename(
    filePath: string,
    position: {line: number; character: number},
  ): Promise<Range | {range: Range; placeholder: string} | {defaultBehavior: boolean} | null> {
    if (!this.connection) return null;
    const uri = await toUri(filePath);
    return await this.connection.sendRequest<
      Range | {range: Range; placeholder: string} | {defaultBehavior: boolean} | null
    >('textDocument/prepareRename', {
      textDocument: {uri},
      position,
    });
  }

  async rename(
    filePath: string,
    position: {line: number; character: number},
    newName: string,
  ): Promise<WorkspaceEdit | null> {
    if (!this.connection) return null;
    const uri = await toUri(filePath);
    return await this.connection.sendRequest<WorkspaceEdit | null>('textDocument/rename', {
      textDocument: {uri},
      position,
      newName,
    });
  }

  async getDiagnostics(filePath: string): Promise<Diagnostic[]> {
    if (!this.connection) return [];
    const uri = await toUri(filePath);
    const response = await this.connection.sendRequest<{items?: Diagnostic[]}>(
      'textDocument/diagnostic',
      {textDocument: {uri}},
    );
    return response?.items ?? [];
  }

  async getCompletionsAtPosition(
    filePath: string,
    position: {line: number; character: number},
  ): Promise<CompletionList | null> {
    if (!this.connection) return null;
    const uri = await toUri(filePath);
    const response = await this.connection.sendRequest<CompletionList | CompletionItem[] | null>(
      'textDocument/completion',
      {
        textDocument: {uri},
        position,
      },
    );
    if (!response) return null;
    if (Array.isArray(response)) {
      return {isIncomplete: false, items: response};
    }
    return response;
  }

  async resolveCompletionItem(item: CompletionItem): Promise<CompletionItem | null> {
    if (!this.connection || !item?.data) return item;
    try {
      return await Promise.race([
        this.connection.sendRequest<CompletionItem>('completionItem/resolve', item),
        new Promise<CompletionItem>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), 1000),
        ),
      ]);
    } catch (err) {
      return item;
    }
  }

  async getSignatureHelpAtPosition(
    filePath: string,
    position: {line: number; character: number},
    context?: SignatureHelpContext,
  ): Promise<SignatureHelp | null> {
    if (!this.connection) return null;
    const uri = await toUri(filePath);
    return await this.connection.sendRequest<SignatureHelp | null>('textDocument/signatureHelp', {
      textDocument: {uri},
      position,
      context,
    });
  }

  private mapHoverResponse(response: Hover): StructuralQuickInfo {
    let text = '';
    if (typeof response.contents === 'string') {
      text = response.contents;
    } else if (Array.isArray(response.contents)) {
      text = response.contents
        .map((c: any) => (typeof c === 'string' ? c : (c?.value ?? '')))
        .join('\n');
    } else if (
      response.contents &&
      typeof response.contents === 'object' &&
      'value' in response.contents
    ) {
      text = response.contents.value;
    }

    return {
      text,
      kind: 'property',
    };
  }
}
