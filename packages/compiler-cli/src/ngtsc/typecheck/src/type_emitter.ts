/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import {Reference} from '../../imports';

/**
 * A resolved type reference can either be a `Reference`, the original `ts.TypeReferenceNode` itself
 * or null to indicate the no reference could be resolved.
 */
export type ResolvedTypeReference = Reference|ts.TypeReferenceNode|null;

/**
 * A type reference resolver function is responsible for finding the declaration of the type
 * reference and verifying whether it can be emitted.
 */
export type TypeReferenceResolver = (type: ts.TypeReferenceNode) => ResolvedTypeReference;

/**
 * Determines whether the provided type can be emitted, which means that it can be safely emitted
 * into a different location.
 *
 * If this function returns true, a `TypeEmitter` should be able to succeed. Vice versa, if this
 * function returns false, then using the `TypeEmitter` should not be attempted as it is known to
 * fail.
 */
export function canEmitType(type: ts.TypeNode, resolver: TypeReferenceResolver): boolean {
  return canEmitTypeWorker(type);

  function canEmitTypeWorker(type: ts.TypeNode): boolean {
    return visitTypeNode(type, {
      visitTypeReferenceNode: type => canEmitTypeReference(type),
      visitArrayTypeNode: type => canEmitTypeWorker(type.elementType),
      visitKeywordType: () => true,
      visitLiteralType: () => true,
      visitOtherType: () => false,
    });
  }

  function canEmitTypeReference(type: ts.TypeReferenceNode): boolean {
    const reference = resolver(type);

    // If the type could not be resolved, it can not be emitted.
    if (reference === null) {
      return false;
    }

    // If the type is a reference without a owning module, consider the type not to be eligible for
    // emitting.
    if (reference instanceof Reference && !reference.hasOwningModuleGuess) {
      return false;
    }

    // The type can be emitted if either it does not have any type arguments, or all of them can be
    // emitted.
    return type.typeArguments === undefined || type.typeArguments.every(canEmitTypeWorker);
  }
}

/**
 * Given a `ts.TypeNode`, this class derives an equivalent `ts.TypeNode` that has been emitted into
 * a different context.
 *
 * For example, consider the following code:
 *
 * ```
 * import {NgIterable} from '@angular/core';
 *
 * class NgForOf<T, U extends NgIterable<T>> {}
 * ```
 *
 * Here, the generic type parameters `T` and `U` can be emitted into a different context, as the
 * type reference to `NgIterable` originates from an absolute module import so that it can be
 * emitted anywhere, using that same module import. The process of emitting translates the
 * `NgIterable` type reference to a type reference that is valid in the context in which it is
 * emitted, for example:
 *
 * ```
 * import * as i0 from '@angular/core';
 * import * as i1 from '@angular/common';
 *
 * const _ctor1: <T, U extends i0.NgIterable<T>>(o: Pick<i1.NgForOf<T, U>, 'ngForOf'>):
 * i1.NgForOf<T, U>;
 * ```
 *
 * Notice how the type reference for `NgIterable` has been translated into a qualified name,
 * referring to the namespace import that was created.
 */
export class TypeEmitter {
  /**
   * Resolver function that computes a `Reference` corresponding with a `ts.TypeReferenceNode`.
   */
  private resolver: TypeReferenceResolver;

  /**
   * Given a `Reference`, this function is responsible for the actual emitting work. It should
   * produce a `ts.TypeNode` that is valid within the desired context.
   */
  private emitReference: (ref: Reference) => ts.TypeNode;

  constructor(resolver: TypeReferenceResolver, emitReference: (ref: Reference) => ts.TypeNode) {
    this.resolver = resolver;
    this.emitReference = emitReference;
  }

  emitType(type: ts.TypeNode): ts.TypeNode {
    return visitTypeNode(type, {
      visitTypeReferenceNode: type => this.emitTypeReference(type),
      visitArrayTypeNode: type => ts.updateArrayTypeNode(type, this.emitType(type.elementType)),
      visitKeywordType: type => type,
      visitLiteralType: type => type,
      visitOtherType: () => {
        throw new Error('Unable to emit a complex type');
      },
    });
  }

  private emitTypeReference(type: ts.TypeReferenceNode): ts.TypeNode {
    // Determine the reference that the type corresponds with.
    const reference = this.resolver(type);
    if (reference === null) {
      throw new Error('Unable to emit an unresolved reference');
    }

    // Emit the type arguments, if any.
    let typeArguments: ts.NodeArray<ts.TypeNode>|undefined = undefined;
    if (type.typeArguments !== undefined) {
      typeArguments = ts.createNodeArray(type.typeArguments.map(typeArg => this.emitType(typeArg)));
    }

    // Emit the type name.
    let typeName = type.typeName;
    if (reference instanceof Reference) {
      if (!reference.hasOwningModuleGuess) {
        throw new Error('A type reference to emit must be imported from an absolute module');
      }

      const emittedType = this.emitReference(reference);
      if (!ts.isTypeReferenceNode(emittedType)) {
        throw new Error(`Expected TypeReferenceNode for emitted reference, got ${
            ts.SyntaxKind[emittedType.kind]}`);
      }

      typeName = emittedType.typeName;
    }

    return ts.updateTypeReferenceNode(type, typeName, typeArguments);
  }
}

/**
 * Visitor interface that allows for unified recognition of the different types of `ts.TypeNode`s,
 * so that `visitTypeNode` is a centralized piece of recognition logic to be used in both
 * `canEmitType` and `TypeEmitter`.
 */
interface TypeEmitterVisitor<R> {
  visitTypeReferenceNode(type: ts.TypeReferenceNode): R;
  visitArrayTypeNode(type: ts.ArrayTypeNode): R;
  visitKeywordType(type: ts.KeywordTypeNode): R;
  visitLiteralType(type: ts.LiteralTypeNode): R;
  visitOtherType(type: ts.TypeNode): R;
}

function visitTypeNode<R>(type: ts.TypeNode, visitor: TypeEmitterVisitor<R>): R {
  if (ts.isTypeReferenceNode(type)) {
    return visitor.visitTypeReferenceNode(type);
  } else if (ts.isArrayTypeNode(type)) {
    return visitor.visitArrayTypeNode(type);
  } else if (ts.isLiteralTypeNode(type)) {
    return visitor.visitLiteralType(type);
  }

  switch (type.kind) {
    case ts.SyntaxKind.AnyKeyword:
    case ts.SyntaxKind.UnknownKeyword:
    case ts.SyntaxKind.NumberKeyword:
    case ts.SyntaxKind.ObjectKeyword:
    case ts.SyntaxKind.BooleanKeyword:
    case ts.SyntaxKind.StringKeyword:
    case ts.SyntaxKind.UndefinedKeyword:
    case ts.SyntaxKind.NullKeyword:
      return visitor.visitKeywordType(type as ts.KeywordTypeNode);
    default:
      return visitor.visitOtherType(type);
  }
}
