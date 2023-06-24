/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import type {SemanticVariableKind} from './enums';
import type {XrefId} from './operations';

/**
 * Union type for the different kinds of variables.
 */
export type SemanticVariable = ContextVariable|IdentifierVariable|SavedViewVariable;

export interface SemanticVariableBase {
  kind: SemanticVariableKind;

  /**
   * Name assigned to this variable in generated code, or `null` if not yet assigned.
   */
  name: string|null;
}

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
