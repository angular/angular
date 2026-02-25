/**
 * @license
 * Copyright Google LLC. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as fs from 'node:fs';
import * as crypto from 'node:crypto';
import * as path from 'node:path';
import * as vscode from 'vscode';
import * as lsp from 'vscode-languageclient/node';

import {
  OpenOutputChannel,
  ProjectLoadingFinish,
  ProjectLoadingStart,
  SuggestStrictMode,
  SuggestStrictModeParams,
} from '../../common/notifications';
import {
  GetComponentsWithTemplateFile,
  GetTcbRequest,
  GetTemplateLocationForComponent,
  IsInAngularProject,
} from '../../common/requests';
import {NodeModule, resolve, Version} from '../../common/resolver';

import {
  getInlineStylesVirtualContent,
  getInlineStylesVirtualContentAtOffset,
  getInlineStylesVirtualContentWithKeyAtOffset,
  getInlineStylesVirtualContents,
  getInlineTemplateVirtualContent,
  getSupportedDecoratorFieldAtPosition,
  isInsideStringLiteral,
  isNotTypescriptOrSupportedDecoratorField,
} from './embedded_support';
import {selectColorPresentations} from './inline_styles_support';

interface GetTcbResponse {
  uri: vscode.Uri;
  content: string;
  selections: vscode.Range[];
}

export class AngularLanguageClient implements vscode.Disposable {
  private client: lsp.LanguageClient | null = null;
  private readonly disposables: vscode.Disposable[] = [];
  private readonly sessionDisposables: vscode.Disposable[] = [];
  private readonly outputChannel: vscode.OutputChannel;
  private readonly clientOptions: lsp.LanguageClientOptions;
  private readonly name = 'Angular Language Service';
  private readonly virtualDocumentContents = new Map<string, string>();
  private readonly fileBackedStyleUriToSourceUri = new Map<string, vscode.Uri>();
  private readonly untitledStyleUriToSourceUri = new Map<string, vscode.Uri>();
  private readonly scopedUntitledStylesDocCache = new Map<string, vscode.TextDocument>();
  /** A map that indicates whether Angular could be found in the file's project. */
  private readonly fileToIsInAngularProjectMap = new Map<string, boolean>();

  constructor(private readonly context: vscode.ExtensionContext) {
    this.disposables.push(
      vscode.workspace.registerTextDocumentContentProvider('angular-embedded-content', {
        provideTextDocumentContent: (uri) => {
          return this.virtualDocumentContents.get(uri.toString());
        },
      }),
    );

    this.disposables.push(
      vscode.languages.registerColorProvider(
        [{scheme: 'file', language: 'typescript'}],
        this.createInlineStylesColorProvider(),
      ),
    );

    this.disposables.push(
      vscode.languages.registerDocumentHighlightProvider(
        [{scheme: 'file', language: 'typescript'}],
        this.createInlineStylesDocumentHighlightProvider(),
      ),
    );

    this.disposables.push(
      vscode.workspace.onDidChangeConfiguration(() => {
        this.fileToIsInAngularProjectMap.clear();
        this.traceProjectGate('cleared cache on workspace configuration change');
      }),
    );

    this.disposables.push(
      vscode.workspace.onDidChangeTextDocument((event) => {
        this.invalidateScopedUntitledStylesDocCache(event.document.uri.toString());
      }),
    );

    this.disposables.push(
      vscode.workspace.onDidCloseTextDocument((document) => {
        this.invalidateScopedUntitledStylesDocCache(document.uri.toString());
      }),
    );

    this.disposables.push(
      vscode.window.onDidChangeVisibleTextEditors((editors) => {
        void this.closeVisibleMappedUntitledEditors(editors);
      }),
    );

    const config = vscode.workspace.getConfiguration();
    const useClientSideWatching = config.get('angular.server.useClientSideFileWatcher');
    const fileEvents = [
      // Notify the server about file changes to tsconfig.json contained in the workspace
      vscode.workspace.createFileSystemWatcher('**/tsconfig.json'),
    ];
    if (useClientSideWatching) {
      fileEvents.push(vscode.workspace.createFileSystemWatcher('**/*.ts'));
      fileEvents.push(vscode.workspace.createFileSystemWatcher('**/*.html'));
      // While we don't need general JSON watching, TypeScript relies on package.json for module resolution, type acquisition, and auto-imports.
      // If we don't watch it, npm install changes or dependency updates might be missed by the Language Service
      fileEvents.push(vscode.workspace.createFileSystemWatcher('**/package.json'));
    }

    this.outputChannel = vscode.window.createOutputChannel(this.name);
    // Options to control the language client
    this.clientOptions = {
      // Register the server for Angular templates and TypeScript documents
      documentSelector: [
        // scheme: 'file' means listen to changes to files on disk only
        // other option is 'untitled', for buffer in the editor (like a new doc)
        {scheme: 'file', language: 'html'},
        {scheme: 'file', language: 'typescript'},
      ],
      synchronize: {
        fileEvents,
      },
      // Don't let our output console pop open
      revealOutputChannelOn: lsp.RevealOutputChannelOn.Never,
      outputChannel: this.outputChannel,
      markdown: {
        isTrusted: true,
      },
      middleware: {
        provideCodeActions: async (
          document: vscode.TextDocument,
          range: vscode.Range,
          context: vscode.CodeActionContext,
          token: vscode.CancellationToken,
          next: lsp.ProvideCodeActionsSignature,
        ) => {
          // Code actions can trigger also outside of `@Component(<...>)` fields.
          if (await this.isInAngularProject(document)) {
            if (this.isPositionInsideStylesField(document, range.start)) {
              const [angularCodeActions, styleCodeActions] = await Promise.all([
                next(document, range, context, token) as Promise<
                  readonly (vscode.Command | vscode.CodeAction)[] | undefined
                >,
                this.getInlineStylesCodeActions(document, range, context),
              ]);

              const merged = [...(angularCodeActions ?? []), ...(styleCodeActions ?? [])] as Array<
                vscode.Command | vscode.CodeAction
              >;
              return merged.length > 0 ? merged : undefined;
            }

            return next(document, range, context, token);
          }
        },
        prepareRename: async (
          document: vscode.TextDocument,
          position: vscode.Position,
          token: vscode.CancellationToken,
          next: lsp.PrepareRenameSignature,
        ) => {
          // We are able to provide renames for many types of string literals: template strings,
          // pipe names, and hopefully in the future selectors and input/output aliases. Because
          // TypeScript isn't able to provide renames for these, we can more or less
          // guarantee that the Angular Language service will be called for the rename as the
          // fallback. We specifically do not provide renames outside of string literals
          // because we cannot ensure our extension is prioritized for renames in TS files (see
          // https://github.com/microsoft/vscode/issues/115354) we disable renaming completely so we
          // can provide consistent expectations.
          if (
            (await this.isInAngularProject(document)) &&
            isInsideStringLiteral(document, position)
          ) {
            if (this.isPositionInsideStylesField(document, position)) {
              const [angularPrepareRename, stylePrepareRename] = await Promise.all([
                next(document, position, token),
                this.getInlineStylesPrepareRename(document, position),
              ]);
              return angularPrepareRename ?? stylePrepareRename;
            }

            return next(document, position, token);
          }
        },
        provideRenameEdits: async (
          document: vscode.TextDocument,
          position: vscode.Position,
          newName: string,
          token: vscode.CancellationToken,
          next,
        ) => {
          if (
            !(await this.isInAngularProject(document)) ||
            !isNotTypescriptOrSupportedDecoratorField(document, position)
          ) {
            return;
          }

          if (!this.isPositionInsideStylesField(document, position)) {
            return next(document, position, newName, token);
          }

          const [angularEdits, styleEdits] = await Promise.all([
            next(document, position, newName, token) as Promise<vscode.WorkspaceEdit | undefined>,
            this.getInlineStylesRenameEdits(document, position, newName),
          ]);

          if (this.hasWorkspaceEditEntries(angularEdits)) {
            return angularEdits;
          }
          return styleEdits;
        },
        provideDefinition: async (
          document: vscode.TextDocument,
          position: vscode.Position,
          token: vscode.CancellationToken,
          next: lsp.ProvideDefinitionSignature,
        ) => {
          if (
            (await this.isInAngularProject(document)) &&
            isNotTypescriptOrSupportedDecoratorField(document, position)
          ) {
            const angularDefinitionPromise = next(document, position, token) as Promise<
              vscode.Definition | vscode.DefinitionLink[] | undefined
            >;

            if (this.isPositionInsideStylesField(document, position)) {
              const [angularDefinition, styleDefinition] = await Promise.all([
                angularDefinitionPromise,
                this.getInlineStylesDefinition(document, position),
              ]);
              return this.hasDefinitionResults(angularDefinition)
                ? angularDefinition
                : styleDefinition;
            }

            return angularDefinitionPromise;
          }
        },
        provideReferences: async (
          document: vscode.TextDocument,
          position: vscode.Position,
          context: vscode.ReferenceContext,
          token: vscode.CancellationToken,
          next: lsp.ProvideReferencesSignature,
        ) => {
          if (
            (await this.isInAngularProject(document)) &&
            isNotTypescriptOrSupportedDecoratorField(document, position)
          ) {
            const angularReferencesPromise = next(document, position, context, token) as Promise<
              vscode.Location[] | undefined
            >;

            if (this.isPositionInsideStylesField(document, position)) {
              const [angularReferences, styleReferences] = await Promise.all([
                angularReferencesPromise,
                this.getInlineStylesReferences(document, position, context),
              ]);
              const selectedReferences =
                angularReferences !== undefined && angularReferences.length > 0
                  ? angularReferences
                  : styleReferences;

              return this.filterDeclarationReferencesIfNeeded(
                document,
                position,
                context.includeDeclaration,
                selectedReferences,
              );
            }

            return angularReferencesPromise;
          }
        },
        provideTypeDefinition: async (
          document: vscode.TextDocument,
          position: vscode.Position,
          token: vscode.CancellationToken,
          next,
        ) => {
          if (
            (await this.isInAngularProject(document)) &&
            isNotTypescriptOrSupportedDecoratorField(document, position)
          ) {
            return next(document, position, token);
          }
        },
        provideHover: async (
          document: vscode.TextDocument,
          position: vscode.Position,
          token: vscode.CancellationToken,
          next: lsp.ProvideHoverSignature,
        ) => {
          if (
            !(await this.isInAngularProject(document)) ||
            !isNotTypescriptOrSupportedDecoratorField(document, position)
          ) {
            return;
          }

          const angularResultsPromise = next(document, position, token);

          // Include results for inline HTML/CSS/SCSS/LESS via virtual documents and native providers.
          if (document.languageId === 'typescript') {
            const field = getSupportedDecoratorFieldAtPosition(document, position);

            if (field === 'template') {
              const vdocUri = this.createVirtualHtmlDoc(document);
              const htmlProviderResultsPromise = vscode.commands.executeCommand<vscode.Hover[]>(
                'vscode.executeHoverProvider',
                vdocUri,
                position,
              );

              const [angularResults, htmlProviderResults] = await Promise.all([
                angularResultsPromise,
                htmlProviderResultsPromise,
              ]);
              return angularResults ?? htmlProviderResults?.[0];
            }
          }

          return angularResultsPromise;
        },
        provideSignatureHelp: async (
          document: vscode.TextDocument,
          position: vscode.Position,
          context: vscode.SignatureHelpContext,
          token: vscode.CancellationToken,
          next: lsp.ProvideSignatureHelpSignature,
        ) => {
          if (
            (await this.isInAngularProject(document)) &&
            isNotTypescriptOrSupportedDecoratorField(document, position)
          ) {
            return next(document, position, context, token);
          }
        },
        provideCompletionItem: async (
          document: vscode.TextDocument,
          position: vscode.Position,
          context: vscode.CompletionContext,
          token: vscode.CancellationToken,
          next: lsp.ProvideCompletionItemsSignature,
        ) => {
          // If not in inline template, do not perform request forwarding
          if (
            !(await this.isInAngularProject(document)) ||
            !isNotTypescriptOrSupportedDecoratorField(document, position)
          ) {
            return;
          }
          const angularCompletionsPromise = next(document, position, context, token) as Promise<
            vscode.CompletionItem[] | null | undefined
          >;

          // Include results for inline HTML/CSS/SCSS/LESS via virtual documents and native providers.
          if (document.languageId === 'typescript') {
            const field = getSupportedDecoratorFieldAtPosition(document, position);

            if (field === 'template') {
              const vdocUri = this.createVirtualHtmlDoc(document);
              // This will not include Angular stuff because the vdoc is not associated with an
              // angular component.
              const htmlProviderCompletionsPromise =
                vscode.commands.executeCommand<vscode.CompletionList>(
                  'vscode.executeCompletionItemProvider',
                  vdocUri,
                  position,
                  context.triggerCharacter,
                );
              const [angularCompletions, htmlProviderCompletions] = await Promise.all([
                angularCompletionsPromise,
                htmlProviderCompletionsPromise,
              ]);
              return this.normalizeCompletionItems([
                ...(angularCompletions ?? []),
                ...(htmlProviderCompletions?.items ?? []),
              ]);
            }
          }

          const angularCompletions = await angularCompletionsPromise;
          return this.normalizeCompletionItems(angularCompletions);
        },
        resolveCompletionItem: async (
          item: vscode.CompletionItem,
          token: vscode.CancellationToken,
          next,
        ) => {
          const resolved = await next(item, token);
          return this.normalizeCompletionItem(resolved ?? item);
        },
        provideDocumentSymbols: async (
          document: vscode.TextDocument,
          token: vscode.CancellationToken,
          next: lsp.ProvideDocumentSymbolsSignature,
        ) => {
          if (!(await this.isInAngularProject(document))) {
            return;
          }

          const angularSymbolsPromise = next(document, token) as Promise<
            vscode.DocumentSymbol[] | vscode.SymbolInformation[] | null | undefined
          >;

          if (document.languageId !== 'typescript') {
            return angularSymbolsPromise;
          }

          const styleVdocUris = this.createVirtualStylesDocs(document);
          const styleSymbolsPromise = Promise.all(
            styleVdocUris.map((uri) =>
              vscode.commands.executeCommand<vscode.DocumentSymbol[] | vscode.SymbolInformation[]>(
                'vscode.executeDocumentSymbolProvider',
                uri,
              ),
            ),
          );

          const [angularSymbols, styleSymbols] = await Promise.all([
            angularSymbolsPromise,
            styleSymbolsPromise,
          ]);

          return this.mergeDocumentSymbolsWithInlineStyles(document, angularSymbols, styleSymbols);
        },
        provideFoldingRanges: async (
          document: vscode.TextDocument,
          context: vscode.FoldingContext,
          token: vscode.CancellationToken,
          next,
        ) => {
          if (!(await this.isInAngularProject(document))) {
            return null;
          }
          return next(document, context, token);
        },
        provideLinkedEditingRange: async (
          document: vscode.TextDocument,
          position: vscode.Position,
          token: vscode.CancellationToken,
          next: lsp.ProvideLinkedEditingRangeSignature,
        ) => {
          if (
            (await this.isInAngularProject(document)) &&
            isNotTypescriptOrSupportedDecoratorField(document, position)
          ) {
            return next(document, position, token);
          }
        },
        provideSelectionRanges: async (
          document: vscode.TextDocument,
          positions: readonly vscode.Position[],
          token: vscode.CancellationToken,
          next,
        ) => {
          if (!(await this.isInAngularProject(document))) {
            return;
          }

          if (document.languageId === 'typescript') {
            const allInStyles =
              positions.length > 0 &&
              positions.every((position) => {
                return this.isPositionInsideStylesField(document, position);
              });

            if (allInStyles) {
              const styleSelectionRanges = await this.getInlineStylesSelectionRanges(
                document,
                positions,
              );

              if (Array.isArray(styleSelectionRanges) && styleSelectionRanges.length > 0) {
                return styleSelectionRanges;
              }
            }
          }

          return next(document, positions, token);
        },
        provideDocumentHighlights: async (
          document: vscode.TextDocument,
          position: vscode.Position,
          token: vscode.CancellationToken,
          next,
        ) => {
          if (
            !(await this.isInAngularProject(document)) ||
            !isNotTypescriptOrSupportedDecoratorField(document, position)
          ) {
            return;
          }

          const angularHighlightsPromise = next(document, position, token) as Promise<
            vscode.DocumentHighlight[] | undefined
          >;

          if (!this.isPositionInsideStylesField(document, position)) {
            return angularHighlightsPromise;
          }

          const [angularHighlights, styleHighlights] = await Promise.all([
            angularHighlightsPromise,
            this.getInlineStylesDocumentHighlights(document, position),
          ]);

          return angularHighlights && angularHighlights.length > 0
            ? angularHighlights
            : styleHighlights;
        },
      },
    };
  }

  async applyWorkspaceEdits(workspaceEdits: lsp.WorkspaceEdit[]) {
    for (const edit of workspaceEdits) {
      const workspaceEdit = await this.client?.protocol2CodeConverter.asWorkspaceEdit(edit);
      if (workspaceEdit === undefined) {
        continue;
      }
      await vscode.workspace.applyEdit(workspaceEdit);
    }
  }

  private async isInAngularProject(doc: vscode.TextDocument): Promise<boolean> {
    if (this.client === null) {
      return false;
    }
    const uri = doc.uri.toString();
    if (this.fileToIsInAngularProjectMap.has(uri)) {
      this.traceProjectGate(`cache hit=true: ${uri}`);
      return this.fileToIsInAngularProjectMap.get(uri)!;
    }

    try {
      const response = await this.client.sendRequest(IsInAngularProject, {
        textDocument: this.client.code2ProtocolConverter.asTextDocumentIdentifier(doc),
      });
      if (response == null) {
        // If the response indicates the answer can't be determined at the moment, return `false`
        // but do not cache the result so we can try to get the real answer on follow-up requests.
        this.traceProjectGate(`response=null (transient false): ${uri}`);
        return false;
      }
      // Cache only positive hits. A negative response can be transient while the
      // project service is still loading, especially after server restarts.
      if (response) {
        this.fileToIsInAngularProjectMap.set(uri, true);
        this.traceProjectGate(`response=true (cached): ${uri}`);
      } else {
        this.traceProjectGate(`response=false (not cached): ${uri}`);
      }
      return response;
    } catch {
      this.traceProjectGate(`request failed: ${uri}`);
      return false;
    }
  }

  private createVirtualHtmlDoc(document: vscode.TextDocument): vscode.Uri {
    const originalUri = document.uri.toString();
    const vdocUri = vscode.Uri.file(encodeURIComponent(originalUri) + '.html').with({
      scheme: 'angular-embedded-content',
      authority: 'html',
    });
    this.virtualDocumentContents.set(
      vdocUri.toString(),
      getInlineTemplateVirtualContent(document.getText()),
    );
    return vdocUri;
  }

  private createVirtualStylesDoc(document: vscode.TextDocument, suffix = 'styles'): vscode.Uri {
    const originalUri = document.uri.toString();
    const vdocUri = vscode.Uri.file(encodeURIComponent(originalUri) + `.${suffix}.scss`).with({
      scheme: 'angular-embedded-content',
      authority: 'scss',
    });
    this.virtualDocumentContents.set(
      vdocUri.toString(),
      getInlineStylesVirtualContent(document.getText()),
    );
    return vdocUri;
  }

  private createVirtualStylesDocForPosition(
    document: vscode.TextDocument,
    position: vscode.Position,
    suffix = 'styles-pos',
  ): vscode.Uri {
    const originalUri = document.uri.toString();
    const offset = document.offsetAt(position);
    const scopedContent = getInlineStylesVirtualContentAtOffset(document.getText(), offset);
    const content = scopedContent ?? getInlineStylesVirtualContent(document.getText());
    const vdocUri = vscode.Uri.file(encodeURIComponent(originalUri) + `.${suffix}.scss`).with({
      scheme: 'angular-embedded-content',
      authority: 'scss',
    });
    this.virtualDocumentContents.set(vdocUri.toString(), content);
    return vdocUri;
  }

  private createVirtualStylesDocs(document: vscode.TextDocument): vscode.Uri[] {
    const originalUri = document.uri.toString();
    const contents = getInlineStylesVirtualContents(document.getText());
    return contents.map((content, index) => {
      const vdocUri = vscode.Uri.file(
        encodeURIComponent(originalUri) + `.styles-${index}.scss`,
      ).with({
        scheme: 'angular-embedded-content',
        authority: 'scss',
      });
      this.virtualDocumentContents.set(vdocUri.toString(), content);
      return vdocUri;
    });
  }

  private async openVirtualStylesDocument(
    document: vscode.TextDocument,
    suffix = 'styles',
  ): Promise<vscode.TextDocument> {
    const content = getInlineStylesVirtualContent(document.getText());
    const uri = this.writeInlineStylesScratchFile(document.uri, suffix, content);
    return vscode.workspace.openTextDocument(uri);
  }

  private async openVirtualStylesDocumentForPosition(
    document: vscode.TextDocument,
    position: vscode.Position,
    suffix = 'styles-pos',
  ): Promise<vscode.TextDocument> {
    const offset = document.offsetAt(position);
    const scopedContent = getInlineStylesVirtualContentAtOffset(document.getText(), offset);
    const content = scopedContent ?? getInlineStylesVirtualContent(document.getText());
    const uri = this.writeInlineStylesScratchFile(document.uri, suffix, content);
    return vscode.workspace.openTextDocument(uri);
  }

  private writeInlineStylesScratchFile(
    sourceUri: vscode.Uri,
    suffix: string,
    content: string,
  ): vscode.Uri {
    const sourceDir = path.dirname(sourceUri.fsPath);
    const inlineStylesDir = path.join(sourceDir, '.ng-inline-styles');
    fs.mkdirSync(inlineStylesDir, {recursive: true});

    const key = `${sourceUri.toString()}|${suffix}`;
    const hash = crypto.createHash('sha1').update(key).digest('hex').slice(0, 16);
    const safeName = `${hash}.${suffix}.scss`;
    const filePath = path.join(inlineStylesDir, safeName);
    fs.writeFileSync(filePath, content, 'utf8');

    const uri = vscode.Uri.file(filePath);
    this.fileBackedStyleUriToSourceUri.set(uri.toString(), sourceUri);
    return uri;
  }

  private async openScopedUntitledStylesDocumentForPosition(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): Promise<vscode.TextDocument> {
    const sourceUri = document.uri.toString();
    const scoped = getInlineStylesVirtualContentWithKeyAtOffset(
      document.getText(),
      document.offsetAt(position),
    );
    const cacheKey = `${sourceUri}|${scoped?.key ?? 'all'}`;
    const cached = this.scopedUntitledStylesDocCache.get(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    const content = scoped?.content ?? getInlineStylesVirtualContent(document.getText());
    const vdoc = await vscode.workspace.openTextDocument({
      language: 'scss',
      content,
    });
    this.untitledStyleUriToSourceUri.set(vdoc.uri.toString(), document.uri);
    this.scopedUntitledStylesDocCache.set(cacheKey, vdoc);
    return vdoc;
  }

  private invalidateScopedUntitledStylesDocCache(sourceUri: string): void {
    for (const key of [...this.scopedUntitledStylesDocCache.keys()]) {
      if (key.startsWith(`${sourceUri}|`)) {
        this.scopedUntitledStylesDocCache.delete(key);
      }
    }
  }

  private createInlineStylesColorProvider(): vscode.DocumentColorProvider {
    return {
      provideDocumentColors: async (document: vscode.TextDocument) => {
        if (document.languageId !== 'typescript') {
          return [];
        }

        if (!this.hasInlineStylesContent(document)) {
          return [];
        }

        const inlineColors = await this.getDocumentColorsForInlineStyles(document);
        return inlineColors.filter((colorInfo) =>
          this.isPositionInsideStylesField(document, colorInfo.range.start),
        );
      },
      provideColorPresentations: async (
        color: vscode.Color,
        context: {document: vscode.TextDocument; range: vscode.Range},
      ) => {
        const document = context.document;
        if (document.languageId !== 'typescript') {
          return [];
        }
        if (!this.isPositionInsideStylesField(document, context.range.start)) {
          return [];
        }

        const presentations = await this.getColorPresentationsForInlineStyles(
          document,
          color,
          context.range,
        );
        return selectColorPresentations(presentations, color, context.range);
      },
    };
  }

  private createInlineStylesDocumentHighlightProvider(): vscode.DocumentHighlightProvider {
    return {
      provideDocumentHighlights: async (
        document: vscode.TextDocument,
        position: vscode.Position,
      ): Promise<vscode.DocumentHighlight[]> => {
        if (document.languageId !== 'typescript') {
          return [];
        }

        if (!(await this.isInAngularProject(document))) {
          return [];
        }

        if (!this.isPositionInsideStylesField(document, position)) {
          return [];
        }

        return (await this.getInlineStylesDocumentHighlights(document, position)) ?? [];
      },
    };
  }

  private isPositionInsideStylesField(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): boolean {
    return getSupportedDecoratorFieldAtPosition(document, position) === 'styles';
  }

  private async getInlineStylesDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): Promise<vscode.Definition | vscode.DefinitionLink[] | undefined> {
    const vdoc = await this.openVirtualStylesDocumentForPosition(document, position, 'styles-def');
    const styleDefinition = await vscode.commands.executeCommand<
      vscode.Definition | vscode.DefinitionLink[]
    >('vscode.executeDefinitionProvider', vdoc.uri, position);
    return this.remapDefinitionFromVirtualToSource(styleDefinition);
  }

  private async getInlineStylesReferences(
    document: vscode.TextDocument,
    position: vscode.Position,
    context: vscode.ReferenceContext,
  ): Promise<vscode.Location[] | undefined> {
    const vdoc = await this.openVirtualStylesDocumentForPosition(document, position, 'styles-ref');
    const references = await vscode.commands.executeCommand<vscode.Location[]>(
      'vscode.executeReferenceProvider',
      vdoc.uri,
      position,
      context,
    );
    const remappedReferences = this.remapLocationsFromVirtualToSource(references ?? undefined);

    if (
      context.includeDeclaration ||
      remappedReferences === undefined ||
      remappedReferences.length === 0
    ) {
      return remappedReferences;
    }

    const definition = await this.getInlineStylesDefinition(document, position);
    const declarationLocations = this.definitionToLocations(definition);
    if (declarationLocations.length === 0) {
      return remappedReferences;
    }

    return remappedReferences.filter(
      (reference) =>
        !declarationLocations.some((declaration) => this.locationsEqual(reference, declaration)),
    );
  }

  private async filterDeclarationReferencesIfNeeded(
    document: vscode.TextDocument,
    position: vscode.Position,
    includeDeclaration: boolean,
    references: vscode.Location[] | undefined,
  ): Promise<vscode.Location[] | undefined> {
    if (includeDeclaration || references === undefined || references.length === 0) {
      return references;
    }

    const definition = await this.getInlineStylesDefinition(document, position);
    const declarationLocations = this.definitionToLocations(definition);
    if (declarationLocations.length === 0) {
      return references;
    }

    return references.filter(
      (reference) =>
        !declarationLocations.some((declaration) => this.locationsEqual(reference, declaration)),
    );
  }

  private definitionToLocations(
    definition: vscode.Definition | vscode.DefinitionLink[] | undefined,
  ): vscode.Location[] {
    if (definition === undefined) {
      return [];
    }

    if (definition instanceof vscode.Location) {
      return [definition];
    }

    if (!Array.isArray(definition)) {
      return [];
    }

    if (definition.length === 0) {
      return [];
    }

    if (this.isDefinitionLink(definition[0])) {
      return (definition as vscode.DefinitionLink[]).map(
        (link) => new vscode.Location(link.targetUri, link.targetRange),
      );
    }

    return definition as vscode.Location[];
  }

  private locationsEqual(left: vscode.Location, right: vscode.Location): boolean {
    return (
      left.uri.toString() === right.uri.toString() && left.range.start.isEqual(right.range.start)
    );
  }

  private hasDefinitionResults(
    definition: vscode.Definition | vscode.DefinitionLink[] | undefined,
  ): boolean {
    if (definition === undefined) {
      return false;
    }
    if (Array.isArray(definition)) {
      return definition.length > 0;
    }
    return true;
  }

  private hasWorkspaceEditEntries(edit: vscode.WorkspaceEdit | undefined): boolean {
    return edit !== undefined && edit.entries().length > 0;
  }

  private normalizeCompletionItems(
    items: vscode.CompletionItem[] | null | undefined,
  ): vscode.CompletionItem[] | null | undefined {
    if (items === undefined || items === null) {
      return items;
    }

    return items.map((item) => this.normalizeCompletionItem(item));
  }

  private normalizeCompletionItem(item: vscode.CompletionItem): vscode.CompletionItem {
    const normalizedDocumentation = this.normalizeCompletionDocumentation(item.documentation);
    if (normalizedDocumentation === item.documentation) {
      return item;
    }

    return {
      ...item,
      documentation: normalizedDocumentation,
    };
  }

  private normalizeCompletionDocumentation(
    documentation: vscode.CompletionItem['documentation'],
  ): vscode.CompletionItem['documentation'] {
    if (
      documentation === undefined ||
      typeof documentation === 'string' ||
      documentation instanceof vscode.MarkdownString
    ) {
      return documentation;
    }

    const value = (documentation as unknown as {value?: unknown}).value;
    return typeof value === 'string' ? new vscode.MarkdownString(value) : undefined;
  }

  private async getInlineStylesSelectionRanges(
    document: vscode.TextDocument,
    positions: readonly vscode.Position[],
  ): Promise<vscode.SelectionRange[] | undefined> {
    const basePosition = positions[0] ?? new vscode.Position(0, 0);
    const vdoc = await this.openVirtualStylesDocumentForPosition(
      document,
      basePosition,
      'styles-sel',
    );
    const styleSelectionRanges = await vscode.commands.executeCommand<vscode.SelectionRange[]>(
      'vscode.executeSelectionRangeProvider',
      vdoc.uri,
      [...positions],
    );
    return styleSelectionRanges ?? undefined;
  }

  private async getInlineStylesDocumentHighlights(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): Promise<vscode.DocumentHighlight[] | undefined> {
    const vdoc = await this.openVirtualStylesDocumentForPosition(
      document,
      position,
      'styles-highlight',
    );
    const highlights = await vscode.commands.executeCommand<vscode.DocumentHighlight[]>(
      'vscode.executeDocumentHighlights',
      vdoc.uri,
      position,
    );

    if (highlights !== undefined && highlights.length > 0) {
      return highlights;
    }

    const scopedStylesDoc = await this.openVirtualStylesDocumentForPosition(
      document,
      position,
      'styles-highlight-ref',
    );

    const references = await vscode.commands.executeCommand<vscode.Location[]>(
      'vscode.executeReferenceProvider',
      scopedStylesDoc.uri,
      position,
      {
        includeDeclaration: true,
      },
    );
    const remapped = this.remapLocationsFromVirtualToSource(references ?? undefined);
    if (remapped === undefined || remapped.length === 0) {
      return undefined;
    }

    const sourceUri = document.uri.toString();
    const sourceRanges = remapped.filter((location) => location.uri.toString() === sourceUri);
    if (sourceRanges.length === 0) {
      return undefined;
    }

    return sourceRanges.map((location) => ({
      range: location.range,
      kind: vscode.DocumentHighlightKind.Read,
    }));
  }

  private async getInlineStylesCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range,
    context: vscode.CodeActionContext,
  ): Promise<Array<vscode.Command | vscode.CodeAction> | undefined> {
    const vdoc = await this.openScopedUntitledStylesDocumentForPosition(document, range.start);
    const actions = await vscode.commands.executeCommand<Array<vscode.Command | vscode.CodeAction>>(
      'vscode.executeCodeActionProvider',
      vdoc.uri,
      range,
      context.only?.value,
    );
    return this.remapCodeActionsFromVirtualToSource(actions ?? undefined);
  }

  private async closeVisibleMappedUntitledEditors(
    editors: readonly vscode.TextEditor[],
  ): Promise<void> {
    const targetUris = new Set(
      editors
        .map((editor) => editor.document.uri)
        .filter((uri) => this.untitledStyleUriToSourceUri.has(uri.toString()))
        .map((uri) => uri.toString()),
    );

    if (targetUris.size === 0) {
      return;
    }

    const tabs = vscode.window.tabGroups.all.flatMap((group) => group.tabs);
    for (const tab of tabs) {
      const tabUri = this.getTabInputUri(tab.input);
      if (tabUri !== null && targetUris.has(tabUri.toString())) {
        await vscode.window.tabGroups.close(tab);
      }
    }
  }

  private getTabInputUri(input: unknown): vscode.Uri | null {
    if (input instanceof vscode.TabInputText) {
      return input.uri;
    }
    return null;
  }

  private async getInlineStylesPrepareRename(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): Promise<vscode.Range | {range: vscode.Range; placeholder: string} | undefined> {
    const vdoc = await this.openVirtualStylesDocumentForPosition(
      document,
      position,
      'styles-prepare-rename',
    );
    const prepareRename = await vscode.commands.executeCommand<
      vscode.Range | {range: vscode.Range; placeholder: string}
    >('vscode.prepareRename', vdoc.uri, position);
    return prepareRename ?? undefined;
  }

  private async getInlineStylesRenameEdits(
    document: vscode.TextDocument,
    position: vscode.Position,
    newName: string,
  ): Promise<vscode.WorkspaceEdit | undefined> {
    const vdoc = await this.openVirtualStylesDocumentForPosition(
      document,
      position,
      'styles-rename',
    );
    const renameEdits = await vscode.commands.executeCommand<vscode.WorkspaceEdit>(
      'vscode.executeDocumentRenameProvider',
      vdoc.uri,
      position,
      newName,
    );
    return this.remapWorkspaceEditFromVirtualToSource(renameEdits ?? undefined);
  }

  private async getDocumentColorsForUri(uri: vscode.Uri): Promise<vscode.ColorInformation[]> {
    try {
      return (
        (await vscode.commands.executeCommand<vscode.ColorInformation[]>(
          'vscode.executeDocumentColorProvider',
          uri,
        )) ?? []
      );
    } catch {
      return [];
    }
  }

  private async getDocumentColorsForInlineStyles(
    document: vscode.TextDocument,
  ): Promise<vscode.ColorInformation[]> {
    const inlineStylesDoc = await this.openVirtualStylesDocument(document, 'styles-colors');
    return this.getDocumentColorsForUri(inlineStylesDoc.uri);
  }

  private async getColorPresentationsForDocument(
    document: vscode.TextDocument,
    color: vscode.Color,
    range: vscode.Range,
  ): Promise<vscode.ColorPresentation[]> {
    try {
      return (
        (await vscode.commands.executeCommand<vscode.ColorPresentation[]>(
          'vscode.executeColorPresentationProvider',
          color,
          {document, range},
        )) ?? []
      );
    } catch {
      return [];
    }
  }

  private async getColorPresentationsForInlineStyles(
    document: vscode.TextDocument,
    color: vscode.Color,
    range: vscode.Range,
  ): Promise<vscode.ColorPresentation[]> {
    const inlineStylesDoc = await this.openVirtualStylesDocument(
      document,
      'styles-color-presentation',
    );
    return this.getColorPresentationsForDocument(inlineStylesDoc, color, range);
  }

  private hasInlineStylesContent(document: vscode.TextDocument): boolean {
    return /\S/.test(getInlineStylesVirtualContent(document.getText()));
  }

  private traceProjectGate(message: string): void {
    this.outputChannel.appendLine(`[project-gate] ${message}`);
  }

  private remapDefinitionFromVirtualToSource(
    definition: vscode.Definition | vscode.DefinitionLink[] | undefined,
  ): vscode.Definition | vscode.DefinitionLink[] | undefined {
    if (definition === undefined) {
      return undefined;
    }

    if (definition instanceof vscode.Location) {
      const sourceUri = this.getSourceUriFromVirtualUri(definition.uri);
      if (sourceUri === null) {
        return definition;
      }
      return new vscode.Location(sourceUri, definition.range);
    }

    if (Array.isArray(definition)) {
      if (definition.length === 0) {
        return definition;
      }

      if (this.isDefinitionLink(definition[0])) {
        const links = definition as vscode.DefinitionLink[];
        return links.map((item) => {
          const sourceUri = this.getSourceUriFromVirtualUri(item.targetUri);
          return sourceUri === null ? item : {...item, targetUri: sourceUri};
        });
      }

      const locations = definition as vscode.Location[];
      return locations.map((item) => {
        const sourceUri = this.getSourceUriFromVirtualUri(item.uri);
        return sourceUri === null ? item : new vscode.Location(sourceUri, item.range);
      });
    }

    return definition;
  }

  private remapLocationsFromVirtualToSource(
    locations: vscode.Location[] | undefined,
  ): vscode.Location[] | undefined {
    if (locations === undefined) {
      return undefined;
    }
    return locations.map((location) => {
      const sourceUri = this.getSourceUriFromVirtualUri(location.uri);
      return sourceUri === null ? location : new vscode.Location(sourceUri, location.range);
    });
  }

  private remapCodeActionsFromVirtualToSource(
    actions: Array<vscode.Command | vscode.CodeAction> | undefined,
  ): Array<vscode.Command | vscode.CodeAction> | undefined {
    if (actions === undefined) {
      return undefined;
    }

    return actions.map((action) => {
      if (!('edit' in action)) {
        return action;
      }

      const remappedEdit = this.remapWorkspaceEditFromVirtualToSource(action.edit ?? undefined);
      if (remappedEdit === action.edit) {
        return action;
      }

      return {
        ...action,
        edit: remappedEdit,
      };
    });
  }

  private remapWorkspaceEditFromVirtualToSource(
    workspaceEdit: vscode.WorkspaceEdit | undefined,
  ): vscode.WorkspaceEdit | undefined {
    if (workspaceEdit === undefined) {
      return undefined;
    }

    const remapped = new vscode.WorkspaceEdit();
    for (const [uri, edits] of workspaceEdit.entries()) {
      const sourceUri = this.getSourceUriFromVirtualUri(uri) ?? uri;
      const existing = remapped.get(sourceUri) ?? [];
      remapped.set(sourceUri, [
        ...existing,
        ...edits.map((edit) =>
          edit instanceof vscode.SnippetTextEdit
            ? vscode.SnippetTextEdit.replace(edit.range, edit.snippet)
            : vscode.TextEdit.replace(edit.range, edit.newText),
        ),
      ]);
    }
    return remapped;
  }

  private getSourceUriFromVirtualUri(uri: vscode.Uri): vscode.Uri | null {
    const sourceFromUntitled = this.untitledStyleUriToSourceUri.get(uri.toString());
    if (sourceFromUntitled !== undefined) {
      return sourceFromUntitled;
    }

    const sourceFromFileBacked = this.fileBackedStyleUriToSourceUri.get(uri.toString());
    if (sourceFromFileBacked !== undefined) {
      return sourceFromFileBacked;
    }

    if (uri.scheme !== 'angular-embedded-content') {
      return null;
    }

    const fileName = uri.path.split('/').pop();
    if (!fileName) {
      return null;
    }

    const extension = path.extname(fileName);
    let encodedSourceUri = extension ? fileName.slice(0, -extension.length) : fileName;
    // Strip generated embedded-document suffixes to recover the original encoded source URI.
    encodedSourceUri = encodedSourceUri.replace(/\.styles(?:-[^.]*)?$/, '');
    encodedSourceUri = encodedSourceUri.replace(/\.html$/, '');
    try {
      return vscode.Uri.parse(decodeURIComponent(encodedSourceUri));
    } catch {
      return null;
    }
  }

  private isDefinitionLink(
    value: vscode.Location | vscode.DefinitionLink,
  ): value is vscode.DefinitionLink {
    return 'targetUri' in value;
  }

  private mergeDocumentSymbolsWithInlineStyles(
    document: vscode.TextDocument,
    angularSymbols: vscode.DocumentSymbol[] | vscode.SymbolInformation[] | null | undefined,
    styleSymbolGroups:
      | Array<vscode.DocumentSymbol[] | vscode.SymbolInformation[] | null | undefined>
      | null
      | undefined,
  ): vscode.DocumentSymbol[] | vscode.SymbolInformation[] | undefined {
    const documentSymbolGroups = (styleSymbolGroups ?? []).filter(
      (group): group is vscode.DocumentSymbol[] =>
        this.isDocumentSymbolArray(group) && group.length > 0,
    );

    if (documentSymbolGroups.length === 0) {
      return angularSymbols ?? undefined;
    }

    if (this.isDocumentSymbolArray(angularSymbols)) {
      this.attachStylesToOwningSymbols(angularSymbols, documentSymbolGroups);
      return angularSymbols;
    }

    const fallbackRange = new vscode.Range(document.positionAt(0), document.positionAt(0));
    return documentSymbolGroups.map((group) => {
      const firstRange = group[0]?.range ?? fallbackRange;
      const firstSelectionRange = group[0]?.selectionRange ?? fallbackRange;
      return {
        name: '(styles)',
        detail: '',
        kind: vscode.SymbolKind.Namespace,
        range: firstRange,
        selectionRange: firstSelectionRange,
        children: group,
        tags: [],
      };
    });
  }

  private isDocumentSymbolArray(
    symbols: vscode.DocumentSymbol[] | vscode.SymbolInformation[] | null | undefined,
  ): symbols is vscode.DocumentSymbol[] {
    return Array.isArray(symbols) && (symbols.length === 0 || 'children' in symbols[0]);
  }

  private attachStylesToOwningSymbols(
    angularSymbols: vscode.DocumentSymbol[],
    styleSymbolGroups: vscode.DocumentSymbol[][],
  ): void {
    for (const styleSymbols of styleSymbolGroups) {
      const firstStyleSymbol = styleSymbols[0];
      const owner =
        this.findOwningSymbol(angularSymbols, firstStyleSymbol.range) ??
        this.findFirstClassSymbol(angularSymbols);
      if (owner === null) {
        continue;
      }

      if (!owner.children) {
        owner.children = [];
      }

      const stylesContainer: vscode.DocumentSymbol = {
        name: '(styles)',
        detail: '',
        kind: vscode.SymbolKind.Namespace,
        range: firstStyleSymbol.range,
        selectionRange: firstStyleSymbol.selectionRange,
        children: styleSymbols,
        tags: [],
      };

      owner.children.push(stylesContainer);
    }
  }

  private findFirstClassSymbol(symbols: vscode.DocumentSymbol[]): vscode.DocumentSymbol | null {
    const stack = [...symbols];

    while (stack.length > 0) {
      const symbol = stack.pop()!;
      if (symbol.kind === vscode.SymbolKind.Class) {
        return symbol;
      }
      stack.push(...(symbol.children ?? []));
    }

    return null;
  }

  private findOwningSymbol(
    symbols: vscode.DocumentSymbol[],
    range: vscode.Range,
  ): vscode.DocumentSymbol | null {
    let best: vscode.DocumentSymbol | null = null;

    const visit = (symbol: vscode.DocumentSymbol): void => {
      if (!this.rangeContains(symbol.range, range)) {
        return;
      }

      if (best === null || this.rangeContains(best.range, symbol.range)) {
        best = symbol;
      }

      for (const child of symbol.children ?? []) {
        visit(child);
      }
    };

    for (const symbol of symbols) {
      visit(symbol);
    }

    return best;
  }

  private rangeContains(container: vscode.Range, content: vscode.Range): boolean {
    return !container.start.isAfter(content.start) && !container.end.isBefore(content.end);
  }

  /**
   * Spin up the language server in a separate process and establish a connection.
   */
  async start(): Promise<void> {
    if (this.client !== null) {
      throw new Error(`An existing client is running. Call stop() first.`);
    }

    // Node module for the language server
    const args = await this.constructArgs();
    const prodBundle = this.context.asAbsolutePath('server');
    const devBundle = this.context.asAbsolutePath(
      path.join('bazel-bin', 'server', 'src', 'server.js'),
    );

    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    const serverOptions: lsp.ServerOptions = {
      run: {
        module: this.context.asAbsolutePath('server'),
        transport: lsp.TransportKind.ipc,
        args,
      },
      debug: {
        // VS Code Insider launches extensions in debug mode by default but users
        // install prod bundle so we have to check whether dev bundle exists.
        module: fs.existsSync(devBundle) ? devBundle : prodBundle,
        transport: lsp.TransportKind.ipc,
        options: {
          // Argv options for Node.js
          execArgv: [
            // do not lazily evaluate the code so all breakpoints are respected
            '--nolazy',
            // If debugging port is changed, update .vscode/launch.json as well
            '--inspect-brk=6009',
          ],
          env: {
            NG_DEBUG: true,
          },
        },
        args,
      },
    };

    if (!extensionVersionCompatibleWithAllProjects(serverOptions.run.module)) {
      vscode.window.showWarningMessage(
        `A project in the workspace is using a newer version of Angular than the language service extension. ` +
          `This may cause the extension to show incorrect diagnostics.`,
      );
    }

    // Create the language client and start the client.
    const forceDebug = process.env['NG_DEBUG'] === 'true';
    this.client = new lsp.LanguageClient(
      // This is the ID for Angular-specific configurations, like "angular.log".
      // See contributes.configuration in package.json.
      'angular',
      this.name,
      serverOptions,
      this.clientOptions,
      forceDebug,
    );
    await this.client.start();
    this.outputChannel.appendLine('[project-gate] diagnostics marker: project-gate-v1');
    // Must wait for the client to be ready before registering notification
    // handlers.
    this.sessionDisposables.push(
      registerNotificationHandlers(this.client, () => {
        this.fileToIsInAngularProjectMap.clear();
        this.traceProjectGate('cleared cache on project loading notification');
      }),
    );
  }

  /**
   * Construct the arguments that's used to spawn the server process.
   * @param ctx vscode extension context
   */
  private async constructArgs(): Promise<string[]> {
    const config = vscode.workspace.getConfiguration();
    const args: string[] = ['--logToConsole'];

    const ngLog: string = config.get('angular.log', 'off');
    if (ngLog !== 'off') {
      // Log file does not yet exist on disk. It is up to the server to create the file.
      const logFile = path.join(this.context.logUri.fsPath, 'nglangsvc.log');
      args.push('--logFile', logFile);
      args.push('--logVerbosity', ngLog);
    }

    const ngProbeLocations = getProbeLocations(this.context.extensionPath);
    args.push('--ngProbeLocations', ngProbeLocations.join(','));

    const includeAutomaticOptionalChainCompletions = config.get<boolean>(
      'angular.suggest.includeAutomaticOptionalChainCompletions',
    );
    if (includeAutomaticOptionalChainCompletions) {
      args.push('--includeAutomaticOptionalChainCompletions');
    }

    const includeCompletionsWithSnippetText = config.get<boolean>(
      'angular.suggest.includeCompletionsWithSnippetText',
    );
    if (includeCompletionsWithSnippetText) {
      args.push('--includeCompletionsWithSnippetText');
    }

    const includeCompletionsForModuleExports = config.get<boolean>('angular.suggest.autoImports');
    args.push(
      '--includeCompletionsForModuleExports',
      includeCompletionsForModuleExports === undefined
        ? 'true'
        : includeCompletionsForModuleExports.toString(),
    );

    // Sort the versions from oldest to newest.
    const angularVersions = (await getAngularVersionsInWorkspace(this.outputChannel)).sort(
      (a, b) => (a.version.greaterThanOrEqual(b.version) ? 1 : -1),
    );

    // Only disable block syntax if we find angular/core and every one we find does not support
    // block syntax
    if (angularVersions.length > 0) {
      const disableBlocks = angularVersions.every((v) => v.version.major < 17);
      const disableLet = angularVersions.every((v) => {
        return v.version.major < 18 || (v.version.major === 18 && v.version.minor < 1);
      });

      if (disableBlocks) {
        args.push('--disableBlockSyntax');
        this.outputChannel.appendLine(
          `All workspace roots are using versions of Angular that do not support control flow block syntax.` +
            ` Block syntax parsing in templates will be disabled.`,
        );
      }

      if (disableLet) {
        args.push('--disableLetSyntax');
        this.outputChannel.appendLine(
          `All workspace roots are using versions of Angular that do not support @let syntax.` +
            ` @let syntax parsing in templates will be disabled.`,
        );
      }
    }

    setAngularVersionAndShowMultipleVersionsWarning(angularVersions, args, this.outputChannel);

    const forceStrictTemplates = config.get<boolean>('angular.forceStrictTemplates');
    if (forceStrictTemplates) {
      args.push('--forceStrictTemplates');
    }

    const suppressAngularDiagnosticCodes = config.get<string>(
      'angular.suppressAngularDiagnosticCodes',
    );
    if (suppressAngularDiagnosticCodes) {
      args.push('--suppressAngularDiagnosticCodes', suppressAngularDiagnosticCodes);
    }

    // Note: Document symbols settings (angular.documentSymbols.enabled,
    // angular.documentSymbols.showImplicitForVariables) are now fetched
    // dynamically via workspace/configuration request by the server.
    // This allows users to change these settings without restarting.

    const tsdk = config.get('typescript.tsdk', '');
    if (tsdk.trim().length > 0) {
      args.push('--tsdk', tsdk);
    }
    const tsProbeLocations = [...getProbeLocations(this.context.extensionPath)];
    args.push('--tsProbeLocations', tsProbeLocations.join(','));

    const supportClientSide = config.get('angular.server.useClientSideFileWatcher');

    if (supportClientSide) {
      args.push('--useClientSideFileWatcher');
    }

    return args;
  }

  /**
   * Kill the language client and perform some clean ups.
   */
  async stop(): Promise<void> {
    if (this.client === null) {
      return;
    }
    await this.client.stop();
    this.outputChannel.clear();
    this.disposeSessionDisposables();
    this.client = null;
    this.fileToIsInAngularProjectMap.clear();
    this.traceProjectGate('cleared cache on client stop');
    this.virtualDocumentContents.clear();
  }

  /**
   * Requests a template typecheck block at the current cursor location in the
   * specified editor.
   */
  async getTcbUnderCursor(textEditor: vscode.TextEditor): Promise<GetTcbResponse | undefined> {
    if (this.client === null) {
      return undefined;
    }
    const c2pConverter = this.client.code2ProtocolConverter;
    // Craft a request by converting vscode params to LSP. The corresponding
    // response is in LSP.
    const response = await this.client.sendRequest(GetTcbRequest, {
      textDocument: c2pConverter.asTextDocumentIdentifier(textEditor.document),
      position: c2pConverter.asPosition(textEditor.selection.active),
    });
    if (response === null) {
      return undefined;
    }
    const p2cConverter = this.client.protocol2CodeConverter;
    // Convert the response from LSP back to vscode.
    return {
      uri: p2cConverter.asUri(response.uri),
      content: response.content,
      selections: await p2cConverter.asRanges(response.selections),
    };
  }

  get initializeResult(): lsp.InitializeResult | undefined {
    return this.client?.initializeResult;
  }

  async getComponentsForOpenExternalTemplate(
    textEditor: vscode.TextEditor,
  ): Promise<vscode.Location[] | undefined> {
    if (this.client === null) {
      return undefined;
    }

    const response = await this.client.sendRequest(GetComponentsWithTemplateFile, {
      textDocument: this.client.code2ProtocolConverter.asTextDocumentIdentifier(
        textEditor.document,
      ),
    });
    if (response === undefined) {
      return undefined;
    }

    const p2cConverter = this.client.protocol2CodeConverter;
    return response.map(
      (v) => new vscode.Location(p2cConverter.asUri(v.uri), p2cConverter.asRange(v.range)),
    );
  }

  async getTemplateLocationForComponent(
    textEditor: vscode.TextEditor,
  ): Promise<vscode.Location | null> {
    if (this.client === null) {
      return null;
    }
    const c2pConverter = this.client.code2ProtocolConverter;
    // Craft a request by converting vscode params to LSP. The corresponding
    // response is in LSP.
    const response = await this.client.sendRequest(GetTemplateLocationForComponent, {
      textDocument: c2pConverter.asTextDocumentIdentifier(textEditor.document),
      position: c2pConverter.asPosition(textEditor.selection.active),
    });
    if (response === null) {
      return null;
    }
    const p2cConverter = this.client.protocol2CodeConverter;
    return new vscode.Location(
      p2cConverter.asUri(response.uri),
      p2cConverter.asRange(response.range),
    );
  }

  private disposeSessionDisposables(): void {
    for (
      let disposable = this.sessionDisposables.pop();
      disposable !== undefined;
      disposable = this.sessionDisposables.pop()
    ) {
      disposable.dispose();
    }
  }

  dispose() {
    this.disposeSessionDisposables();
    for (let d = this.disposables.pop(); d !== undefined; d = this.disposables.pop()) {
      d.dispose();
    }
  }
}

function registerNotificationHandlers(
  client: lsp.LanguageClient,
  onProjectStateChange: () => void,
): vscode.Disposable {
  const disposables: vscode.Disposable[] = [];
  disposables.push(
    client.onNotification(ProjectLoadingStart, () => {
      onProjectStateChange();
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Window,
          title: 'Initializing Angular language features',
        },
        () =>
          new Promise<void>((resolve) => {
            client.onNotification(ProjectLoadingFinish, () => {
              onProjectStateChange();
              resolve();
            });
          }),
      );
    }),
  );

  disposables.push(
    client.onNotification(SuggestStrictMode, async (params: SuggestStrictModeParams) => {
      const config = vscode.workspace.getConfiguration();
      if (
        config.get('angular.enable-strict-mode-prompt') === false ||
        config.get('angular.forceStrictTemplates')
      ) {
        return;
      }

      const openTsConfig = 'Open tsconfig.json';
      // Markdown is not generally supported in `showInformationMessage()`,
      // but links are supported. See
      // https://github.com/microsoft/vscode/issues/20595#issuecomment-281099832
      const doNotPromptAgain = 'Do not show again for this workspace';
      const selection = await vscode.window.showInformationMessage(
        'Some language features are not available. To access all features, enable ' +
          '[strictTemplates](https://angular.dev/reference/configs/angular-compiler-options#stricttemplates) in ' +
          '[angularCompilerOptions](https://angular.dev/reference/configs/angular-compiler-options).',
        openTsConfig,
        doNotPromptAgain,
      );
      if (selection === openTsConfig) {
        const document = await vscode.workspace.openTextDocument(params.configFilePath);
        vscode.window.showTextDocument(document);
      } else if (selection === doNotPromptAgain) {
        config.update(
          'angular.enable-strict-mode-prompt',
          false,
          vscode.ConfigurationTarget.Workspace,
        );
      }
    }),
  );

  disposables.push(
    client.onNotification(OpenOutputChannel, () => {
      client.outputChannel.show();
    }),
  );

  return vscode.Disposable.from(...disposables);
}

/**
 * Return the paths for the module that corresponds to the specified `configValue`,
 * and use the specified `bundled` as fallback if none is provided.
 * @param configName
 * @param bundled
 */
function getProbeLocations(bundled: string): string[] {
  const locations = [];
  // Prioritize the bundled version
  locations.push(bundled);
  // Look in workspaces currently open
  const workspaceFolders = vscode.workspace.workspaceFolders || [];
  for (const folder of workspaceFolders) {
    locations.push(folder.uri.fsPath);
  }
  return locations;
}

function extensionVersionCompatibleWithAllProjects(serverModuleLocation: string): boolean {
  const languageServiceVersion = resolve(
    '@angular/language-service',
    serverModuleLocation,
  )?.version;
  if (languageServiceVersion === undefined) {
    return true;
  }

  const workspaceFolders = vscode.workspace.workspaceFolders || [];
  for (const workspaceFolder of workspaceFolders) {
    const angularCore = resolve('@angular/core', workspaceFolder.uri.fsPath);
    if (angularCore === undefined) {
      continue;
    }
    if (!languageServiceVersion.greaterThanOrEqual(angularCore.version, 'minor')) {
      return false;
    }
  }
  return true;
}

/**
 * Traverses through the currently open VSCode workspace (i.e. all open folders)
 * and finds all `@angular/core` versions installed based on `package.json` files.
 */
async function getAngularVersionsInWorkspace(
  outputChannel: vscode.OutputChannel,
): Promise<NodeModule[]> {
  const packageJsonFiles = await vscode.workspace.findFiles(
    '**/package.json',
    // Skip looking inside `node_module` folders as those contain irrelevant files.
    '**/node_modules/**',
  );
  const packageJsonRoots = packageJsonFiles.map((f) => path.dirname(f.fsPath));
  const angularCoreModules = new Set<NodeModule>();

  outputChannel.appendLine(`package.json roots detected: ${packageJsonRoots.join(',\n  ')}`);

  for (const packageJsonRoot of packageJsonRoots) {
    const angularCore = resolve('@angular/core', packageJsonRoot);
    if (angularCore === undefined) {
      continue;
    }
    angularCoreModules.add(angularCore);
  }
  return Array.from(angularCoreModules);
}

// TODO(atscott): Now that language service resolves the version of Angular local to the project, do we need this?
function setAngularVersionAndShowMultipleVersionsWarning(
  angularVersions: NodeModule[],
  args: string[],
  outputChannel: vscode.OutputChannel,
) {
  if (angularVersions.length === 0) {
    return;
  }
  if (angularVersions[0].version.toString() === '0.0.0') {
    // If only version 0.x is found, update it to 999 instead (0.0.0 is used for the version when building locally)
    angularVersions[0].version = new Version('999.999.999');
  }
  // Pass the earliest Angular version along to the compiler for maximum compatibility.
  // For example, if we tell the v21 compiler that we're using v21 but there's a v13 project,
  // the compiler may attempt to import and use APIs from angular core that don't exist in v13.
  args.push('--angularCoreVersion', angularVersions[0].version.toString());
  outputChannel.appendLine(
    `Using Angular version ${angularVersions[0].version.toString()} by default. If ` +
      `the project-specific version cannot be resolved, this version will be used.`,
  );

  let minorVersions = new Map<string, NodeModule>();
  for (const v of angularVersions) {
    minorVersions.set(`${v.version.major}.${v.version.minor}`, v);
  }
  if (minorVersions.size > 1) {
    vscode.window.showWarningMessage(
      `Multiple versions of Angular detected in the workspace. This can lead to compatibility issues for the language service. ` +
        `See the output panel for more details.`,
    );
    outputChannel.appendLine(`Multiple Angular versions detected in the workspace:`);
    for (const v of minorVersions.values()) {
      outputChannel.appendLine(
        `  Angular version ${v.version.toString()} detected at ${v.resolvedPath}`,
      );
    }
  }
}
