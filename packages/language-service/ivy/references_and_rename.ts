/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AST, TmplAstNode} from '@angular/compiler';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import {absoluteFrom} from '@angular/compiler-cli/src/ngtsc/file_system';
import {PerfPhase} from '@angular/compiler-cli/src/ngtsc/perf';
import {ProgramDriver} from '@angular/compiler-cli/src/ngtsc/program_driver';
import * as ts from 'typescript';

import {convertToTemplateDocumentSpan, createLocationKey, getRenameTextAndSpanAtPosition, getTargetDetailsAtTemplatePosition} from './references_and_rename_utils';
import {findTightestNode} from './ts_utils';
import {getTemplateInfoAtPosition, TemplateInfo} from './utils';

export class ReferencesBuilder {
  private readonly ttc = this.compiler.getTemplateTypeChecker();

  constructor(
      private readonly driver: ProgramDriver, private readonly tsLS: ts.LanguageService,
      private readonly compiler: NgCompiler) {}

  getReferencesAtPosition(filePath: string, position: number): ts.ReferenceEntry[]|undefined {
    this.ttc.generateAllTypeCheckBlocks();
    const templateInfo = getTemplateInfoAtPosition(filePath, position, this.compiler);
    if (templateInfo === undefined) {
      return this.getReferencesAtTypescriptPosition(filePath, position);
    }
    return this.getReferencesAtTemplatePosition(templateInfo, position);
  }

  private getReferencesAtTemplatePosition(templateInfo: TemplateInfo, position: number):
      ts.ReferenceEntry[]|undefined {
    const allTargetDetails = getTargetDetailsAtTemplatePosition(templateInfo, position, this.ttc);
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

  private getReferencesAtTypescriptPosition(fileName: string, position: number):
      ts.ReferenceEntry[]|undefined {
    const refs = this.tsLS.getReferencesAtPosition(fileName, position);
    if (refs === undefined) {
      return undefined;
    }

    const entries: Map<string, ts.ReferenceEntry> = new Map();
    for (const ref of refs) {
      if (this.ttc.isTrackedTypeCheckFile(absoluteFrom(ref.fileName))) {
        const entry = convertToTemplateDocumentSpan(ref, this.ttc, this.driver.getProgram());
        if (entry !== null) {
          entries.set(createLocationKey(entry), entry);
        }
      } else {
        entries.set(createLocationKey(ref), ref);
      }
    }
    return Array.from(entries.values());
  }
}

enum RequestKind {
  Template,
  TypeScript,
}

interface TemplateRequest {
  kind: RequestKind.Template;
  requestNode: TmplAstNode|AST;
  position: number;
}

interface TypeScriptRequest {
  kind: RequestKind.TypeScript;
  requestNode: ts.Node;
}

type RequestOrigin = TemplateRequest|TypeScriptRequest;


export class RenameBuilder {
  private readonly ttc = this.compiler.getTemplateTypeChecker();

  constructor(
      private readonly driver: ProgramDriver, private readonly tsLS: ts.LanguageService,
      private readonly compiler: NgCompiler) {}

  getRenameInfo(filePath: string, position: number):
      Omit<ts.RenameInfoSuccess, 'kind'|'kindModifiers'>|ts.RenameInfoFailure {
    return this.compiler.perfRecorder.inPhase(PerfPhase.LsReferencesAndRenames, () => {
      const templateInfo = getTemplateInfoAtPosition(filePath, position, this.compiler);
      // We could not get a template at position so we assume the request came from outside the
      // template.
      if (templateInfo === undefined) {
        return this.tsLS.getRenameInfo(filePath, position);
      }

      const allTargetDetails = getTargetDetailsAtTemplatePosition(templateInfo, position, this.ttc);
      if (allTargetDetails === null) {
        return {
          canRename: false,
          localizedErrorMessage: 'Could not find template node at position.'
        };
      }
      const {templateTarget} = allTargetDetails[0];
      const templateTextAndSpan = getRenameTextAndSpanAtPosition(
          templateTarget,
          position,
      );
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

  findRenameLocations(filePath: string, position: number): readonly ts.RenameLocation[]|undefined {
    this.ttc.generateAllTypeCheckBlocks();
    return this.compiler.perfRecorder.inPhase(PerfPhase.LsReferencesAndRenames, () => {
      const templateInfo = getTemplateInfoAtPosition(filePath, position, this.compiler);
      // We could not get a template at position so we assume the request came from outside the
      // template.
      if (templateInfo === undefined) {
        const requestNode = this.getTsNodeAtPosition(filePath, position);
        if (requestNode === null) {
          return undefined;
        }
        const requestOrigin: TypeScriptRequest = {kind: RequestKind.TypeScript, requestNode};
        return this.findRenameLocationsAtTypescriptPosition(filePath, position, requestOrigin);
      }

      return this.findRenameLocationsAtTemplatePosition(templateInfo, position);
    });
  }

  private findRenameLocationsAtTemplatePosition(templateInfo: TemplateInfo, position: number):
      readonly ts.RenameLocation[]|undefined {
    const allTargetDetails = getTargetDetailsAtTemplatePosition(templateInfo, position, this.ttc);
    if (allTargetDetails === null) {
      return undefined;
    }

    const allRenameLocations: ts.RenameLocation[] = [];
    for (const targetDetails of allTargetDetails) {
      const requestOrigin: TemplateRequest = {
        kind: RequestKind.Template,
        requestNode: targetDetails.templateTarget,
        position,
      };

      for (const location of targetDetails.typescriptLocations) {
        const locations = this.findRenameLocationsAtTypescriptPosition(
            location.fileName, location.position, requestOrigin);
        // If we couldn't find rename locations for _any_ result, we should not allow renaming to
        // proceed instead of having a partially complete rename.
        if (locations === undefined) {
          return undefined;
        }
        allRenameLocations.push(...locations);
      }
    }
    return allRenameLocations.length > 0 ? allRenameLocations : undefined;
  }

  findRenameLocationsAtTypescriptPosition(
      filePath: string, position: number,
      requestOrigin: RequestOrigin): readonly ts.RenameLocation[]|undefined {
    return this.compiler.perfRecorder.inPhase(PerfPhase.LsReferencesAndRenames, () => {
      let originalNodeText: string;
      if (requestOrigin.kind === RequestKind.TypeScript) {
        originalNodeText = requestOrigin.requestNode.getText();
      } else {
        const templateNodeText =
            getRenameTextAndSpanAtPosition(requestOrigin.requestNode, requestOrigin.position);
        if (templateNodeText === null) {
          return undefined;
        }
        originalNodeText = templateNodeText.text;
      }

      const locations = this.tsLS.findRenameLocations(
          filePath, position, /*findInStrings*/ false, /*findInComments*/ false);
      if (locations === undefined) {
        return undefined;
      }

      const entries: Map<string, ts.RenameLocation> = new Map();
      for (const location of locations) {
        // TODO(atscott): Determine if a file is a shim file in a more robust way and make the API
        // available in an appropriate location.
        if (this.ttc.isTrackedTypeCheckFile(absoluteFrom(location.fileName))) {
          const entry = convertToTemplateDocumentSpan(
              location, this.ttc, this.driver.getProgram(), originalNodeText);
          // There is no template node whose text matches the original rename request. Bail on
          // renaming completely rather than providing incomplete results.
          if (entry === null) {
            return undefined;
          }
          entries.set(createLocationKey(entry), entry);
        } else {
          // Ensure we only allow renaming a TS result with matching text
          const refNode = this.getTsNodeAtPosition(location.fileName, location.textSpan.start);
          if (refNode === null || refNode.getText() !== originalNodeText) {
            return undefined;
          }
          entries.set(createLocationKey(location), location);
        }
      }
      return Array.from(entries.values());
    });
  }

  private getTsNodeAtPosition(filePath: string, position: number): ts.Node|null {
    const sf = this.driver.getProgram().getSourceFile(filePath);
    if (!sf) {
      return null;
    }
    return findTightestNode(sf, position) ?? null;
  }
}