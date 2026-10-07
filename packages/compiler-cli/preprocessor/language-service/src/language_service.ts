/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TemplateTypeChecker} from './type_checker.js';
import {HybridCompiler} from '../../src/hybrid_compiler.js';
import {TsGoFacade} from './facade.js';
import {getHover} from './hover.js';
import {getDefinition} from './definitions.js';
import {getCompletionsAtPosition, getCompletionEntryDetails} from './completions.js';
import {
  Diagnostic,
  CompletionList,
  CompletionItem,
  Location,
  SignatureHelp,
  SignatureHelpContext,
} from 'vscode-languageserver';
import {handleDiagnostics} from './diagnostics.js';
import {ReferencesBuilder, RenameBuilder, RenameInfo} from './references_and_rename.js';
import {getSignatureHelp} from './signature_help.js';

export class LanguageService {
  private templateTypeChecker: TemplateTypeChecker;

  constructor(
    public readonly hybridCompiler: HybridCompiler,
    private facade: TsGoFacade,
  ) {
    this.templateTypeChecker = new TemplateTypeChecker(hybridCompiler);
  }

  // In our standalone LSP setup, we effectively run in "angularOnly" mode
  // because the default TS server handles regular TS code.
  // This matches reference/angular/packages/language-service/src/ts_plugin.ts
  // where angularOnly skips falling back to TS.
  private readonly angularOnly = true;
  // https://github.com/angular/angular/blob/d27e2c24e1aa6eaf60cfdf61ba812ff9c7f933c2/packages/language-service/src/ts_plugin.ts#L38-L46
  private async withFallback<T>(
    filePath: string,
    tsOp: () => Promise<T | null>,
    ngOp: () => Promise<T | null>,
  ): Promise<T | null> {
    if (this.angularOnly || !filePath.endsWith('.ts')) {
      return await ngOp();
    }

    return (await tsOp()) ?? ngOp();
  }

  async getHover(
    filePath: string,
    offset: number,
    position: {line: number; character: number},
    fileContent: string,
  ): Promise<{text: string; span?: {start: number; length: number}} | null> {
    await this.hybridCompiler.ensureReady();
    return this.withFallback<{text: string; span?: {start: number; length: number}}>(
      filePath,
      async () => {
        const result = await this.facade.getQuickInfoAtPosition(filePath, position);
        return result ? {text: result.text} : null;
      },
      () =>
        getHover(
          filePath,
          offset,
          position,
          fileContent,
          this.hybridCompiler,
          this.templateTypeChecker,
          this.facade,
        ),
    );
  }

  // TODO(future): Consider fetching file content or offsets from Rust VFS instead of passing it here.
  async getDefinition(
    filePath: string,
    offset: number,
    position: {line: number; character: number},
    fileContent: string,
  ): Promise<unknown> {
    await this.hybridCompiler.ensureReady();
    return this.withFallback(
      filePath,
      () => this.facade.getDefinitionAtPosition(filePath, position),
      () =>
        getDefinition(
          filePath,
          offset,
          position,
          fileContent,
          this.hybridCompiler,
          this.templateTypeChecker,
          this.facade,
        ),
    );
  }

  async getTcb(filePath: string, position: {line: number; character: number}) {
    await this.hybridCompiler.ensureReady();
    return this.templateTypeChecker.getTcb(filePath, position);
  }

  async getCompletionsAtPosition(
    filePath: string,
    offset: number,
    position: {line: number; character: number},
    fileContent: string,
  ): Promise<CompletionList | null> {
    await this.hybridCompiler.ensureReady();
    return getCompletionsAtPosition(
      filePath,
      offset,
      position,
      fileContent,
      this.hybridCompiler,
      this.templateTypeChecker,
      this.facade,
    );
  }

  async getCompletionEntryDetails(
    filePath: string,
    offset: number,
    position: {line: number; character: number},
    fileContent: string,
    item: CompletionItem | string,
  ): Promise<CompletionItem | null> {
    await this.hybridCompiler.ensureReady();
    return getCompletionEntryDetails(
      filePath,
      offset,
      position,
      fileContent,
      this.hybridCompiler,
      this.templateTypeChecker,
      this.facade,
      item,
    );
  }

  async handleDiagnostics(params: {
    filePath: string;
    diagnostics: Diagnostic[];
  }): Promise<{[filePath: string]: Diagnostic[]} | null> {
    await this.hybridCompiler.ensureReady();
    return handleDiagnostics(params, this.hybridCompiler);
  }

  async getReferencesAtPosition(
    filePath: string,
    offset: number,
    position: {line: number; character: number},
    fileContent: string,
  ): Promise<Location[] | null> {
    await this.hybridCompiler.ensureReady();
    const builder = new ReferencesBuilder(
      this.hybridCompiler,
      this.facade,
      this.templateTypeChecker,
    );
    return builder.getReferencesAtPosition(filePath, offset, position, fileContent);
  }

  async getRenameInfo(
    filePath: string,
    offset: number,
    position: {line: number; character: number},
    fileContent: string,
  ): Promise<RenameInfo | null> {
    await this.hybridCompiler.ensureReady();
    const builder = new RenameBuilder(this.hybridCompiler, this.facade, this.templateTypeChecker);
    return builder.getRenameInfo(filePath, offset, position, fileContent);
  }

  async findRenameLocations(
    filePath: string,
    offset: number,
    position: {line: number; character: number},
    fileContent: string,
  ): Promise<Location[] | null> {
    await this.hybridCompiler.ensureReady();
    const builder = new RenameBuilder(this.hybridCompiler, this.facade, this.templateTypeChecker);
    return builder.findRenameLocations(filePath, offset, position, fileContent);
  }

  async getSignatureHelp(
    filePath: string,
    offset: number,
    position: {line: number; character: number},
    fileContent: string,
    context?: SignatureHelpContext,
  ): Promise<SignatureHelp | null> {
    await this.hybridCompiler.ensureReady();
    return this.withFallback<SignatureHelp>(
      filePath,
      () => this.facade.getSignatureHelpAtPosition(filePath, position, context),
      () =>
        getSignatureHelp(
          filePath,
          offset,
          position,
          fileContent,
          this.hybridCompiler,
          this.templateTypeChecker,
          this.facade,
          context,
        ),
    );
  }
}
