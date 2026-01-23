/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ExpressionType,
  ExternalExpr,
  TransplantedType,
  Type,
  TypeModifier,
} from '@angular/compiler';
import ts from 'typescript';

import {
  assertSuccessfulReferenceEmit,
  ImportFlags,
  Reference,
  ReferenceEmitKind,
  ReferenceEmitter,
} from '../../imports';
import {ReflectionHost} from '../../reflection';
import {ImportManager, translateExpression, translateType} from '../../translator';

/**
 * An environment for a given source file that can be used to emit references.
 *
 * This can be used by the type-checking block, or constructor logic to generate
 * references to directives or other symbols or types.
 */
export class ReferenceEmitEnvironment {
  constructor(
    readonly importManager: ImportManager,
    protected refEmitter: ReferenceEmitter,
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
   * Generate a `ts.Expression` that refers to the external symbol. This
   * may result in new imports being generated.
   */
  referenceExternalSymbol(moduleName: string, name: string): ts.Expression {
    const external = new ExternalExpr({moduleName, name});
    return translateExpression(this.contextFile, external, this.importManager);
  }

  /**
   * Generate a `ts.TypeNode` that references a given type from the provided module.
   *
   * This will involve importing the type into the file, and will also add type parameters if
   * provided.
   */
  referenceExternalType(moduleName: string, name: string, typeParams?: Type[]): ts.TypeNode {
    const external = new ExternalExpr({moduleName, name});
    return translateType(
      new ExpressionType(external, TypeModifier.None, typeParams),
      this.contextFile,
      this.reflector,
      this.refEmitter,
      this.importManager,
    );
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
