/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ASTWithName, TmplAstElement} from '@angular/compiler';
import {
  ErrorCode as NgCompilerErrorCode,
  ngErrorCode,
  PotentialDirective,
  PotentialPipe,
} from '@angular/compiler-cli';
import ts from 'typescript';

import {getTargetAtPosition, TargetNodeKind} from '../template_target';
import {getDirectiveMatchesForElementTag} from '../utils';
import {
  getCodeActionToImportTheDirectiveDeclaration,
  getModuleSpecifierFromImportStatement,
  standaloneTraitOrNgModule,
} from '../utils/ts_utils';

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
  },
};

function getCodeActions({typeCheckInfo, start, compiler, tsLs, preferences}: CodeActionContext) {
  if (typeCheckInfo === null) {
    return [];
  }

  let codeActions: ts.CodeFixAction[] = [];
  const checker = compiler.getTemplateTypeChecker();
  const target = getTargetAtPosition(typeCheckInfo.nodes, start);
  if (target === null) {
    return [];
  }

  let matches: Set<PotentialDirective> | Set<PotentialPipe>;
  if (
    target.context.kind === TargetNodeKind.ElementInTagContext &&
    target.context.node instanceof TmplAstElement
  ) {
    const allPossibleDirectives = checker.getPotentialTemplateDirectives(
      typeCheckInfo.declaration,
      tsLs,
      {
        includeExternalModule: preferences.includeCompletionsForModuleExports ?? false,
      },
    );
    matches = getDirectiveMatchesForElementTag(target.context.node, allPossibleDirectives);
  } else if (
    target.context.kind === TargetNodeKind.RawExpression &&
    target.context.node instanceof ASTWithName
  ) {
    const name = (target.context.node as any).name;
    const allPossiblePipes = checker.getPotentialPipes(typeCheckInfo.declaration);
    matches = new Set(allPossiblePipes.filter((p) => p.name === name));
  } else {
    return [];
  }

  // Find all possible importable directives with a matching selector.
  const importOn = standaloneTraitOrNgModule(checker, typeCheckInfo.declaration);
  if (importOn === null) {
    return [];
  }
  for (const currMatch of matches.values()) {
    let moduleSpecifier: string | undefined;
    if (!currMatch.isInScope) {
      moduleSpecifier = getModuleSpecifierFromImportStatement(
        currMatch,
        checker,
        typeCheckInfo.declaration,
        tsLs,
        currMatch.tsCompletionEntryInfo?.tsCompletionEntryData,
        preferences.includeCompletionsForModuleExports,
      );
    }
    const currentMatchCodeAction =
      getCodeActionToImportTheDirectiveDeclaration(
        compiler,
        importOn,
        currMatch,
        moduleSpecifier !== undefined && currMatch.tsCompletionEntryInfo !== null
          ? {
              moduleSpecifier,
              symbolFileName: currMatch.tsCompletionEntryInfo.tsCompletionEntrySymbolFileName,
            }
          : null,
      ) ?? [];

    codeActions.push(
      ...currentMatchCodeAction.map<ts.CodeFixAction>((action) => {
        return {
          fixName: FixIdForCodeFixesAll.FIX_MISSING_IMPORT,
          ...action,
        };
      }),
    );
  }

  return codeActions;
}
