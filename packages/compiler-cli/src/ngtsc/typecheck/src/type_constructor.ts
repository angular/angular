/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {R3Identifiers} from '@angular/compiler';
import ts from 'typescript';

import {ClassDeclaration, ReflectionHost} from '../../reflection';
import {TypeCtorMetadata, TcbTypeParameter} from '../api';

import {ReferenceEmitEnvironment} from './reference_emit_environment';
import {checkIfGenericTypeBoundsCanBeEmitted, generateTcbTypeParameters} from './tcb_util';
import {quoteAndEscape, TcbExpr, tempPrint} from './ops/codegen';

export function generateTypeCtorDeclarationFn(
  env: ReferenceEmitEnvironment,
  meta: TypeCtorMetadata,
  nodeTypeRef: ts.EntityName,
  typeParams: TcbTypeParameter[] | undefined,
): TcbExpr {
  const typeArgs = generateGenericArgs(typeParams);
  const typeRef = ts.isIdentifier(nodeTypeRef)
    ? nodeTypeRef.text
    : tempPrint(nodeTypeRef, nodeTypeRef.getSourceFile());
  const typeRefWithGenerics = `${typeRef}${typeArgs}`;
  const initParam = constructTypeCtorParameter(env, meta, typeRef, typeRefWithGenerics);
  const typeParameters = typeParametersWithDefaultTypes(typeParams);
  let source: string;

  if (meta.body) {
    const fnType = `${typeParameters}(${initParam}) => ${typeRefWithGenerics}`;
    source = `const ${meta.fnName}: ${fnType} = null!`;
  } else {
    source = `declare function ${meta.fnName}${typeParameters}(${initParam}): ${typeRefWithGenerics}`;
  }

  return new TcbExpr(source);
}

/**
 * Generate an inline type constructor for the given class and metadata.
 *
 * An inline type constructor is a specially shaped TypeScript static method, intended to be placed
 * within a directive class itself, that permits type inference of any generic type parameters of
 * the class from the types of expressions bound to inputs or outputs, and the types of elements
 * that match queries performed by the directive. It also catches any errors in the types of these
 * expressions. This method is never called at runtime, but is used in type-check blocks to
 * construct directive types.
 *
 * An inline type constructor for NgFor looks like:
 *
 * static ngTypeCtor<T>(init: Pick<NgForOf<T>, 'ngForOf'|'ngForTrackBy'|'ngForTemplate'>):
 *   NgForOf<T>;
 *
 * A typical constructor would be:
 *
 * NgForOf.ngTypeCtor(init: {
 *   ngForOf: ['foo', 'bar'],
 *   ngForTrackBy: null as any,
 *   ngForTemplate: null as any,
 * }); // Infers a type of NgForOf<string>.
 *
 * Any inputs declared on the type for which no property binding is present are assigned a value of
 * type `any`, to avoid producing any type errors for unset inputs.
 *
 * Inline type constructors are used when the type being created has bounded generic types which
 * make writing a declared type constructor (via `generateTypeCtorDeclarationFn`) difficult or
 * impossible.
 *
 * @param node the `ClassDeclaration<ts.ClassDeclaration>` for which a type constructor will be
 * generated.
 * @param meta additional metadata required to generate the type constructor.
 * @returns a `ts.MethodDeclaration` for the type constructor.
 */
export function generateInlineTypeCtor(
  env: ReferenceEmitEnvironment,
  node: ClassDeclaration<ts.ClassDeclaration>,
  meta: TypeCtorMetadata,
): string {
  // Build rawType, a `ts.TypeNode` of the class with its generic parameters passed through from
  // the definition without any type bounds. For example, if the class is
  // `FooDirective<T extends Bar>`, its rawType would be `FooDirective<T>`.
  const typeRef = node.name.text;
  const sourceFile = node.getSourceFile();
  const tcbTypeParams =
    node.typeParameters && node.typeParameters.length > 0
      ? generateTcbTypeParameters(node.typeParameters, sourceFile)
      : undefined;

  const typeRefWithGenerics = `${typeRef}${generateGenericArgs(tcbTypeParams)}`;
  const initParam = constructTypeCtorParameter(env, meta, typeRef, typeRefWithGenerics);

  // If this constructor is being generated into a .ts file, then it needs a fake body. The body
  // is set to a return of `null!`. If the type constructor is being generated into a .d.ts file,
  // it needs no body.
  const body = `{ return null!; }`;
  const typeParams = typeParametersWithDefaultTypes(tcbTypeParams);

  // Create the type constructor method declaration.
  return `static ${meta.fnName}${typeParams}(${initParam}): ${typeRefWithGenerics} ${body}`;
}

function constructTypeCtorParameter(
  env: ReferenceEmitEnvironment,
  meta: TypeCtorMetadata,
  typeRef: string,
  typeRefWithGenerics: string,
): string {
  // initType is the type of 'init', the single argument to the type constructor method.
  // If the Directive has any inputs, its initType will be:
  //
  // Pick<rawType, 'inputA'|'inputB'>
  //
  // Pick here is used to select only those fields from which the generic type parameters of the
  // directive will be inferred.
  //
  // In the special case there are no inputs, initType is set to {}.
  let initType: string | null = null;

  const plainKeys: string[] = [];
  const coercedKeys: string[] = [];
  const signalInputKeys: string[] = [];

  for (const {classPropertyName, transformType, isSignal} of meta.fields.inputs) {
    if (isSignal) {
      signalInputKeys.push(quoteAndEscape(classPropertyName));
    } else if (!meta.coercedInputFields.has(classPropertyName)) {
      plainKeys.push(quoteAndEscape(classPropertyName));
    } else {
      const coercionType =
        transformType !== undefined
          ? transformType
          : `typeof ${typeRef}.ngAcceptInputType_${classPropertyName}`;

      coercedKeys.push(`${classPropertyName}: ${coercionType}`);
    }
  }

  if (plainKeys.length > 0) {
    // Construct a union of all the field names.
    initType = `Pick<${typeRefWithGenerics}, ${plainKeys.join(' | ')}>`;
  }
  if (coercedKeys.length > 0) {
    let coercedLiteral = '{\n';
    for (const key of coercedKeys) {
      coercedLiteral += `${key};\n`;
    }
    coercedLiteral += '}';
    initType = initType !== null ? `${initType} & ${coercedLiteral}` : coercedLiteral;
  }
  if (signalInputKeys.length > 0) {
    const keyTypeUnion = signalInputKeys.join(' | ');

    // Construct the UnwrapDirectiveSignalInputs<rawType, keyTypeUnion>.
    const unwrapRef = env.referenceExternalSymbol(
      R3Identifiers.UnwrapDirectiveSignalInputs.moduleName,
      R3Identifiers.UnwrapDirectiveSignalInputs.name,
    );
    const unwrapExpr = `${unwrapRef.print()}<${typeRefWithGenerics}, ${keyTypeUnion}>`;
    initType = initType !== null ? `${initType} & ${unwrapExpr}` : unwrapExpr;
  }

  if (initType === null) {
    // Special case - no inputs, outputs, or other fields which could influence the result type.
    initType = '{}';
  }

  // Create the 'init' parameter itself.
  return `init: ${initType}`;
}

function generateGenericArgs(typeParameters: ReadonlyArray<TcbTypeParameter> | undefined): string {
  if (typeParameters === undefined || typeParameters.length === 0) {
    return '';
  }

  return `<${typeParameters.map((param) => param.name).join(', ')}>`;
}

export function requiresInlineTypeCtor(
  node: ClassDeclaration<ts.ClassDeclaration>,
  host: ReflectionHost,
  env: ReferenceEmitEnvironment,
): boolean {
  // The class requires an inline type constructor if it has generic type bounds that can not be
  // emitted into the provided type-check environment.
  return !checkIfGenericTypeBoundsCanBeEmitted(node, host, env);
}

/**
 * Add a default `= any` to type parameters that don't have a default value already.
 *
 * TypeScript uses the default type of a type parameter whenever inference of that parameter
 * fails. This can happen when inferring a complex type from 'any'. For example, if `NgFor`'s
 * inference is done with the TCB code:
 *
 * ```ts
 * class NgFor<T> {
 *   ngForOf: T[];
 * }
 *
 * declare function ctor<T>(o: Pick<NgFor<T>, 'ngForOf'|'ngForTrackBy'|'ngForTemplate'>):
 * NgFor<T>;
 * ```
 *
 * An invocation looks like:
 *
 * ```ts
 * var _t1 = ctor({ngForOf: [1, 2], ngForTrackBy: null as any, ngForTemplate: null as any});
 * ```
 *
 * This correctly infers the type `NgFor<number>` for `_t1`, since `T` is inferred from the
 * assignment of type `number[]` to `ngForOf`'s type `T[]`. However, if `any` is passed instead:
 *
 * ```ts
 * var _t2 = ctor({ngForOf: [1, 2] as any, ngForTrackBy: null as any, ngForTemplate: null as
 * any});
 * ```
 *
 * then inference for `T` fails (it cannot be inferred from `T[] = any`). In this case, `T`
 * takes the type `{}`, and so `_t2` is inferred as `NgFor<{}>`. This is obviously wrong.
 *
 * Adding a default type to the generic declaration in the constructor solves this problem, as
 * the default type will be used in the event that inference fails.
 *
 * ```ts
 * declare function ctor<T = any>(o: Pick<NgFor<T>, 'ngForOf'>): NgFor<T>;
 *
 * var _t3 = ctor({ngForOf: [1, 2] as any});
 * ```
 *
 * This correctly infers `T` as `any`, and therefore `_t3` as `NgFor<any>`.
 */
function typeParametersWithDefaultTypes(
  params: ReadonlyArray<TcbTypeParameter> | undefined,
): string {
  if (params === undefined || params.length === 0) {
    return '';
  }

  return `<${params.map((param) => param.representationWithDefault).join(', ')}>`;
}
