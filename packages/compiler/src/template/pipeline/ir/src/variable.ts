/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as o from '../../../../output/output_ast';
import type {SemanticVariableKind} from './enums';
import type {XrefId} from './operations';

/**
 * Union type for the different kinds of variables.
 */
export type SemanticVariable =
  | ContextVariable
  | IdentifierVariable
  | SavedViewVariable
  | AliasVariable;

export interface SemanticVariableBase {
  kind: SemanticVariableKind;

  /**
   * Name assigned to this variable in generated code, or `null` if not yet assigned.
   */
  name: string | null;
}

/**
 * When referenced in the template's context parameters, this indicates a reference to the entire
 * context object, rather than a specific parameter.
 */
export const CTX_REF = 'CTX_REF_MARKER';

/**
 * A variable that represents the context of a particular view.
 */
export interface ContextVariable extends SemanticVariableBase {
  kind: SemanticVariableKind.Context;

  /**
   * `XrefId` of the view that this variable represents.
   */
  view: XrefId;
}

/**
 * A variable that represents a specific identifier within a template.
 */
export interface IdentifierVariable extends SemanticVariableBase {
  kind: SemanticVariableKind.Identifier;

  /**
   * The identifier whose value in the template is tracked in this variable.
   */
  identifier: string;

  /**
   * Whether the variable was declared locally within the same view or somewhere else.
   */
  local: boolean;
}

/**
 * A variable that represents a saved view context.
 */
export interface SavedViewVariable extends SemanticVariableBase {
  kind: SemanticVariableKind.SavedView;

  /**
   * The view context saved in this variable.
   */
  view: XrefId;
}

/**
 * A variable that will be inlined at every location it is used. An alias is also allowed to depend
 * on the value of a semantic variable.
 */
export interface AliasVariable extends SemanticVariableBase {
  kind: SemanticVariableKind.Alias;
  identifier: string;
  expression: o.Expression;
}
