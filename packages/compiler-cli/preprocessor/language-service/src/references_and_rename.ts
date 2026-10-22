/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {Location, Range} from 'vscode-languageserver';
import {URI} from 'vscode-uri';
import {fileURLToPath} from 'node:url';

import {HybridCompiler} from '../../src/hybrid_compiler.js';
import {TsGoFacade} from './facade.js';
import {TemplateTypeChecker} from './type_checker.js';
import {getSetup, SetupResult} from './type_checker_setup.js';
import {
  convertToTemplateDocumentSpan,
  createLocationKey,
  findTightestNode,
  getParentClassDeclaration,
  collectMemberMethods,
  getRenameTextAndSpanAtPosition,
  getTargetDetailsAtTemplatePosition,
} from './references_and_rename_utils.js';
import {getTcbPath, offsetToPosition} from '../../src/tcb_ls_util.js';
import {canonicalizePath} from './utils.js';
import {SymbolKind} from './symbols.js';

export interface RenameInfo {
  canRename: boolean;
  displayName?: string;
  fullDisplayName?: string;
  triggerSpan?: {start: number; length: number};
  range?: Range;
  localizedErrorMessage?: string;
}

export async function ensureAllTcbs(
  hybridCompiler: HybridCompiler,
  facade: TsGoFacade,
  currentFilePath?: string,
): Promise<void> {
  if (!facade) return;
  await hybridCompiler.ensureReady();

  if (currentFilePath) {
    let currentTsPath = currentFilePath;
    if (currentFilePath.endsWith('.html')) {
      const usage = hybridCompiler.getTsFileForTemplate(currentFilePath);
      if (usage) {
        currentTsPath = usage.tsFilePath;
      }
    }
    if (currentTsPath.endsWith('.ts') && !currentTsPath.endsWith('.ngtypecheck.ts')) {
      const tcb = hybridCompiler.getTcbForFile(currentTsPath);
      if (tcb) {
        await facade.ensureDocument(getTcbPath(currentTsPath), tcb);
      }
    }
  }
}

export class ReferencesBuilder {
  constructor(
    private readonly hybridCompiler: HybridCompiler,
    private readonly facade: TsGoFacade,
    private readonly templateTypeChecker: TemplateTypeChecker,
  ) {}

  async getReferencesAtPosition(
    filePath: string,
    offset: number,
    position: {line: number; character: number},
    fileContent: string,
  ): Promise<Location[] | null> {
    await ensureAllTcbs(this.hybridCompiler, this.facade, filePath);

    const info = getSetup(this.hybridCompiler, filePath, position);
    if (info && (info.parsedTemplate || info.isHostBinding)) {
      return this.getReferencesAtTemplatePosition(info, offset, fileContent);
    }

    return this.getReferencesAtTypescriptPosition(filePath, offset, position, fileContent);
  }

  public async getReferencesAtTemplatePosition(
    info: SetupResult,
    offset: number,
    _fileContent: string,
  ): Promise<Location[] | null> {
    const details = getTargetDetailsAtTemplatePosition(
      info,
      offset,
      this.templateTypeChecker,
      this.hybridCompiler,
    );

    if (!details || details.length === 0) {
      return null;
    }

    const allLocations: Location[] = [];
    const seenKeys = new Set<string>();

    for (const detail of details) {
      // If the symbol is a Pipe, handle pipe references
      if (detail.symbol.kind === SymbolKind.Pipe) {
        const pipeLocations = await this.getPipeReferences(detail, info);
        if (pipeLocations) {
          for (const loc of pipeLocations) {
            const key = createLocationKey(loc);
            if (!seenKeys.has(key)) {
              seenKeys.add(key);
              allLocations.push(loc);
            }
          }
        }
        continue;
      }

      for (const loc of detail.typescriptLocations) {
        const isTcb = loc.fileName.endsWith('.ngtypecheck.ts');
        const tsFilePath = isTcb
          ? loc.fileName.replace(/(\.ts)?\.ngtypecheck\.ts$/, '.ts')
          : loc.fileName;
        const targetFileName = isTcb ? getTcbPath(tsFilePath) : loc.fileName;
        let fileText: string;
        try {
          fileText = isTcb
            ? (this.hybridCompiler.getTcbForFile(tsFilePath) ?? '')
            : this.hybridCompiler.getFileContent(loc.fileName);
        } catch {
          continue;
        }

        const lspPos = offsetToPosition(fileText, loc.position);
        const refs = await this.facade.getReferencesAtPosition(targetFileName, lspPos, {
          includeDeclaration: true,
        });

        if (!refs) continue;

        for (const ref of refs) {
          if (ref.uri.includes('.ngtypecheck.ts')) {
            const mapped = await convertToTemplateDocumentSpan(ref, this.hybridCompiler);
            if (mapped) {
              const key = createLocationKey(mapped);
              if (!seenKeys.has(key)) {
                seenKeys.add(key);
                allLocations.push(mapped);
              }
            }
          } else {
            const key = createLocationKey(ref);
            if (!seenKeys.has(key)) {
              seenKeys.add(key);
              allLocations.push(ref);
            }
          }
        }
      }
    }

    return allLocations.length > 0 ? allLocations : null;
  }

  private async getReferencesAtTypescriptPosition(
    filePath: string,
    offset: number,
    position: {line: number; character: number},
    fileContent: string,
  ): Promise<Location[] | null> {
    const sf = ts.createSourceFile(filePath, fileContent, ts.ScriptTarget.Latest, true);
    const node = findTightestNode(sf, offset);

    if (node && ts.isStringLiteral(node)) {
      // Check if cursor is on pipe name in @Pipe({name: '...'})
      const parentAssignment = node.parent;
      if (
        parentAssignment &&
        ts.isPropertyAssignment(parentAssignment) &&
        parentAssignment.name.getText() === 'name'
      ) {
        const classDecl = getParentClassDeclaration(parentAssignment);
        if (classDecl) {
          const pipeRefs = await this.getPipeReferencesFromDecorator(
            filePath,
            classDecl,
            node,
            fileContent,
          );
          if (pipeRefs) return pipeRefs;
        }
      }
    }

    // Standard TypeScript symbol references
    const refs = await this.facade.getReferencesAtPosition(filePath, position, {
      includeDeclaration: true,
    });
    if (!refs || refs.length === 0) {
      return null;
    }

    const allLocations: Location[] = [];
    const seenKeys = new Set<string>();

    for (const ref of refs) {
      if (ref.uri.includes('.ngtypecheck.ts')) {
        const mapped = await convertToTemplateDocumentSpan(ref, this.hybridCompiler);
        if (mapped) {
          const key = createLocationKey(mapped);
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            allLocations.push(mapped);
          }
        }
      } else {
        const key = createLocationKey(ref);
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          allLocations.push(ref);
        }
      }
    }

    return allLocations.length > 0 ? allLocations : null;
  }

  private async getPipeReferences(detail: any, info: SetupResult): Promise<Location[] | null> {
    const symbol = detail.symbol;
    const pipeLoc = symbol.tcbLocation || symbol.classSymbol?.tcbLocation;
    if (!pipeLoc) return null;

    const pipeName = symbol.pipeName || symbol.name || (detail.templateTarget as any)?.name;
    const tcbCode = this.hybridCompiler.getTcbForFile(info.tsFilePath);
    if (!tcbCode) return null;

    const targetFileName = getTcbPath(info.tsFilePath);
    const pos = offsetToPosition(tcbCode, pipeLoc.positionInFile);
    const refs = await this.facade.getReferencesAtPosition(targetFileName, pos, {
      includeDeclaration: true,
    });

    const results: Location[] = [];
    const seenKeys = new Set<string>();

    if (refs) {
      for (const ref of refs) {
        if (ref.uri.includes('.ngtypecheck.ts')) {
          const mapped = await convertToTemplateDocumentSpan(ref, this.hybridCompiler, pipeName);
          if (mapped) {
            const key = createLocationKey(mapped);
            if (!seenKeys.has(key)) {
              seenKeys.add(key);
              results.push(mapped);
            }
          }
        }
      }
    }

    // Add the pipe name in the @Pipe decorator
    const defs = await this.facade.getDefinitionAtPosition(targetFileName, pos);
    if (defs && defs.length > 0) {
      const defUri = defs[0].uri || (defs[0] as any).targetUri;
      if (defUri) {
        const pipeFilePath = defUri.startsWith('file:') ? fileURLToPath(defUri) : defUri;
        const decoratorNameLoc = await this.getPipeDecoratorNameLocation(pipeFilePath, pipeName);
        if (decoratorNameLoc) {
          const key = createLocationKey(decoratorNameLoc);
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            results.push(decoratorNameLoc);
          }
        }
      }
    }

    if (this.hybridCompiler.fileCache) {
      for (const fPath of this.hybridCompiler.fileCache.keys()) {
        if (
          typeof fPath !== 'string' ||
          fPath.endsWith('.ngtypecheck.ts') ||
          !fPath.endsWith('.ts')
        )
          continue;
        const decoratorNameLoc = await this.getPipeDecoratorNameLocation(fPath, pipeName);
        if (decoratorNameLoc) {
          const key = createLocationKey(decoratorNameLoc);
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            results.push(decoratorNameLoc);
          }
        }
      }
    }

    return results.length > 0 ? results : null;
  }

  private async getPipeReferencesFromDecorator(
    filePath: string,
    classDecl: ts.ClassDeclaration,
    node: ts.StringLiteral,
    fileContent: string,
  ): Promise<Location[] | null> {
    const pipeName = node.text;
    const methods = collectMemberMethods(classDecl);
    const transformMethod = methods.find((m) => m.name.getText() === 'transform');

    const results: Location[] = [];
    const seenKeys = new Set<string>();

    // Add the decorator string literal location itself
    const startPos = offsetToPosition(fileContent, node.getStart() + 1); // skip opening quote
    const endPos = offsetToPosition(fileContent, node.getEnd() - 1); // skip closing quote
    const defLoc: Location = {
      uri: URI.file(await canonicalizePath(filePath)).toString(),
      range: {start: startPos, end: endPos},
    };
    results.push(defLoc);
    seenKeys.add(createLocationKey(defLoc));

    if (transformMethod) {
      const transformPos = offsetToPosition(fileContent, transformMethod.name.getStart());
      const refs = await this.facade.getReferencesAtPosition(filePath, transformPos, {
        includeDeclaration: true,
      });
      if (refs) {
        for (const ref of refs) {
          if (ref.uri.includes('.ngtypecheck.ts')) {
            const mapped = await convertToTemplateDocumentSpan(ref, this.hybridCompiler, pipeName);
            if (mapped) {
              const key = createLocationKey(mapped);
              if (!seenKeys.has(key)) {
                seenKeys.add(key);
                results.push(mapped);
              }
            }
          }
        }
      }
    }

    return results.length > 0 ? results : null;
  }

  private async getPipeDecoratorNameLocation(
    filePath: string,
    pipeName: string,
  ): Promise<Location | null> {
    let content: string;
    try {
      content = this.hybridCompiler.getFileContent(filePath);
    } catch {
      return null;
    }

    const sf = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
    let targetNode: ts.StringLiteral | null = null;

    function visit(n: ts.Node) {
      if (targetNode) return;
      if (
        ts.isPropertyAssignment(n) &&
        n.name.getText() === 'name' &&
        ts.isStringLiteral(n.initializer) &&
        n.initializer.text === pipeName
      ) {
        targetNode = n.initializer;
        return;
      }
      ts.forEachChild(n, visit);
    }
    visit(sf);

    if (!targetNode) return null;

    const startPos = offsetToPosition(content, (targetNode as ts.StringLiteral).getStart(sf) + 1);
    const endPos = offsetToPosition(content, (targetNode as ts.StringLiteral).getEnd() - 1);

    return {
      uri: URI.file(await canonicalizePath(filePath)).toString(),
      range: {start: startPos, end: endPos},
    };
  }
}

export class RenameBuilder {
  constructor(
    private readonly hybridCompiler: HybridCompiler,
    private readonly facade: TsGoFacade,
    private readonly templateTypeChecker: TemplateTypeChecker,
  ) {}

  async getRenameInfo(
    filePath: string,
    offset: number,
    position: {line: number; character: number},
    fileContent: string,
  ): Promise<RenameInfo | null> {
    const info = getSetup(this.hybridCompiler, filePath, position);
    if (info && info.parsedTemplate) {
      const details = getTargetDetailsAtTemplatePosition(
        info,
        offset,
        this.templateTypeChecker,
        this.hybridCompiler,
      );
      if (
        !details ||
        details.length === 0 ||
        (details[0].symbol?.kind === SymbolKind.Element &&
          details[0].typescriptLocations.length === 0)
      ) {
        return {canRename: false, localizedErrorMessage: 'You cannot rename this element.'};
      }

      const renameTextAndSpan = getRenameTextAndSpanAtPosition(details[0].templateTarget, offset);
      if (!renameTextAndSpan) {
        return {canRename: false, localizedErrorMessage: 'You cannot rename this element.'};
      }

      const startPos = offsetToPosition(fileContent, renameTextAndSpan.span.start);
      const endPos = offsetToPosition(
        fileContent,
        renameTextAndSpan.span.start + renameTextAndSpan.span.length,
      );

      return {
        canRename: true,
        displayName: renameTextAndSpan.text,
        fullDisplayName: renameTextAndSpan.text,
        triggerSpan: renameTextAndSpan.span,
        range: {start: startPos, end: endPos},
      };
    }

    // In TypeScript file
    const sf = ts.createSourceFile(filePath, fileContent, ts.ScriptTarget.Latest, true);
    const node = findTightestNode(sf, offset);

    if (node && ts.isStringLiteral(node)) {
      const parent = node.parent;
      if (parent && ts.isPropertyAssignment(parent) && parent.name.getText() === 'name') {
        const pipeName = node.text;
        const start = node.getStart() + 1;
        const length = node.getWidth() - 2;
        return {
          canRename: true,
          displayName: pipeName,
          fullDisplayName: pipeName,
          triggerSpan: {start, length},
          range: {
            start: offsetToPosition(fileContent, start),
            end: offsetToPosition(fileContent, start + length),
          },
        };
      }
      if (parent && ts.isPropertyAssignment(parent) && parent.name.getText() === 'selector') {
        const selector = node.text;
        const start = node.getStart() + 1;
        const length = node.getWidth() - 2;
        return {
          canRename: true,
          displayName: selector,
          fullDisplayName: selector,
          triggerSpan: {start, length},
          range: {
            start: offsetToPosition(fileContent, start),
            end: offsetToPosition(fileContent, start + length),
          },
        };
      }
      return {canRename: false, localizedErrorMessage: 'You cannot rename this element.'};
    }

    if (node && ts.isIdentifier(node)) {
      const text = node.text;
      const start = node.getStart();
      const length = node.getWidth();
      return {
        canRename: true,
        displayName: text,
        fullDisplayName: text,
        triggerSpan: {start, length},
        range: {
          start: offsetToPosition(fileContent, start),
          end: offsetToPosition(fileContent, start + length),
        },
      };
    }

    return null;
  }

  async findRenameLocations(
    filePath: string,
    offset: number,
    position: {line: number; character: number},
    fileContent: string,
  ): Promise<Location[] | null> {
    await ensureAllTcbs(this.hybridCompiler, this.facade, filePath);

    const info = getSetup(this.hybridCompiler, filePath, position);
    if (info && info.parsedTemplate) {
      return this.findRenameLocationsFromTemplate(info, offset, fileContent);
    }

    return this.findRenameLocationsFromTypescript(filePath, offset, position, fileContent);
  }

  private async findRenameLocationsFromTemplate(
    info: SetupResult,
    offset: number,
    _fileContent: string,
  ): Promise<Location[] | null> {
    const details = getTargetDetailsAtTemplatePosition(
      info,
      offset,
      this.templateTypeChecker,
      this.hybridCompiler,
    );
    if (!details || details.length === 0) {
      return null;
    }

    const renameTextAndSpan = getRenameTextAndSpanAtPosition(details[0].templateTarget, offset);
    if (!renameTextAndSpan) {
      return null;
    }

    const expectedRenameText = renameTextAndSpan.text;

    // Pipe rename
    if (details[0].symbol.kind === SymbolKind.Pipe) {
      const refsBuilder = new ReferencesBuilder(
        this.hybridCompiler,
        this.facade,
        this.templateTypeChecker,
      );
      return refsBuilder.getReferencesAtTemplatePosition(info, offset, _fileContent);
    }

    // Direct from template
    const allLocations: Location[] = [];
    const seenKeys = new Set<string>();

    for (const detail of details) {
      for (const loc of detail.typescriptLocations) {
        const isTcb = loc.fileName.endsWith('.ngtypecheck.ts');
        const tsFilePath = isTcb
          ? loc.fileName.replace(/(\.ts)?\.ngtypecheck\.ts$/, '.ts')
          : loc.fileName;
        const targetFileName = isTcb ? getTcbPath(tsFilePath) : loc.fileName;
        let fileText: string;
        try {
          fileText = isTcb
            ? (this.hybridCompiler.getTcbForFile(tsFilePath) ?? '')
            : this.hybridCompiler.getFileContent(loc.fileName);
        } catch {
          return null;
        }

        const lspPos = offsetToPosition(fileText, loc.position);
        const refs = await this.facade.getReferencesAtPosition(targetFileName, lspPos, {
          includeDeclaration: true,
        });

        if (!refs || refs.length === 0) {
          return null;
        }

        for (const ref of refs) {
          if (ref.uri.includes('.ngtypecheck.ts')) {
            const mapped = await convertToTemplateDocumentSpan(
              ref,
              this.hybridCompiler,
              expectedRenameText,
            );
            if (!mapped) {
              // Failed mapping or text mismatch - bail completely to prevent corrupt edits!
              return null;
            }
            const key = createLocationKey(mapped);
            if (!seenKeys.has(key)) {
              seenKeys.add(key);
              allLocations.push(mapped);
            }
          } else {
            const key = createLocationKey(ref);
            if (!seenKeys.has(key)) {
              seenKeys.add(key);
              allLocations.push(ref);
            }
          }
        }
      }
    }

    return allLocations.length > 0 ? allLocations : null;
  }

  private async findRenameLocationsFromTypescript(
    filePath: string,
    offset: number,
    position: {line: number; character: number},
    fileContent: string,
  ): Promise<Location[] | null> {
    const sf = ts.createSourceFile(filePath, fileContent, ts.ScriptTarget.Latest, true);
    const node = findTightestNode(sf, offset);

    if (node && ts.isStringLiteral(node)) {
      const parent = node.parent;
      if (parent && ts.isPropertyAssignment(parent)) {
        if (parent.name.getText() === 'selector') {
          // Renaming component selector is not supported yet, return null (matching reference)
          return null;
        }
        if (parent.name.getText() === 'name') {
          // Pipe name rename
          const refsBuilder = new ReferencesBuilder(
            this.hybridCompiler,
            this.facade,
            this.templateTypeChecker,
          );
          return refsBuilder.getReferencesAtPosition(filePath, offset, position, fileContent);
        }
      }
      return null;
    }

    if (node && ts.isIdentifier(node)) {
      const expectedRenameText = node.text;
      const refs = await this.facade.getReferencesAtPosition(filePath, position, {
        includeDeclaration: true,
      });
      if (!refs || refs.length === 0) {
        return null;
      }

      const allLocations: Location[] = [];
      const seenKeys = new Set<string>();

      for (const ref of refs) {
        if (ref.uri.includes('.ngtypecheck.ts')) {
          const mapped = await convertToTemplateDocumentSpan(
            ref,
            this.hybridCompiler,
            expectedRenameText,
          );
          if (!mapped) {
            // Failed mapping or text mismatch - bail completely
            return null;
          }
          const key = createLocationKey(mapped);
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            allLocations.push(mapped);
          }
        } else {
          const key = createLocationKey(ref);
          if (!seenKeys.has(key)) {
            seenKeys.add(key);
            allLocations.push(ref);
          }
        }
      }

      return allLocations.length > 0 ? allLocations : null;
    }

    return null;
  }
}
