/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {OwningModule, Reference} from '../../imports';
import {DeclarationNode, ReflectionHost} from '../../reflection';

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
      if (typeParam.constraint === undefined) {
        return true;
      }

      return canEmitType(typeParam.constraint, type => this.resolveTypeReference(type));
    });
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

      return ts.updateTypeParameterDeclaration(
          /* node */ typeParam,
          /* name */ typeParam.name,
          /* constraint */ constraint,
          /* defaultType */ typeParam.default);
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

    return new Reference(declaration.node, owningModule);
  }

  private isLocalTypeParameter(decl: DeclarationNode): boolean {
    // Checking for local type parameters only occurs during resolution of type parameters, so it is
    // guaranteed that type parameters are present.
    return this.typeParameters!.some(param => param === decl);
  }
}
