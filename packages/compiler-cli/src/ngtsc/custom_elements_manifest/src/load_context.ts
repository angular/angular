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
 * Controls manifest warnings. The default, `'summary'`, groups warnings of the same kind per
 * manifest with a count and examples. `'verbose'` reports each declaration or reference.
 */
export type CustomElementsManifestsDiagnosticsMode = 'summary' | 'verbose';

/** Immutable compiler inputs shared by manifest type validation programs. */
export interface ManifestTypeEnvironment {
  readonly basePath: AbsoluteFsPath;
  readonly options: ts.CompilerOptions;
  readonly adapter: NgCompilerAdapter;
  readonly moduleResolutionCache: ts.ModuleResolutionCache | null;
  /** Shared only within this load, including transitive imports and package metadata. */
  readonly typeModuleResolutionCache: ts.ModuleResolutionCache;
  readonly program: ts.Program;
  readonly typeEnvironmentFiles: readonly ts.SourceFile[];
  readonly programTypeEnvironment: ProgramTypeEnvironment;
}

/** Dependencies accumulated while loading manifests and validating their types. */
export interface ManifestDependencies {
  readonly manifestPaths: Set<AbsoluteFsPath>;
  readonly cacheDependencyPaths: Set<AbsoluteFsPath>;
  readonly globalTypeAvailability: Map<string, boolean>;
}

/** Keeps compiler inputs separate from the dependency tracker that this load updates. */
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

/** Selects ambient declarations without pulling unrelated application modules into validation. */
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
