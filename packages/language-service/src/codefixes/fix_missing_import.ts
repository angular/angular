/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ASTWithName} from '@angular/compiler';
import {ErrorCode as NgCompilerErrorCode, ngErrorCode} from '@angular/compiler-cli/src/ngtsc/diagnostics/index';
import {PotentialDirective, PotentialImportMode, PotentialPipe} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import * as t from '@angular/compiler/src/render3/r3_ast';  // t for template AST
import ts from 'typescript';

import {getTargetAtPosition, TargetNodeKind} from '../template_target';
import {standaloneTraitOrNgModule, updateImportsForAngularTrait, updateImportsForTypescriptFile} from '../ts_utils';
import {getDirectiveMatchesForElementTag} from '../utils';

import {CodeActionContext, CodeActionMeta, FixIdForCodeFixesAll} from './utils';

const errorCodes: number[] = [
  ngErrorCode(NgCompilerErrorCode.SCHEMA_INVALID_ELEMENT),
  ngErrorCode(NgCompilerErrorCode.MISSING_PIPE),
];

/**
 * This code action will generate a new import for an unknown selector.
 */
export const missingImportMeta: CodeActionMeta = {
  errorCodes,
  getCodeActions,
  fixIds: [FixIdForCodeFixesAll.FIX_MISSING_IMPORT],
  // TODO(dylhunn): implement "Fix All"
  getAllCodeActions: ({tsLs, scope, fixId, formatOptions, preferences, compiler, diagnostics}) => {
    return {
      changes: [],
    };
  }
};

function getCodeActions(
    {templateInfo, start, compiler, formatOptions, preferences, errorCode, tsLs}:
        CodeActionContext) {
  let codeActions: ts.CodeFixAction[] = [];
  const checker = compiler.getTemplateTypeChecker();
  const tsChecker = compiler.programDriver.getProgram().getTypeChecker();

  const target = getTargetAtPosition(templateInfo.template, start);
  if (target === null) {
    return [];
  }

  let matches: Set<PotentialDirective>|Set<PotentialPipe>;
  if (target.context.kind === TargetNodeKind.ElementInTagContext &&
      target.context.node instanceof t.Element) {
    const allPossibleDirectives = checker.getPotentialTemplateDirectives(templateInfo.component);
    matches = getDirectiveMatchesForElementTag(target.context.node, allPossibleDirectives);
  } else if (
      target.context.kind === TargetNodeKind.RawExpression &&
      target.context.node instanceof ASTWithName) {
    const name = (target.context.node as any).name;
    const allPossiblePipes = checker.getPotentialPipes(templateInfo.component);
    matches = new Set(allPossiblePipes.filter(p => p.name === name));
  } else {
    return [];
  }

  // Find all possible importable directives with a matching selector.
  const importOn = standaloneTraitOrNgModule(checker, templateInfo.component);
  if (importOn === null) {
    return [];
  }
  for (const currMatch of matches.values()) {
    const currMatchSymbol = currMatch.tsSymbol.valueDeclaration!;
    const potentialImports =
        checker.getPotentialImportsFor(currMatch.ref, importOn, PotentialImportMode.Normal);
    for (const potentialImport of potentialImports) {
      const fileImportChanges: ts.TextChange[] = [];
      let importName: string;
      let forwardRefName: string|null = null;

      if (potentialImport.moduleSpecifier) {
        const [importChanges, generatedImportName] = updateImportsForTypescriptFile(
            tsChecker, importOn.getSourceFile(), potentialImport.symbolName,
            potentialImport.moduleSpecifier, currMatchSymbol.getSourceFile());
        importName = generatedImportName;
        fileImportChanges.push(...importChanges);
      } else {
        if (potentialImport.isForwardReference) {
          // Note that we pass the `importOn` file twice since we know that the potential import
          // is within the same file, because it doesn't have a `moduleSpecifier`.
          const [forwardRefImports, generatedForwardRefName] = updateImportsForTypescriptFile(
              tsChecker, importOn.getSourceFile(), 'forwardRef', '@angular/core',
              importOn.getSourceFile());
          fileImportChanges.push(...forwardRefImports);
          forwardRefName = generatedForwardRefName;
        }
        importName = potentialImport.symbolName;
      }

      // Always update the trait import, although the TS import might already be present.
      const traitImportChanges =
          updateImportsForAngularTrait(checker, importOn, importName, forwardRefName);
      if (traitImportChanges.length === 0) continue;

      let description = `Import ${importName}`;
      if (potentialImport.moduleSpecifier !== undefined) {
        description += ` from '${potentialImport.moduleSpecifier}' on ${importOn.name!.text}`;
      }
      codeActions.push({
        fixName: FixIdForCodeFixesAll.FIX_MISSING_IMPORT,
        description,
        changes: [{
          fileName: importOn.getSourceFile().fileName,
          textChanges: [...fileImportChanges, ...traitImportChanges],
        }]
      });
    }
  }

  return codeActions;
}
