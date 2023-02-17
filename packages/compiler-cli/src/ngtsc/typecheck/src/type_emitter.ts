/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import ts from 'typescript';

/**
 * A type reference resolver function is responsible for translating a type reference from the
 * origin source file into a type reference that is valid in the desired source file. If the type
 * cannot be translated to the desired source file, then null can be returned.
 */
export type TypeReferenceTranslator = (type: ts.TypeReferenceNode) => ts.TypeReferenceNode|null;

/**
 * A marker to indicate that a type reference is ineligible for emitting. This needs to be truthy
 * as it's returned from `ts.forEachChild`, which only returns truthy values.
 */
type INELIGIBLE = {
  __brand: 'ineligible';
};
const INELIGIBLE: INELIGIBLE = {} as INELIGIBLE;

/**
 * Determines whether the provided type can be emitted, which means that it can be safely emitted
 * into a different location.
 *
 * If this function returns true, a `TypeEmitter` should be able to succeed. Vice versa, if this
 * function returns false, then using the `TypeEmitter` should not be attempted as it is known to
 * fail.
 */
export function canEmitType(
    type: ts.TypeNode, canEmit: (type: ts.TypeReferenceNode) => boolean): boolean {
  return canEmitTypeWorker(type);

  function canEmitTypeWorker(type: ts.TypeNode): boolean {
    return visitNode(type) !== INELIGIBLE;
  }

  // To determine whether a type can be emitted, we have to recursively look through all type nodes.
  // If an unsupported type node is found at any position within the type, then the `INELIGIBLE`
  // constant is returned to stop the recursive walk as the type as a whole cannot be emitted in
  // that case. Otherwise, the result of visiting all child nodes determines the result. If no
  // ineligible type reference node is found then the walk returns `undefined`, indicating that
  // no type node was visited that could not be emitted.
  function visitNode(node: ts.Node): INELIGIBLE|undefined {
    // `import('module')` type nodes are not supported, as it may require rewriting the module
    // specifier which is currently not done.
    if (ts.isImportTypeNode(node)) {
      return INELIGIBLE;
    }

    // Emitting a type reference node in a different context requires that an import for the type
    // can be created. If a type reference node cannot be emitted, `INELIGIBLE` is returned to stop
    // the walk.
    if (ts.isTypeReferenceNode(node) && !canEmitTypeReference(node)) {
      return INELIGIBLE;
    } else {
      return ts.forEachChild(node, visitNode);
    }
  }

  function canEmitTypeReference(type: ts.TypeReferenceNode): boolean {
    if (!canEmit(type)) {
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
  constructor(private translator: TypeReferenceTranslator) {}

  emitType(type: ts.TypeNode): ts.TypeNode {
    const typeReferenceTransformer: ts.TransformerFactory<ts.TypeNode> = context => {
      const visitNode = (node: ts.Node): ts.Node => {
        if (ts.isImportTypeNode(node)) {
          throw new Error('Unable to emit import type');
        }

        if (ts.isTypeReferenceNode(node)) {
          return this.emitTypeReference(node);
        } else if (ts.isLiteralExpression(node)) {
          // TypeScript would typically take the emit text for a literal expression from the source
          // file itself. As the type node is being emitted into a different file, however,
          // TypeScript would extract the literal text from the wrong source file. To mitigate this
          // issue the literal is cloned and explicitly marked as synthesized by setting its text
          // range to a negative range, forcing TypeScript to determine the node's literal text from
          // the synthesized node's text instead of the incorrect source file.
          let clone: ts.LiteralExpression;

          if (ts.isStringLiteral(node)) {
            clone = ts.factory.createStringLiteral(node.text);
          } else if (ts.isNumericLiteral(node)) {
            clone = ts.factory.createNumericLiteral(node.text);
          } else if (ts.isBigIntLiteral(node)) {
            clone = ts.factory.createBigIntLiteral(node.text);
          } else if (ts.isNoSubstitutionTemplateLiteral(node)) {
            clone = ts.factory.createNoSubstitutionTemplateLiteral(node.text, node.rawText);
          } else if (ts.isRegularExpressionLiteral(node)) {
            clone = ts.factory.createRegularExpressionLiteral(node.text);
          } else {
            throw new Error(`Unsupported literal kind ${ts.SyntaxKind[node.kind]}`);
          }

          ts.setTextRange(clone, {pos: -1, end: -1});
          return clone;
        } else {
          return ts.visitEachChild(node, visitNode, context);
        }
      };
      return node => ts.visitNode(node, visitNode, ts.isTypeNode);
    };
    return ts.transform(type, [typeReferenceTransformer]).transformed[0];
  }

  private emitTypeReference(type: ts.TypeReferenceNode): ts.TypeNode {
    // Determine the reference that the type corresponds with.
    const translatedType = this.translator(type);
    if (translatedType === null) {
      throw new Error('Unable to emit an unresolved reference');
    }

    // Emit the type arguments, if any.
    let typeArguments: ts.NodeArray<ts.TypeNode>|undefined = undefined;
    if (type.typeArguments !== undefined) {
      typeArguments =
          ts.factory.createNodeArray(type.typeArguments.map(typeArg => this.emitType(typeArg)));
    }

    return ts.factory.updateTypeReferenceNode(type, translatedType.typeName, typeArguments);
  }
}
