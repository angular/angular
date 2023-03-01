/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {BazelAndG3Options, DiagnosticOptions, I18nOptions, LegacyNgcOptions, MiscOptions, StrictTemplateOptions, TargetOptions} from './public_options';


/**
 * Non-public options which are useful during testing of the compiler.
 */
export interface TestOnlyOptions {
  /**
   * Whether to use the CompilerHost's fileNameToModuleName utility (if available) to generate
   * import module specifiers. This is false by default, and exists to support running ngtsc
   * within Google. This option is internal and is used by the ng_module.bzl rule to switch
   * behavior between Bazel and Blaze.
   *
   * @internal
   */
  _useHostForImportGeneration?: boolean;

  /**
   * Enable the Language Service APIs for template type-checking for tests.
   */
  _enableTemplateTypeChecker?: boolean;

  /**
   * An option to enable ngtsc's internal performance tracing.
   *
   * This should be a path to a JSON file where trace information will be written. This is sensitive
   * to the compiler's working directory, and should likely be an absolute path.
   *
   * This is currently not exposed to users as the trace format is still unstable.
   */
  tracePerformance?: string;
}

/**
 * Internal only options for compiler.
 */
export interface InternalOptions {}

/**
 * A merged interface of all of the various Angular compiler options, as well as the standard
 * `ts.CompilerOptions`.
 *
 * Also includes a few miscellaneous options.
 */
export interface NgCompilerOptions extends ts.CompilerOptions, LegacyNgcOptions, BazelAndG3Options,
                                           DiagnosticOptions, StrictTemplateOptions,
                                           TestOnlyOptions, I18nOptions, TargetOptions,
                                           InternalOptions, MiscOptions {
  // Replace the index signature type from `ts.CompilerOptions` as it is more strict than it needs
  // to be and would conflict with some types from the other interfaces. This is ok because Angular
  // compiler options are actually separate from TS compiler options in the `tsconfig.json` and we
  // have full control over the structure of Angular's compiler options.
  [prop: string]: any;
}
