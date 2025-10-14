/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Specifies the compilation mode that is used for the compilation.
 */
export var CompilationMode;
(function (CompilationMode) {
  /**
   * Generates fully AOT compiled code using Ivy instructions.
   */
  CompilationMode[(CompilationMode['FULL'] = 0)] = 'FULL';
  /**
   * Generates code using a stable, but intermediate format suitable to be published to NPM.
   */
  CompilationMode[(CompilationMode['PARTIAL'] = 1)] = 'PARTIAL';
  /**
   * Generates code based on each individual source file without using its
   * dependencies (suitable for local dev edit/refresh workflow).
   */
  CompilationMode[(CompilationMode['LOCAL'] = 2)] = 'LOCAL';
})(CompilationMode || (CompilationMode = {}));
export var HandlerPrecedence;
(function (HandlerPrecedence) {
  /**
   * Handler with PRIMARY precedence cannot overlap - there can only be one on a given class.
   *
   * If more than one PRIMARY handler matches a class, an error is produced.
   */
  HandlerPrecedence[(HandlerPrecedence['PRIMARY'] = 0)] = 'PRIMARY';
  /**
   * Handlers with SHARED precedence can match any class, possibly in addition to a single PRIMARY
   * handler.
   *
   * It is not an error for a class to have any number of SHARED handlers.
   */
  HandlerPrecedence[(HandlerPrecedence['SHARED'] = 1)] = 'SHARED';
  /**
   * Handlers with WEAK precedence that match a class are ignored if any handlers with stronger
   * precedence match a class.
   */
  HandlerPrecedence[(HandlerPrecedence['WEAK'] = 2)] = 'WEAK';
})(HandlerPrecedence || (HandlerPrecedence = {}));
//# sourceMappingURL=api.js.map
