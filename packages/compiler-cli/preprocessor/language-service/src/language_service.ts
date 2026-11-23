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

  async getHover(
    filePath: string,
    offset: number,
    position: {line: number; character: number},
    fileContent: string,
  ): Promise<{text: string; span?: {start: number; length: number}} | null> {
    await this.hybridCompiler.ensureReady();
    return getHover(
      filePath,
      offset,
      position,
      fileContent,
      this.hybridCompiler,
      this.templateTypeChecker,
      this.facade,
    );
  }

  // TODO(future): Fetch file content and offsets from the Rust VFS.
  async getDefinition(
    filePath: string,
    offset: number,
    position: {line: number; character: number},
    fileContent: string,
  ): Promise<unknown> {
    await this.hybridCompiler.ensureReady();
    return getDefinition(
      filePath,
      offset,
      position,
      fileContent,
      this.hybridCompiler,
      this.templateTypeChecker,
      this.facade,
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
    _fileContent?: string,
  ): Promise<CompletionList | null> {
    await this.hybridCompiler.ensureReady();
    return getCompletionsAtPosition(filePath, offset, position, this.hybridCompiler, this.facade);
  }

  async getCompletionEntryDetails(
    filePath: string,
    offset: number,
    position: {line: number; character: number},
    _fileContent: string,
    item: CompletionItem | string,
  ): Promise<CompletionItem | null> {
    await this.hybridCompiler.ensureReady();
    return getCompletionEntryDetails(
      filePath,
      offset,
      position,
      this.hybridCompiler,
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
    return getSignatureHelp(
      filePath,
      offset,
      position,
      fileContent,
      this.hybridCompiler,
      this.templateTypeChecker,
      this.facade,
      context,
    );
  }
}
