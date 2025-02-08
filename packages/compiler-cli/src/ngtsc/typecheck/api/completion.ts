/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TmplAstLetDeclaration, TmplAstReference, TmplAstVariable} from '@angular/compiler';

import {TcbLocation} from './symbols';

/**
 * An autocompletion source of any kind.
 */
export type Completion = ReferenceCompletion | VariableCompletion | LetDeclarationCompletion;

/**
 * Discriminant of an autocompletion source (a `Completion`).
 */

export enum CompletionKind {
  Reference,
  Variable,
  LetDeclaration,
}

/**
 * An autocompletion result representing a local reference declared in the template.
 */
export interface ReferenceCompletion {
  kind: CompletionKind.Reference;

  /**
   * The `TmplAstReference` from the template which should be available as a completion.
   */
  node: TmplAstReference;
}

/**
 * An autocompletion result representing a variable declared in the template.
 */
export interface VariableCompletion {
  kind: CompletionKind.Variable;

  /**
   * The `TmplAstVariable` from the template which should be available as a completion.
   */
  node: TmplAstVariable;
}

/**
 * An autocompletion result representing an `@let` declaration in the template.
 */
export interface LetDeclarationCompletion {
  kind: CompletionKind.LetDeclaration;

  /**
   * The `TmplAstLetDeclaration` from the template which should be available as a completion.
   */
  node: TmplAstLetDeclaration;
}

/**
 * Autocompletion data for an expression in the global scope.
 *
 * Global completion is accomplished by merging data from two sources:
 *  * TypeScript completion of the component's class members.
 *  * Local references and variables that are in scope at a given template level.
 */
export interface GlobalCompletion {
  /**
   * A location within the type-checking shim where TypeScript's completion APIs can be used to
   * access completions for the template's component context (component class members).
   */
  componentContext: TcbLocation;

  /**
   * `Map` of local references and variables that are visible at the requested level of the
   * template.
   *
   * Shadowing of references/variables from multiple levels of the template has already been
   * accounted for in the preparation of `templateContext`. Entries here shadow component members of
   * the same name (from the `componentContext` completions).
   */
  templateContext: Map<string, ReferenceCompletion | VariableCompletion | LetDeclarationCompletion>;

  /**
   * A location within the type-checking shim where TypeScript's completion APIs can be used to
   * access completions for the AST node of the cursor position (primitive constants).
   */
  nodeContext: TcbLocation | null;
}
