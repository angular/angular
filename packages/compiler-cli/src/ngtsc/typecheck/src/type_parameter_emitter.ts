/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {OwningModule, Reference} from '../../imports';
import {DeclarationNode, isNamedClassDeclaration, ReflectionHost} from '../../reflection';

import {canEmitType, ResolvedTypeReference, TypeEmitter} from './type_emitter';


/**
 * See `TypeEmitter` for more information on the emitting process.
 */
export class TypeParameterEmitter {
  constructor(
      private typeParameters: ts.NodeArray<ts.TypeParameterDeclaration>|undefined,
      private reflector: ReflectionHost) {}

  /**
   * Determines whether the type parameters can be emitted. If this returns true, then a call to
   * `emit` is known to succeed. Vice versa, if false is returned then `emit` should not be
   * called, as it would fail.
   */
  canEmit(): boolean {
    if (this.typeParameters === undefined) {
      return true;
    }

    return this.typeParameters.every(typeParam => {
      return this.canEmitType(typeParam.constraint) && this.canEmitType(typeParam.default);
    });
  }

  private canEmitType(type: ts.TypeNode|undefined): boolean {
    if (type === undefined) {
      return true;
    }

    return canEmitType(type, typeReference => this.resolveTypeReference(typeReference));
  }

  /**
   * Emits the type parameters using the provided emitter function for `Reference`s.
   */
  emit(emitReference: (ref: Reference) => ts.TypeNode): ts.TypeParameterDeclaration[]|undefined {
    if (this.typeParameters === undefined) {
      return undefined;
    }

    const emitter = new TypeEmitter(type => this.resolveTypeReference(type), emitReference);

    return this.typeParameters.map(typeParam => {
      const constraint =
          typeParam.constraint !== undefined ? emitter.emitType(typeParam.constraint) : undefined;
      const defaultType =
          typeParam.default !== undefined ? emitter.emitType(typeParam.default) : undefined;

      return ts.updateTypeParameterDeclaration(
          /* node */ typeParam,
          /* name */ typeParam.name,
          /* constraint */ constraint,
          /* defaultType */ defaultType);
    });
  }

  private resolveTypeReference(type: ts.TypeReferenceNode): ResolvedTypeReference {
    const target = ts.isIdentifier(type.typeName) ? type.typeName : type.typeName.right;
    const declaration = this.reflector.getDeclarationOfIdentifier(target);

    // If no declaration could be resolved or does not have a `ts.Declaration`, the type cannot be
    // resolved.
    if (declaration === null || declaration.node === null) {
      return null;
    }

    // If the declaration corresponds with a local type parameter, the type reference can be used
    // as is.
    if (this.isLocalTypeParameter(declaration.node)) {
      return type;
    }

    let owningModule: OwningModule|null = null;
    if (declaration.viaModule !== null) {
      owningModule = {
        specifier: declaration.viaModule,
        resolutionContext: type.getSourceFile().fileName,
      };
    }

    // If no owning module is known, the reference needs to be exported to be able to emit an import
    // statement for it. If the declaration is not exported, null is returned to prevent emit.
    if (owningModule === null && !this.isStaticallyExported(declaration.node)) {
      return null;
    }

    return new Reference(declaration.node, owningModule);
  }

  private isStaticallyExported(decl: DeclarationNode): boolean {
    return isNamedClassDeclaration(decl) && this.reflector.isStaticallyExported(decl);
  }

  private isLocalTypeParameter(decl: DeclarationNode): boolean {
    // Checking for local type parameters only occurs during resolution of type parameters, so it is
    // guaranteed that type parameters are present.
    return this.typeParameters!.some(param => param === decl);
  }
}
