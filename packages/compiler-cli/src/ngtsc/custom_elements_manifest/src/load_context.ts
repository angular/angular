/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {NgCompilerAdapter} from '../../core/api';
import {AbsoluteFsPath} from '../../file_system';

/**
 * How manifest warnings are reported: `'summary'`, the default, combines warnings of the same kind
 * for each manifest, and `'verbose'` reports each one.
 */
export type CustomElementsManifestsDiagnosticsMode = 'summary' | 'verbose';

/** Compiler inputs for loading manifests. A load doesn't change them. */
export interface ManifestTypeEnvironment {
  readonly basePath: AbsoluteFsPath;
  readonly options: ts.CompilerOptions;
  readonly adapter: NgCompilerAdapter;
  readonly moduleResolutionCache: ts.ModuleResolutionCache | null;
  /** Module resolution cache for type validation, used only within one load. */
  readonly typeModuleResolutionCache: ts.ModuleResolutionCache;
  readonly program: ts.Program;
  readonly typeEnvironmentFiles: readonly ts.SourceFile[];
  readonly programTypeEnvironment: ProgramTypeEnvironment;
}

/** Dependencies recorded while loading manifests and validating their types. */
export interface ManifestDependencies {
  readonly manifestPaths: Set<AbsoluteFsPath>;
  readonly cacheDependencyPaths: Set<AbsoluteFsPath>;
  readonly globalTypeAvailability: Map<string, boolean>;
}

/** The inputs of a manifest load, and the dependencies it records. */
export interface ManifestLoadContext {
  readonly environment: ManifestTypeEnvironment;
  readonly dependencies: ManifestDependencies;
}

export interface ProgramTypeEnvironment {
  /** Whether TypeScript loaded at least one of the program's configured default library files. */
  hasDefaultLibrary: boolean;

  /** Whether the program is a project-references root with no source files of its own. */
  isSolutionStyleRoot: boolean;
}

/** Whether a global type exists in the consuming program. */
export function globalTypeIsAvailable(typeChecker: ts.TypeChecker, name: string): boolean {
  return typeChecker.resolveName(name, undefined, ts.SymbolFlags.Type, false) !== undefined;
}

/**
 * The program files that declare global types: scripts, and modules with `declare global` or
 * `declare module` blocks. Type validation includes these but not the application's other modules.
 */
export function getTypeEnvironmentFiles(
  program: ts.Program,
  adapter: NgCompilerAdapter,
): ts.SourceFile[] {
  return program
    .getSourceFiles()
    .filter(
      (file) =>
        !adapter.isShim(file) &&
        !adapter.isResource(file) &&
        (file.flags & ts.NodeFlags.JsonFile) === 0 &&
        (!ts.isExternalModule(file) ||
          file.statements.some(
            (statement) =>
              ts.isModuleDeclaration(statement) &&
              ((statement.flags & ts.NodeFlags.GlobalAugmentation) !== 0 ||
                ts.isStringLiteral(statement.name)),
          )),
    );
}
