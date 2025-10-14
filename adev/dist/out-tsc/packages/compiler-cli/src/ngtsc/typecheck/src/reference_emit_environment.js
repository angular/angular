/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ExpressionType, ExternalExpr, TypeModifier} from '@angular/compiler';
import {assertSuccessfulReferenceEmit, ImportFlags, ReferenceEmitKind} from '../../imports';
import {translateExpression, translateType} from '../../translator';
/**
 * An environment for a given source file that can be used to emit references.
 *
 * This can be used by the type-checking block, or constructor logic to generate
 * references to directives or other symbols or types.
 */
export class ReferenceEmitEnvironment {
  importManager;
  refEmitter;
  reflector;
  contextFile;
  constructor(importManager, refEmitter, reflector, contextFile) {
    this.importManager = importManager;
    this.refEmitter = refEmitter;
    this.reflector = reflector;
    this.contextFile = contextFile;
  }
  canReferenceType(
    ref,
    flags = ImportFlags.NoAliasing |
      ImportFlags.AllowTypeImports |
      ImportFlags.AllowRelativeDtsImports,
  ) {
    const result = this.refEmitter.emit(ref, this.contextFile, flags);
    return result.kind === ReferenceEmitKind.Success;
  }
  /**
   * Generate a `ts.TypeNode` that references the given node as a type.
   *
   * This may involve importing the node into the file if it's not declared there already.
   */
  referenceType(
    ref,
    flags = ImportFlags.NoAliasing |
      ImportFlags.AllowTypeImports |
      ImportFlags.AllowRelativeDtsImports,
  ) {
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
  referenceExternalSymbol(moduleName, name) {
    const external = new ExternalExpr({moduleName, name});
    return translateExpression(this.contextFile, external, this.importManager);
  }
  /**
   * Generate a `ts.TypeNode` that references a given type from the provided module.
   *
   * This will involve importing the type into the file, and will also add type parameters if
   * provided.
   */
  referenceExternalType(moduleName, name, typeParams) {
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
  referenceTransplantedType(type) {
    return translateType(
      type,
      this.contextFile,
      this.reflector,
      this.refEmitter,
      this.importManager,
    );
  }
}
//# sourceMappingURL=reference_emit_environment.js.map
