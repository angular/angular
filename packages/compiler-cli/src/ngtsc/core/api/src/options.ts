/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {BazelAndG3Options, I18nOptions, LegacyNgcOptions, MiscOptions, NgcCompatibilityOptions, StrictTemplateOptions} from './public_options';


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
   * Turn on template type-checking in the Ivy compiler.
   *
   * This is an internal flag being used to roll out template type-checking in ngtsc. Turning it on
   * by default before it's ready might break other users attempting to test the new compiler's
   * behavior.
   *
   * @internal
   */
  ivyTemplateTypeCheck?: boolean;

  /**
   * An option to enable ngtsc's internal performance tracing.
   *
   * This should be a path to a JSON file where trace information will be written. An optional 'ts:'
   * prefix will cause the trace to be written via the TS host instead of directly to the filesystem
   * (not all hosts support this mode of operation).
   *
   * This is currently not exposed to users as the trace format is still unstable.
   */
  tracePerformance?: string;
}

/**
 * A merged interface of all of the various Angular compiler options, as well as the standard
 * `ts.CompilerOptions`.
 *
 * Also includes a few miscellaneous options.
 */
export interface NgCompilerOptions extends ts.CompilerOptions, LegacyNgcOptions, BazelAndG3Options,
                                           NgcCompatibilityOptions, StrictTemplateOptions,
                                           TestOnlyOptions, I18nOptions, MiscOptions {}