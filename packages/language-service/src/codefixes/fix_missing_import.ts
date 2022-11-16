/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ErrorCode as NgCompilerErrorCode, ngErrorCode} from '@angular/compiler-cli/src/ngtsc/diagnostics/index';
import {PotentialDirective, PotentialImport, TemplateTypeChecker} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import * as t from '@angular/compiler/src/render3/r3_ast';  // t for template AST
import ts from 'typescript';

import {getTargetAtPosition, TargetNodeKind} from '../template_target';
import {standaloneTraitOrNgModule, updateImportsForAngularTrait, updateImportsForTypescriptFile} from '../ts_utils';
import {getDirectiveMatchesForElementTag} from '../utils';

import {CodeActionContext, CodeActionMeta, FixIdForCodeFixesAll} from './utils';

const errorCodes: number[] = [
  ngErrorCode(NgCompilerErrorCode.SCHEMA_INVALID_ELEMENT),
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

  // The error must be an invalid element in tag, which is interpreted as an intended selector.
  const target = getTargetAtPosition(templateInfo.template, start);
  if (target === null || target.context.kind !== TargetNodeKind.ElementInTagContext ||
      target.context.node instanceof t.Template) {
    return [];
  }
  const missingElement = target.context.node;

  const importOn = standaloneTraitOrNgModule(checker, templateInfo.component);
  if (importOn === null) {
    return [];
  }

  // Find all possible importable directives with a matching selector.
  const allPossibleDirectives = checker.getPotentialTemplateDirectives(templateInfo.component);
  const matchingDirectives =
      getDirectiveMatchesForElementTag(missingElement, allPossibleDirectives);
  const matches = matchingDirectives.values();

  for (let currMatch of matches) {
    const currMatchSymbol = currMatch.tsSymbol.valueDeclaration;
    const potentialImports = checker.getPotentialImportsFor(currMatch, importOn);
    for (let potentialImport of potentialImports) {
      let [fileImportChanges, importName] = updateImportsForTypescriptFile(
          tsChecker, importOn.getSourceFile(), potentialImport, currMatchSymbol.getSourceFile());
      let traitImportChanges = updateImportsForAngularTrait(checker, importOn, importName);
      // All quick fixes should always update the trait import; however, the TypeScript import might
      // already be present.
      if (traitImportChanges.length === 0) {
        continue;
      }

      // Create a code action for this import.
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
