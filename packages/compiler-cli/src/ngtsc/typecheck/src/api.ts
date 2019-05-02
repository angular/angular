/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BoundTarget, DirectiveMeta} from '@angular/compiler';
import * as ts from 'typescript';

import {Reference} from '../../imports';
import {TemplateGuardMeta} from '../../metadata';
import {ClassDeclaration} from '../../reflection';

/**
 * Extension of `DirectiveMeta` that includes additional information required to type-check the
 * usage of a particular directive.
 */
export interface TypeCheckableDirectiveMeta extends DirectiveMeta {
  ref: Reference<ClassDeclaration>;
  queries: string[];
  ngTemplateGuards: TemplateGuardMeta[];
  hasNgTemplateContextGuard: boolean;
}

/**
 * Metadata required in addition to a component class in order to generate a type check block (TCB)
 * for that component.
 */
export interface TypeCheckBlockMetadata {
  /**
   * Semantic information about the template of the component.
   */
  boundTarget: BoundTarget<TypeCheckableDirectiveMeta>;

  /*
   * Pipes used in the template of the component.
   */
  pipes: Map<string, Reference<ClassDeclaration<ts.ClassDeclaration>>>;
}

export interface TypeCtorMetadata {
  /**
   * The name of the requested type constructor function.
   */
  fnName: string;

  /**
   * Whether to generate a body for the function or not.
   */
  body: boolean;

  /**
   * Input, output, and query field names in the type which should be included as constructor input.
   */
  fields: {inputs: string[]; outputs: string[]; queries: string[];};
}

export interface TypeCheckingConfig {
  /**
   * Whether to check the left-hand side type of binding operations.
   *
   * For example, if this is `false` then the expression `[input]="expr"` will have `expr` type-
   * checked, but not the assignment of the resulting type to the `input` property of whichever
   * directive or component is receiving the binding. If set to `true`, both sides of the assignment
   * are checked.
   */
  checkTypeOfBindings: boolean;

  /**
   * Whether to include type information from pipes in the type-checking operation.
   *
   * If this is `true`, then the pipe's type signature for `transform()` will be used to check the
   * usage of the pipe. If this is `false`, then the result of applying a pipe will be `any`, and
   * the types of the pipe's value and arguments will not be matched against the `transform()`
   * method.
   */
  checkTypeOfPipes: boolean;

  /**
   * Whether to narrow the types of template contexts.
   */
  applyTemplateContextGuards: boolean;

  /**
   * Whether to use a strict type for null-safe navigation operations.
   *
   * If this is `false`, then the return type of `a?.b` or `a?()` will be `any`. If set to `true`,
   * then the return type of `a?.b` for example will be the same as the type of the ternary
   * expression `a != null ? a.b : a`.
   */
  strictSafeNavigationTypes: boolean;

  /**
   * Whether to descend into template bodies and check any bindings there.
   */
  checkTemplateBodies: boolean;

  /**
   * Whether to check resolvable queries.
   *
   * This is currently an unsupported feature.
   */
  checkQueries: false;
}
