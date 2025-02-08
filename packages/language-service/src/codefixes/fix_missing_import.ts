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
} from '@angular/compiler-cli/src/ngtsc/diagnostics/index';
import {
  PotentialDirective,
  PotentialImportMode,
  PotentialPipe,
} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import ts from 'typescript';

import {getTargetAtPosition, TargetNodeKind} from '../template_target';
import {
  getCodeActionToImportTheDirectiveDeclaration,
  standaloneTraitOrNgModule,
} from '../utils/ts_utils';
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
  },
};

function getCodeActions({templateInfo, start, compiler}: CodeActionContext) {
  if (templateInfo === null) {
    return [];
  }

  let codeActions: ts.CodeFixAction[] = [];
  const checker = compiler.getTemplateTypeChecker();
  const target = getTargetAtPosition(templateInfo.template, start);
  if (target === null) {
    return [];
  }

  let matches: Set<PotentialDirective> | Set<PotentialPipe>;
  if (
    target.context.kind === TargetNodeKind.ElementInTagContext &&
    target.context.node instanceof TmplAstElement
  ) {
    const allPossibleDirectives = checker.getPotentialTemplateDirectives(templateInfo.component);
    matches = getDirectiveMatchesForElementTag(target.context.node, allPossibleDirectives);
  } else if (
    target.context.kind === TargetNodeKind.RawExpression &&
    target.context.node instanceof ASTWithName
  ) {
    const name = (target.context.node as any).name;
    const allPossiblePipes = checker.getPotentialPipes(templateInfo.component);
    matches = new Set(allPossiblePipes.filter((p) => p.name === name));
  } else {
    return [];
  }

  // Find all possible importable directives with a matching selector.
  const importOn = standaloneTraitOrNgModule(checker, templateInfo.component);
  if (importOn === null) {
    return [];
  }
  for (const currMatch of matches.values()) {
    const currentMatchCodeAction =
      getCodeActionToImportTheDirectiveDeclaration(compiler, importOn, currMatch) ?? [];

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
