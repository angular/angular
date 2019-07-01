/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Expression, ExternalExpr, ExternalReference, WrappedNodeExpr} from '@angular/compiler';
import * as ts from 'typescript';
import {LogicalFileSystem, LogicalProjectPath, absoluteFrom} from '../../file_system';
import {ReflectionHost} from '../../reflection';
import {getSourceFile, getSourceFileOrNull, isDeclaration, nodeNameForError, resolveModuleName} from '../../util/src/typescript';
import {findExportedNameOfNode} from './find_export';
import {ImportMode, Reference} from './references';

/**
 * A host which supports an operation to convert a file name into a module name.
 *
 * This operation is typically implemented as part of the compiler host passed to ngtsc when running
 * under a build tool like Bazel or Blaze.
 */
export interface FileToModuleHost {
  fileNameToModuleName(importedFilePath: string, containingFilePath: string): string;
}

/**
 * A particular strategy for generating an expression which refers to a `Reference`.
 *
 * There are many potential ways a given `Reference` could be referred to in the context of a given
 * file. A local declaration could be available, the `Reference` could be importable via a relative
 * import within the project, or an absolute import into `node_modules` might be necessary.
 *
 * Different `ReferenceEmitStrategy` implementations implement specific logic for generating such
 * references. A single strategy (such as using a local declaration) may not always be able to
 * generate an expression for every `Reference` (for example, if no local identifier is available),
 * and may return `null` in such a case.
 */
export interface ReferenceEmitStrategy {
  /**
   * Emit an `Expression` which refers to the given `Reference` in the context of a particular
   * source file, if possible.
   *
   * @param ref the `Reference` for which to generate an expression
   * @param context the source file in which the `Expression` must be valid
   * @param importMode a flag which controls whether imports should be generated or not
   * @returns an `Expression` which refers to the `Reference`, or `null` if none can be generated
   */
  emit(ref: Reference, context: ts.SourceFile, importMode: ImportMode): Expression|null;
}

/**
 * Generates `Expression`s which refer to `Reference`s in a given context.
 *
 * A `ReferenceEmitter` uses one or more `ReferenceEmitStrategy` implementations to produce an
 * `Expression` which refers to a `Reference` in the context of a particular file.
 */
export class ReferenceEmitter {
  constructor(private strategies: ReferenceEmitStrategy[]) {}

  emit(
      ref: Reference, context: ts.SourceFile,
      importMode: ImportMode = ImportMode.UseExistingImport): Expression {
    for (const strategy of this.strategies) {
      const emitted = strategy.emit(ref, context, importMode);
      if (emitted !== null) {
        return emitted;
      }
    }
    throw new Error(
        `Unable to write a reference to ${nodeNameForError(ref.node)} in ${ref.node.getSourceFile().fileName} from ${context.fileName}`);
  }
}

/**
 * A `ReferenceEmitStrategy` which will refer to declarations by any local `ts.Identifier`s, if
 * such identifiers are available.
 */
export class LocalIdentifierStrategy implements ReferenceEmitStrategy {
  emit(ref: Reference<ts.Node>, context: ts.SourceFile, importMode: ImportMode): Expression|null {
    // If the emitter has specified ForceNewImport, then LocalIdentifierStrategy should not use a
    // local identifier at all, *except* in the source file where the node is actually declared.
    if (importMode === ImportMode.ForceNewImport &&
        getSourceFile(ref.node) !== getSourceFile(context)) {
      return null;
    }

    // A Reference can have multiple identities in different files, so it may already have an
    // Identifier in the requested context file.
    const identifier = ref.getIdentityIn(context);
    if (identifier !== null) {
      return new WrappedNodeExpr(identifier);
    } else {
      return null;
    }
  }
}

/**
 * A `ReferenceEmitStrategy` which will refer to declarations that come from `node_modules` using
 * an absolute import.
 *
 * Part of this strategy involves looking at the target entry point and identifying the exported
 * name of the targeted declaration, as it might be different from the declared name (e.g. a
 * directive might be declared as FooDirImpl, but exported as FooDir). If no export can be found
 * which maps back to the original directive, an error is thrown.
 */
export class AbsoluteModuleStrategy implements ReferenceEmitStrategy {
  /**
   * A cache of the exports of specific modules, because resolving a module to its exports is a
   * costly operation.
   */
  private moduleExportsCache = new Map<string, Map<ts.Declaration, string>|null>();

  constructor(
      protected program: ts.Program, protected checker: ts.TypeChecker,
      protected options: ts.CompilerOptions, protected host: ts.CompilerHost,
      private reflectionHost: ReflectionHost) {}

  emit(ref: Reference<ts.Node>, context: ts.SourceFile, importMode: ImportMode): Expression|null {
    if (ref.bestGuessOwningModule === null) {
      // There is no module name available for this Reference, meaning it was arrived at via a
      // relative path.
      return null;
    } else if (!isDeclaration(ref.node)) {
      // It's not possible to import something which isn't a declaration.
      throw new Error('Debug assert: importing a Reference to non-declaration?');
    }

    // Try to find the exported name of the declaration, if one is available.
    const {specifier, resolutionContext} = ref.bestGuessOwningModule;
    const symbolName = this.resolveImportName(specifier, ref.node, resolutionContext);
    if (symbolName === null) {
      // TODO(alxhub): make this error a ts.Diagnostic pointing at whatever caused this import to be
      // triggered.
      throw new Error(
          `Symbol ${ref.debugName} declared in ${getSourceFile(ref.node).fileName} is not exported from ${specifier} (import into ${context.fileName})`);
    }

    return new ExternalExpr(new ExternalReference(specifier, symbolName));
  }

  private resolveImportName(moduleName: string, target: ts.Declaration, fromFile: string): string
      |null {
    const exports = this.getExportsOfModule(moduleName, fromFile);
    if (exports !== null && exports.has(target)) {
      return exports.get(target) !;
    } else {
      return null;
    }
  }

  private getExportsOfModule(moduleName: string, fromFile: string):
      Map<ts.Declaration, string>|null {
    if (!this.moduleExportsCache.has(moduleName)) {
      this.moduleExportsCache.set(moduleName, this.enumerateExportsOfModule(moduleName, fromFile));
    }
    return this.moduleExportsCache.get(moduleName) !;
  }

  protected enumerateExportsOfModule(specifier: string, fromFile: string):
      Map<ts.Declaration, string>|null {
    // First, resolve the module specifier to its entry point, and get the ts.Symbol for it.
    const resolvedModule = resolveModuleName(specifier, fromFile, this.options, this.host);
    if (resolvedModule === undefined) {
      return null;
    }

    const entryPointFile =
        getSourceFileOrNull(this.program, absoluteFrom(resolvedModule.resolvedFileName));
    if (entryPointFile === null) {
      return null;
    }

    const exports = this.reflectionHost.getExportsOfModule(entryPointFile);
    if (exports === null) {
      return null;
    }
    const exportMap = new Map<ts.Declaration, string>();
    exports.forEach((declaration, name) => { exportMap.set(declaration.node, name); });
    return exportMap;
  }
}

/**
 * A `ReferenceEmitStrategy` which will refer to declarations via relative paths, provided they're
 * both in the logical project "space" of paths.
 *
 * This is trickier than it sounds, as the two files may be in different root directories in the
 * project. Simply calculating a file system relative path between the two is not sufficient.
 * Instead, `LogicalProjectPath`s are used.
 */
export class LogicalProjectStrategy implements ReferenceEmitStrategy {
  constructor(private checker: ts.TypeChecker, private logicalFs: LogicalFileSystem) {}

  emit(ref: Reference<ts.Node>, context: ts.SourceFile): Expression|null {
    const destSf = getSourceFile(ref.node);

    // Compute the relative path from the importing file to the file being imported. This is done
    // as a logical path computation, because the two files might be in different rootDirs.
    const destPath = this.logicalFs.logicalPathOfSf(destSf);
    if (destPath === null) {
      // The imported file is not within the logical project filesystem.
      return null;
    }

    const originPath = this.logicalFs.logicalPathOfSf(context);
    if (originPath === null) {
      throw new Error(
          `Debug assert: attempt to import from ${context.fileName} but it's outside the program?`);
    }

    // There's no way to emit a relative reference from a file to itself.
    if (destPath === originPath) {
      return null;
    }

    const name = findExportedNameOfNode(ref.node, destSf, this.checker);
    if (name === null) {
      // The target declaration isn't exported from the file it's declared in. This is an issue!
      return null;
    }

    // With both files expressed as LogicalProjectPaths, getting the module specifier as a relative
    // path is now straightforward.
    const moduleName = LogicalProjectPath.relativePathBetween(originPath, destPath);
    return new ExternalExpr({moduleName, name});
  }
}

/**
 * A `ReferenceEmitStrategy` which uses a `FileToModuleHost` to generate absolute import references.
 */
export class FileToModuleStrategy implements ReferenceEmitStrategy {
  constructor(private checker: ts.TypeChecker, private fileToModuleHost: FileToModuleHost) {}

  emit(ref: Reference<ts.Node>, context: ts.SourceFile): Expression|null {
    const destSf = getSourceFile(ref.node);
    const name = findExportedNameOfNode(ref.node, destSf, this.checker);
    if (name === null) {
      return null;
    }

    const moduleName =
        this.fileToModuleHost.fileNameToModuleName(destSf.fileName, context.fileName);

    return new ExternalExpr({moduleName, name});
  }
}
