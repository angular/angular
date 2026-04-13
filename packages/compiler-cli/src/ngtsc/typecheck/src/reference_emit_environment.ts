/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ExpressionType, TcbExpr, TcbReferenceMetadata, TransplantedType} from '@angular/compiler';
import ts from 'typescript';

import {ErrorCode, FatalDiagnosticError, makeDiagnosticChain} from '../../diagnostics';
import {
  assertSuccessfulReferenceEmit,
  ImportFlags,
  Reference,
  ReferenceEmitKind,
  ReferenceEmitter,
} from '../../imports';
import {ReflectionHost} from '../../reflection';
import {ImportManager, translateType} from '../../translator';

/**
 * An environment for a given source file that can be used to emit references.
 *
 * This can be used by the type-checking block, or constructor logic to generate
 * references to directives or other symbols or types.
 */
export class ReferenceEmitEnvironment {
  constructor(
    readonly importManager: ImportManager,
    public refEmitter: ReferenceEmitter,
    readonly reflector: ReflectionHost,
    public contextFile: ts.SourceFile,
  ) {}

  canReferenceType(
    ref: Reference,
    flags: ImportFlags = ImportFlags.NoAliasing |
      ImportFlags.AllowTypeImports |
      ImportFlags.AllowRelativeDtsImports,
  ): boolean {
    const result = this.refEmitter.emit(ref, this.contextFile, flags);
    return result.kind === ReferenceEmitKind.Success;
  }

  /**
   * Generate a `ts.TypeNode` that references the given node as a type.
   *
   * This may involve importing the node into the file if it's not declared there already.
   */
  referenceType(
    ref: Reference,
    flags: ImportFlags = ImportFlags.NoAliasing |
      ImportFlags.AllowTypeImports |
      ImportFlags.AllowRelativeDtsImports,
  ): ts.TypeNode {
    const ngExpr = this.refEmitter.emit(ref, this.contextFile, flags);
    assertSuccessfulReferenceEmit(ngExpr, this.contextFile, 'symbol');

    // Create an `ExpressionType` from the `Expression` and translate it via `translateType`.
    // TODO(alxhub): support references to types with generic arguments in a clean way.
    return translateType(
      new ExpressionType(ngExpr.expression),
      this.contextFile,
      this.reflector,
      this.refEmitter,
      this.importManager,
    );
  }

  /**
   * Generates a `TcbExpr` from a `TcbReferenceMetadata` object.
   */
  referenceTcbValue(ref: TcbReferenceMetadata): TcbExpr {
    if (ref.unexportedDiagnostic !== null || ref.isLocal || ref.moduleName === null) {
      if (ref.unexportedDiagnostic !== null) {
        throw new FatalDiagnosticError(
          ErrorCode.IMPORT_GENERATION_FAILURE,
          this.contextFile,
          makeDiagnosticChain(`Unable to import symbol ${ref.name}.`, [
            makeDiagnosticChain(ref.unexportedDiagnostic),
          ]),
        );
      }
      return new TcbExpr(ref.name);
    }
    return this.referenceExternalSymbol(ref.moduleName, ref.name);
  }

  referenceExternalSymbol(moduleName: string, name: string): TcbExpr {
    const importResult = this.importManager.addImport({
      exportModuleSpecifier: moduleName,
      exportSymbolName: name,
      requestedFile: this.contextFile,
    });

    if (ts.isIdentifier(importResult)) {
      return new TcbExpr(importResult.text);
    } else if (ts.isIdentifier(importResult.expression)) {
      return new TcbExpr(`${importResult.expression.text}.${importResult.name.text}`);
    }

    throw new Error('Unexpected value returned by import manager');
  }

  /**
   * Generates a `ts.TypeNode` representing a type that is being referenced from a different place
   * in the program. Any type references inside the transplanted type will be rewritten so that
   * they can be imported in the context file.
   */
  referenceTransplantedType(type: TransplantedType<Reference<ts.TypeNode>>): ts.TypeNode {
    return translateType(
      type,
      this.contextFile,
      this.reflector,
      this.refEmitter,
      this.importManager,
    );
  }
}
