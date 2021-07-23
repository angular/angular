/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TmplAstNode} from '@angular/compiler';
import * as ts from 'typescript';

import {ErrorCode} from '../../../diagnostics';
import {TemplateTypeChecker} from '../../api';

/**
 * A `ts.Diangostic` with a specific error code.
 */
export type TemplateDiagnostic<T extends ErrorCode> = ts.Diagnostic&{code: T};

/**
 * A Template Check receives information about the template it's checking and returns
 * information about the diagnostics to be generated.
 */
export interface TemplateCheck<T extends ErrorCode> {
  /** Unique template check code, used for configuration and searching the error. */
  code: T;

  /** Runs check and returns information about the diagnostics to be generated. */
  run(ctx: TemplateContext, template: TmplAstNode[]): TemplateDiagnostic<T>[];
}

/**
 * The TemplateContext provided to a Template Check to get diagnostic information.
 */
export interface TemplateContext {
  /** Interface that provides information about template nodes. */
  templateTypeChecker: TemplateTypeChecker;

  /**
   * TypeScript interface that provides type information about symbols that appear
   * in the template (it is not to query types outside the Angular component).
   */
  typeChecker: ts.TypeChecker;

  /** The `@Component()` class from which the template was obtained. */
  component: ts.ClassDeclaration;
}
