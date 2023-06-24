/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {AbsoluteFsPath} from '../../../file_system';

import {ExtendedTsCompilerHost, UnifiedModulesHost} from './interfaces';

/**
 * Names of methods from `ExtendedTsCompilerHost` that need to be provided by the
 * `NgCompilerAdapter`.
 */
export type ExtendedCompilerHostMethods =
    // Used to normalize filenames for the host system. Important for proper case-sensitive file
    // handling.
    'getCanonicalFileName'|
    // An optional method of `ts.CompilerHost` where an implementer can override module resolution.
    'resolveModuleNames'|
    // Retrieve the current working directory. Unlike in `ts.ModuleResolutionHost`, this is a
    // required method.
    'getCurrentDirectory'|
    // Additional methods of `ExtendedTsCompilerHost` related to resource files (e.g. HTML
    // templates). These are optional.
    'getModifiedResourceFiles'|'readResource'|'resourceNameToFileName'|'transformResource';

/**
 * Adapter for `NgCompiler` that allows it to be used in various circumstances, such as
 * command-line `ngc`, as a plugin to `ts_library` in Bazel, or from the Language Service.
 *
 * `NgCompilerAdapter` is a subset of the `NgCompilerHost` implementation of `ts.CompilerHost`
 * which is relied upon by `NgCompiler`. A consumer of `NgCompiler` can therefore use the
 * `NgCompilerHost` or implement `NgCompilerAdapter` itself.
 */
export interface NgCompilerAdapter extends
    // getCurrentDirectory is removed from `ts.ModuleResolutionHost` because it's optional, and
    // incompatible with the `ts.CompilerHost` version which isn't. The combination of these two
    // still satisfies `ts.ModuleResolutionHost`.
        Omit<ts.ModuleResolutionHost, 'getCurrentDirectory'>,
    Pick<ExtendedTsCompilerHost, 'getCurrentDirectory'|ExtendedCompilerHostMethods>,
    SourceFileTypeIdentifier {
  /**
   * A path to a single file which represents the entrypoint of an Angular Package Format library,
   * if the current program is one.
   *
   * This is used to emit a flat module index if requested, and can be left `null` if that is not
   * required.
   */
  readonly entryPoint: AbsoluteFsPath|null;

  /**
   * An array of `ts.Diagnostic`s that occurred during construction of the `ts.Program`.
   */
  readonly constructionDiagnostics: ts.Diagnostic[];

  /**
   * A `Set` of `ts.SourceFile`s which are internal to the program and should not be emitted as JS
   * files.
   *
   * Often these are shim files such as `ngtypecheck` shims used for template type-checking in
   * command-line ngc.
   */
  readonly ignoreForEmit: Set<ts.SourceFile>;

  /**
   * A specialized interface provided in some environments (such as Bazel) which overrides how
   * import specifiers are generated.
   *
   * If not required, this can be `null`.
   */
  readonly unifiedModulesHost: UnifiedModulesHost|null;

  /**
   * Resolved list of root directories explicitly set in, or inferred from, the tsconfig.
   */
  readonly rootDirs: ReadonlyArray<AbsoluteFsPath>;
}

export interface SourceFileTypeIdentifier {
  /**
   * Distinguishes between shim files added by Angular to the compilation process (both those
   * intended for output, like ngfactory files, as well as internal shims like ngtypecheck files)
   * and original files in the user's program.
   *
   * This is mostly used to limit type-checking operations to only user files. It should return
   * `true` if a file was written by the user, and `false` if a file was added by the compiler.
   */
  isShim(sf: ts.SourceFile): boolean;

  /**
   * Distinguishes between resource files added by Angular to the project and original files in the
   * user's program.
   *
   * This is necessary only for the language service because it adds resource files as root files
   * when they are read. This is done to indicate to TS Server that these resources are part of the
   * project and ensures that projects are retained properly when navigating around the workspace.
   */
  isResource(sf: ts.SourceFile): boolean;
}
