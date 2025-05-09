/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {AST, TmplAstComponent, TmplAstDirective, TmplAstNode} from '@angular/compiler';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import {absoluteFrom} from '@angular/compiler-cli/src/ngtsc/file_system';
import {MetaKind, PipeMeta} from '@angular/compiler-cli/src/ngtsc/metadata';
import {PerfPhase} from '@angular/compiler-cli/src/ngtsc/perf';
import {
  SelectorlessComponentSymbol,
  SelectorlessDirectiveSymbol,
  SymbolKind,
  TemplateTypeChecker,
} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import ts from 'typescript';

import {
  convertToTemplateDocumentSpan,
  FilePosition,
  getParentClassMeta,
  getRenameTextAndSpanAtPosition,
  getSelectorlessTemplateSpanFromTcbLocations,
  getTargetDetailsAtTemplatePosition,
  TemplateLocationDetails,
} from './references_and_rename_utils';
import {collectMemberMethods, findTightestNode} from './utils/ts_utils';
import {getTypeCheckInfoAtPosition, TypeCheckInfo} from './utils';

export class ReferencesBuilder {
  private readonly ttc: TemplateTypeChecker;

  constructor(
    private readonly tsLS: ts.LanguageService,
    private readonly compiler: NgCompiler,
  ) {
    this.ttc = this.compiler.getTemplateTypeChecker();
  }

  getReferencesAtPosition(filePath: string, position: number): ts.ReferenceEntry[] | undefined {
    this.ttc.generateAllTypeCheckBlocks();
    const typeCheckInfo = getTypeCheckInfoAtPosition(filePath, position, this.compiler);
    if (typeCheckInfo === undefined) {
      return this.getReferencesAtTypescriptPosition(filePath, position);
    }
    return this.getReferencesAtTemplatePosition(typeCheckInfo, position);
  }

  private getReferencesAtTemplatePosition(
    typeCheckInfo: TypeCheckInfo,
    position: number,
  ): ts.ReferenceEntry[] | undefined {
    const allTargetDetails = getTargetDetailsAtTemplatePosition(typeCheckInfo, position, this.ttc);
    if (allTargetDetails === null) {
      return undefined;
    }
    const allReferences: ts.ReferenceEntry[] = [];
    for (const targetDetails of allTargetDetails) {
      for (const location of targetDetails.typescriptLocations) {
        const refs = this.getReferencesAtTypescriptPosition(location.fileName, location.position);
        if (refs !== undefined) {
          allReferences.push(...refs);
        }
      }
    }
    return allReferences.length > 0 ? allReferences : undefined;
  }

  private getReferencesAtTypescriptPosition(
    fileName: string,
    position: number,
  ): ts.ReferenceEntry[] | undefined {
    const refs = this.tsLS.getReferencesAtPosition(fileName, position);
    if (refs === undefined) {
      return undefined;
    }

    const entries: ts.ReferenceEntry[] = [];
    for (const ref of refs) {
      if (this.ttc.isTrackedTypeCheckFile(absoluteFrom(ref.fileName))) {
        const entry = convertToTemplateDocumentSpan(
          ref,
          this.ttc,
          this.compiler.getCurrentProgram(),
        );
        if (entry !== null) {
          entries.push(entry);
        }
      } else {
        entries.push(ref);
      }
    }
    return entries;
  }
}

enum RequestKind {
  DirectFromTemplate,
  DirectFromTypeScript,
  PipeName,
  Selector,
  SelectorlessIdentifier,
}

/** The context needed to perform a rename of a pipe name. */
interface PipeRenameContext {
  type: RequestKind.PipeName;

  /** The string literal for the pipe name that appears in the @Pipe meta */
  pipeNameExpr: ts.StringLiteral;

  /**
   * The location to use for querying the native TS LS for rename positions. This will be the
   * pipe's transform method.
   */
  renamePosition: FilePosition;
}

/** The context needed to perform a rename of a directive/component selector. */
interface SelectorRenameContext {
  type: RequestKind.Selector;

  /** The string literal that appears in the directive/component metadata. */
  selectorExpr: ts.StringLiteral;

  /**
   * The location to use for querying the native TS LS for rename positions. This will be the
   * component/directive class itself. Doing so will allow us to find the location of the
   * directive/component instantiations, which map to template elements.
   */
  renamePosition: FilePosition;
}

/** The context needed to perform a rename of a selectorless component/directive. */
interface SelectorlessIdentifierRenameContext {
  type: RequestKind.SelectorlessIdentifier;

  /** Node defining the component/directive. */
  templateNode: TmplAstComponent | TmplAstDirective;

  /** Identifier of the class defining the class. */
  identifier: ts.Identifier;

  /** Location used for querying the TypeScript language service. */
  renamePosition: FilePosition;
}

interface DirectFromTypescriptRenameContext {
  type: RequestKind.DirectFromTypeScript;

  /** The node that is being renamed. */
  requestNode: ts.Node;
}

interface DirectFromTemplateRenameContext {
  type: RequestKind.DirectFromTemplate;

  /** The position in the TCB file to use as the request to the native TSLS for renaming. */
  renamePosition: FilePosition;

  /** The position in the template the request originated from. */
  templatePosition: number;

  /** The target node in the template AST that corresponds to the template position. */
  requestNode: AST | TmplAstNode;
}

type IndirectRenameContext = PipeRenameContext | SelectorRenameContext;
type RenameRequest =
  | IndirectRenameContext
  | DirectFromTemplateRenameContext
  | DirectFromTypescriptRenameContext
  | SelectorlessIdentifierRenameContext;

function isDirectRenameContext(
  context: RenameRequest,
): context is
  | DirectFromTemplateRenameContext
  | DirectFromTypescriptRenameContext
  | SelectorlessIdentifierRenameContext {
  return (
    context.type === RequestKind.DirectFromTemplate ||
    context.type === RequestKind.DirectFromTypeScript ||
    context.type === RequestKind.SelectorlessIdentifier
  );
}

export class RenameBuilder {
  private readonly ttc: TemplateTypeChecker;

  constructor(
    private readonly tsLS: ts.LanguageService,
    private readonly compiler: NgCompiler,
  ) {
    this.ttc = this.compiler.getTemplateTypeChecker();
  }

  getRenameInfo(
    filePath: string,
    position: number,
  ): Omit<ts.RenameInfoSuccess, 'kind' | 'kindModifiers'> | ts.RenameInfoFailure {
    return this.compiler.perfRecorder.inPhase(PerfPhase.LsReferencesAndRenames, () => {
      const typeCheckInfo = getTypeCheckInfoAtPosition(filePath, position, this.compiler);
      // We could not get a template at position so we assume the request came from outside the
      // template.
      if (typeCheckInfo === undefined) {
        const renameRequest = this.buildRenameRequestAtTypescriptPosition(filePath, position);
        if (renameRequest === null) {
          return {
            canRename: false,
            localizedErrorMessage: 'Could not determine rename info at typescript position.',
          };
        }
        if (renameRequest.type === RequestKind.PipeName) {
          const pipeName = renameRequest.pipeNameExpr.text;
          return {
            canRename: true,
            displayName: pipeName,
            fullDisplayName: pipeName,
            triggerSpan: {
              length: pipeName.length,
              // Offset the pipe name by 1 to account for start of string '/`/"
              start: renameRequest.pipeNameExpr.getStart() + 1,
            },
          };
        } else if (renameRequest.type === RequestKind.SelectorlessIdentifier) {
          return {
            canRename: true,
            displayName: renameRequest.identifier.text,
            fullDisplayName: renameRequest.identifier.text,
            triggerSpan: {
              length: renameRequest.identifier.text.length,
              start: renameRequest.identifier.getStart(),
            },
          };
        } else {
          // TODO(atscott): Add support for other special indirect renames from typescript files.
          return this.tsLS.getRenameInfo(filePath, position);
        }
      }

      const allTargetDetails = getTargetDetailsAtTemplatePosition(
        typeCheckInfo,
        position,
        this.ttc,
      );
      if (allTargetDetails === null) {
        return {
          canRename: false,
          localizedErrorMessage: 'Could not find template node at position.',
        };
      }
      const {templateTarget} = allTargetDetails[0];
      const templateTextAndSpan = getRenameTextAndSpanAtPosition(templateTarget, position);
      if (templateTextAndSpan === null) {
        return {canRename: false, localizedErrorMessage: 'Could not determine template node text.'};
      }
      const {text, span} = templateTextAndSpan;
      return {
        canRename: true,
        displayName: text,
        fullDisplayName: text,
        triggerSpan: span,
      };
    });
  }

  findRenameLocations(filePath: string, position: number): readonly ts.RenameLocation[] | null {
    this.ttc.generateAllTypeCheckBlocks();
    return this.compiler.perfRecorder.inPhase(PerfPhase.LsReferencesAndRenames, () => {
      const typeCheckInfo = getTypeCheckInfoAtPosition(filePath, position, this.compiler);
      // We could not get a template at position so we assume the request came from outside the
      // template.
      if (typeCheckInfo === undefined) {
        const renameRequest = this.buildRenameRequestAtTypescriptPosition(filePath, position);
        if (renameRequest === null) {
          return null;
        }
        return this.findRenameLocationsAtTypescriptPosition(renameRequest);
      }
      return this.findRenameLocationsAtTemplatePosition(typeCheckInfo, position);
    });
  }

  private findRenameLocationsAtTemplatePosition(
    typeCheckInfo: TypeCheckInfo,
    position: number,
  ): readonly ts.RenameLocation[] | null {
    const allTargetDetails = getTargetDetailsAtTemplatePosition(typeCheckInfo, position, this.ttc);
    if (allTargetDetails === null) {
      return null;
    }
    const renameRequests = this.buildRenameRequestsFromTemplateDetails(allTargetDetails, position);
    if (renameRequests === null) {
      return null;
    }

    const allRenameLocations: ts.RenameLocation[] = [];
    for (const renameRequest of renameRequests) {
      const locations = this.findRenameLocationsAtTypescriptPosition(renameRequest);
      // If we couldn't find rename locations for _any_ result, we should not allow renaming to
      // proceed instead of having a partially complete rename.
      if (locations === null) {
        return null;
      }
      allRenameLocations.push(...locations);
    }
    return allRenameLocations.length > 0 ? allRenameLocations : null;
  }

  findRenameLocationsAtTypescriptPosition(
    renameRequest: RenameRequest,
  ): readonly ts.RenameLocation[] | null {
    return this.compiler.perfRecorder.inPhase(PerfPhase.LsReferencesAndRenames, () => {
      const renameInfo = getExpectedRenameTextAndInitialRenameEntries(renameRequest);
      if (renameInfo === null) {
        return null;
      }
      const {entries, expectedRenameText} = renameInfo;
      const {fileName, position} = getRenameRequestPosition(renameRequest);
      const findInStrings = false;
      const findInComments = false;
      const locations = this.tsLS.findRenameLocations(
        fileName,
        position,
        findInStrings,
        findInComments,
      );
      if (locations === undefined) {
        return null;
      }

      for (const location of locations) {
        if (this.ttc.isTrackedTypeCheckFile(absoluteFrom(location.fileName))) {
          if (renameRequest.type === RequestKind.SelectorlessIdentifier) {
            const selectorlessEntries = getSelectorlessTemplateSpanFromTcbLocations(
              location,
              this.ttc,
              this.compiler.getCurrentProgram(),
              renameRequest.templateNode,
            );
            if (selectorlessEntries !== null) {
              entries.push(...selectorlessEntries);
            }
          } else {
            const entry = convertToTemplateDocumentSpan(
              location,
              this.ttc,
              this.compiler.getCurrentProgram(),
              expectedRenameText,
            );
            // There is no template node whose text matches the original rename request. Bail on
            // renaming completely rather than providing incomplete results.
            if (entry === null) {
              return null;
            }
            entries.push(entry);
          }
        } else {
          if (!isDirectRenameContext(renameRequest)) {
            // Discard any non-template results for non-direct renames. We should only rename
            // template results + the name/selector/alias `ts.Expression`. The other results
            // will be the `ts.Identifier` of the transform method (pipe rename) or the
            // directive class (selector rename).
            continue;
          }
          // Ensure we only allow renaming a TS result with matching text
          const refNode = this.getTsNodeAtPosition(location.fileName, location.textSpan.start);
          if (refNode === null || refNode.getText() !== expectedRenameText) {
            return null;
          }
          entries.push(location);
        }
      }
      return entries;
    });
  }

  private getTsNodeAtPosition(filePath: string, position: number): ts.Node | null {
    const sf = this.compiler.getCurrentProgram().getSourceFile(filePath);
    if (!sf) {
      return null;
    }
    return findTightestNode(sf, position) ?? null;
  }

  private buildRenameRequestsFromTemplateDetails(
    allTargetDetails: TemplateLocationDetails[],
    templatePosition: number,
  ): RenameRequest[] | null {
    const renameRequests: RenameRequest[] = [];
    for (const targetDetails of allTargetDetails) {
      for (const location of targetDetails.typescriptLocations) {
        if (targetDetails.symbol.kind === SymbolKind.Pipe) {
          const meta = this.compiler.getMeta(
            targetDetails.symbol.classSymbol.tsSymbol.valueDeclaration,
          );
          if (meta === null || meta.kind !== MetaKind.Pipe) {
            return null;
          }
          const renameRequest = this.buildPipeRenameRequest(meta);
          if (renameRequest === null) {
            return null;
          }
          renameRequests.push(renameRequest);
        } else if (
          targetDetails.symbol.kind === SymbolKind.SelectorlessComponent ||
          targetDetails.symbol.kind === SymbolKind.SelectorlessDirective
        ) {
          const renameRequest = this.buildSelectorlessRenameRequestFromTemplate(
            targetDetails.symbol,
          );
          if (renameRequest === null) {
            return null;
          }
          renameRequests.push(renameRequest);
        } else {
          const renameRequest: RenameRequest = {
            type: RequestKind.DirectFromTemplate,
            templatePosition,
            requestNode: targetDetails.templateTarget,
            renamePosition: location,
          };
          renameRequests.push(renameRequest);
        }
      }
    }
    return renameRequests;
  }

  private buildRenameRequestAtTypescriptPosition(
    filePath: string,
    position: number,
  ): RenameRequest | null {
    const requestNode = this.getTsNodeAtPosition(filePath, position);
    if (requestNode === null) {
      return null;
    }
    const meta = getParentClassMeta(requestNode, this.compiler);
    if (meta !== null && meta.kind === MetaKind.Pipe && meta.nameExpr === requestNode) {
      return this.buildPipeRenameRequest(meta);
    } else {
      return {type: RequestKind.DirectFromTypeScript, requestNode};
    }
  }

  private buildPipeRenameRequest(meta: PipeMeta): PipeRenameContext | null {
    if (
      !ts.isClassDeclaration(meta.ref.node) ||
      meta.nameExpr === null ||
      !ts.isStringLiteral(meta.nameExpr)
    ) {
      return null;
    }
    const typeChecker = this.compiler.getCurrentProgram().getTypeChecker();
    const memberMethods = collectMemberMethods(meta.ref.node, typeChecker) ?? [];
    const pipeTransformNode: ts.MethodDeclaration | undefined = memberMethods.find(
      (m) => m.name.getText() === 'transform',
    );
    if (pipeTransformNode === undefined) {
      return null;
    }
    return {
      type: RequestKind.PipeName,
      pipeNameExpr: meta.nameExpr,
      renamePosition: {
        fileName: pipeTransformNode.getSourceFile().fileName,
        position: pipeTransformNode.getStart(),
      },
    };
  }

  private buildSelectorlessRenameRequestFromTemplate(
    symbol: SelectorlessComponentSymbol | SelectorlessDirectiveSymbol,
  ): SelectorlessIdentifierRenameContext | null {
    if (symbol.tsSymbol === null || symbol.tsSymbol.valueDeclaration === undefined) {
      return null;
    }

    const meta = this.compiler.getMeta(symbol.tsSymbol.valueDeclaration);
    if (meta === null || meta.kind !== MetaKind.Directive) {
      return null;
    }

    const nameNode = meta.ref.node.name;
    const templateName =
      symbol.kind === SymbolKind.SelectorlessComponent
        ? symbol.templateNode.componentName
        : symbol.templateNode.name;

    // Do not rename aliased references.
    if (templateName !== nameNode.text) {
      return null;
    }

    return {
      type: RequestKind.SelectorlessIdentifier,
      templateNode: symbol.templateNode,
      identifier: nameNode,
      renamePosition: {
        fileName: meta.ref.node.getSourceFile().fileName,
        position: nameNode.getStart(),
      },
    };
  }
}

/**
 * From the provided `RenameRequest`, determines what text we should expect all produced
 * `ts.RenameLocation`s to have and creates an initial entry for indirect renames (one which is
 * required for the rename operation, but cannot be found by the native TS LS).
 */
function getExpectedRenameTextAndInitialRenameEntries(
  renameRequest: RenameRequest,
): {expectedRenameText: string; entries: ts.RenameLocation[]} | null {
  let expectedRenameText: string;
  const entries: ts.RenameLocation[] = [];
  if (renameRequest.type === RequestKind.DirectFromTypeScript) {
    expectedRenameText = renameRequest.requestNode.getText();
  } else if (renameRequest.type === RequestKind.DirectFromTemplate) {
    const templateNodeText = getRenameTextAndSpanAtPosition(
      renameRequest.requestNode,
      renameRequest.templatePosition,
    );
    if (templateNodeText === null) {
      return null;
    }
    expectedRenameText = templateNodeText.text;
  } else if (renameRequest.type === RequestKind.PipeName) {
    const {pipeNameExpr} = renameRequest;
    expectedRenameText = pipeNameExpr.text;
    const entry: ts.RenameLocation = {
      fileName: renameRequest.pipeNameExpr.getSourceFile().fileName,
      textSpan: {start: pipeNameExpr.getStart() + 1, length: pipeNameExpr.getText().length - 2},
    };
    entries.push(entry);
  } else if (renameRequest.type === RequestKind.SelectorlessIdentifier) {
    const {identifier} = renameRequest;
    expectedRenameText = identifier.text;
    const entry: ts.RenameLocation = {
      fileName: identifier.getSourceFile().fileName,
      textSpan: {start: identifier.getStart(), length: identifier.getWidth()},
    };
    entries.push(entry);
  } else {
    // TODO(atscott): Implement other types of special renames
    return null;
  }

  return {entries, expectedRenameText};
}

/**
 * Given a `RenameRequest`, determines the `FilePosition` to use asking the native TS LS for rename
 * locations.
 */
function getRenameRequestPosition(renameRequest: RenameRequest): FilePosition {
  const fileName =
    renameRequest.type === RequestKind.DirectFromTypeScript
      ? renameRequest.requestNode.getSourceFile().fileName
      : renameRequest.renamePosition.fileName;
  const position =
    renameRequest.type === RequestKind.DirectFromTypeScript
      ? renameRequest.requestNode.getStart()
      : renameRequest.renamePosition.position;
  return {fileName, position};
}
