/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {TypeCtorMetadata} from './api';

/**
 * Generate a type constructor for the given class and metadata.
 *
 * A type constructor is a specially shaped TypeScript static method, intended to be placed within
 * a directive class itself, that permits type inference of any generic type parameters of the class
 * from the types of expressions bound to inputs or outputs, and the types of elements that match
 * queries performed by the directive. It also catches any errors in the types of these expressions.
 * This method is never called at runtime, but is used in type-check blocks to construct directive
 * types.
 *
 * A type constructor for NgFor looks like:
 *
 * static ngTypeCtor<T>(init: Partial<Pick<NgForOf<T>, 'ngForOf'|'ngForTrackBy'|'ngForTemplate'>>):
 *   NgForOf<T>;
 *
 * A typical usage would be:
 *
 * NgForOf.ngTypeCtor(init: {ngForOf: ['foo', 'bar']}); // Infers a type of NgForOf<string>.
 *
 * @param node the `ts.ClassDeclaration` for which a type constructor will be generated.
 * @param meta additional metadata required to generate the type constructor.
 * @returns a `ts.MethodDeclaration` for the type constructor.
 */
export function generateTypeCtor(
    node: ts.ClassDeclaration, meta: TypeCtorMetadata): ts.MethodDeclaration {
  // Build rawType, a `ts.TypeNode` of the class with its generic parameters passed through from
  // the definition without any type bounds. For example, if the class is
  // `FooDirective<T extends Bar>`, its rawType would be `FooDirective<T>`.
  const rawTypeArgs = node.typeParameters !== undefined ?
      node.typeParameters.map(param => ts.createTypeReferenceNode(param.name, undefined)) :
      undefined;
  const rawType: ts.TypeNode = ts.createTypeReferenceNode(node.name !, rawTypeArgs);

  // initType is the type of 'init', the single argument to the type constructor method.
  // If the Directive has any inputs, outputs, or queries, its initType will be:
  //
  // Partial<Pick<rawType, 'inputField'|'outputField'|'queryField'>>
  //
  // Pick here is used to select only those fields from which the generic type parameters of the
  // directive will be inferred. Partial is used because inputs are optional, so there may not be
  // bindings for each field.
  //
  // In the special case there are no inputs/outputs/etc, initType is set to {}.
  let initType: ts.TypeNode;

  const keys: string[] = [
    ...meta.fields.inputs,
    ...meta.fields.outputs,
    ...meta.fields.queries,
  ];
  if (keys.length === 0) {
    // Special case - no inputs, outputs, or other fields which could influence the result type.
    initType = ts.createTypeLiteralNode([]);
  } else {
    // Construct a union of all the field names.
    const keyTypeUnion = ts.createUnionTypeNode(
        keys.map(key => ts.createLiteralTypeNode(ts.createStringLiteral(key))));

    // Construct the Pick<rawType, keyTypeUnion>.
    const pickType = ts.createTypeReferenceNode('Pick', [rawType, keyTypeUnion]);

    // Construct the Partial<pickType>.
    initType = ts.createTypeReferenceNode('Partial', [pickType]);
  }

  // If this constructor is being generated into a .ts file, then it needs a fake body. The body
  // is set to a return of `null!`. If the type constructor is being generated into a .d.ts file,
  // it needs no body.
  let body: ts.Block|undefined = undefined;
  if (meta.body) {
    body = ts.createBlock([
      ts.createReturn(ts.createNonNullExpression(ts.createNull())),
    ]);
  }

  // Create the 'init' parameter itself.
  const initParam = ts.createParameter(
      /* decorators */ undefined,
      /* modifiers */ undefined,
      /* dotDotDotToken */ undefined,
      /* name */ 'init',
      /* questionToken */ undefined,
      /* type */ initType,
      /* initializer */ undefined, );

  // Create the type constructor method declaration.
  return ts.createMethod(
      /* decorators */ undefined,
      /* modifiers */[ts.createModifier(ts.SyntaxKind.StaticKeyword)],
      /* asteriskToken */ undefined,
      /* name */ meta.fnName,
      /* questionToken */ undefined,
      /* typeParameters */ node.typeParameters,
      /* parameters */[initParam],
      /* type */ rawType,
      /* body */ body, );
}
