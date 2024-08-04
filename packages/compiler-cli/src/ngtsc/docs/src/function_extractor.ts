/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {EntryType, FunctionEntry, ParameterEntry} from './entities';
import {extractGenerics} from './generics_extractor';
import {extractJsDocDescription, extractJsDocTags, extractRawJsDoc} from './jsdoc_extractor';
import {extractResolvedTypeString} from './type_extractor';

export type FunctionLike =
  | ts.FunctionDeclaration
  | ts.MethodDeclaration
  | ts.MethodSignature
  | ts.CallSignatureDeclaration
  | ts.ConstructSignatureDeclaration;

export class FunctionExtractor {
  constructor(
    private name: string,
    private exportDeclaration: FunctionLike,
    private typeChecker: ts.TypeChecker,
  ) {}

  extract(): FunctionEntry {
    // TODO: is there any real situation in which the signature would not be available here?
    //     Is void a better type?
    const signature = this.typeChecker.getSignatureFromDeclaration(this.exportDeclaration);
    const returnType = signature
      ? this.typeChecker.typeToString(
          this.typeChecker.getReturnTypeOfSignature(signature),
          undefined,
          // This ensures that e.g. `T | undefined` is not reduced to `T`.
          ts.TypeFormatFlags.NoTypeReduction | ts.TypeFormatFlags.NoTruncation,
        )
      : 'unknown';

    const implementation =
      findImplementationOfFunction(this.exportDeclaration, this.typeChecker) ??
      this.exportDeclaration;

    const type = this.typeChecker.getTypeAtLocation(this.exportDeclaration);
    const overloads = extractCallSignatures(this.name, this.typeChecker, type);
    const jsdocsTags = extractJsDocTags(implementation);
    const description = extractJsDocDescription(implementation);

    return {
      name: this.name,
      signatures: overloads,
      implementation: {
        params: extractAllParams(implementation.parameters, this.typeChecker),
        isNewType: ts.isConstructSignatureDeclaration(implementation),
        returnType,
        returnDescription: jsdocsTags.find((tag) => tag.name === 'returns')?.comment,
        generics: extractGenerics(implementation),
        name: this.name,
        description,
        entryType: EntryType.Function,
        jsdocTags: jsdocsTags,
        rawComment: extractRawJsDoc(implementation),
      },
      entryType: EntryType.Function,
      description,
      jsdocTags: jsdocsTags,
      rawComment: extractRawJsDoc(implementation),
    };
  }
}

/** Extracts parameters of the given parameter declaration AST nodes. */
export function extractAllParams(
  params: ts.NodeArray<ts.ParameterDeclaration>,
  typeChecker: ts.TypeChecker,
): ParameterEntry[] {
  return params.map((param) => ({
    name: param.name.getText(),
    description: extractJsDocDescription(param),
    type: extractResolvedTypeString(param, typeChecker),
    isOptional: !!(param.questionToken || param.initializer),
    isRestParam: !!param.dotDotDotToken,
  }));
}

/** Filters the list signatures to valid function and initializer API signatures. */
function filterSignatureDeclarations(signatures: readonly ts.Signature[]) {
  const result: Array<{
    signature: ts.Signature;
    decl: ts.FunctionDeclaration | ts.CallSignatureDeclaration | ts.MethodDeclaration;
  }> = [];
  for (const signature of signatures) {
    const decl = signature.getDeclaration();
    if (
      ts.isFunctionDeclaration(decl) ||
      ts.isCallSignatureDeclaration(decl) ||
      ts.isMethodDeclaration(decl)
    ) {
      result.push({signature, decl});
    }
  }
  return result;
}

export function extractCallSignatures(name: string, typeChecker: ts.TypeChecker, type: ts.Type) {
  return filterSignatureDeclarations(type.getCallSignatures()).map(({decl, signature}) => ({
    name,
    entryType: EntryType.Function,
    description: extractJsDocDescription(decl),
    generics: extractGenerics(decl),
    isNewType: false,
    jsdocTags: extractJsDocTags(decl),
    params: extractAllParams(decl.parameters, typeChecker),
    rawComment: extractRawJsDoc(decl),
    returnType: typeChecker.typeToString(
      typeChecker.getReturnTypeOfSignature(signature),
      undefined,
      // This ensures that e.g. `T | undefined` is not reduced to `T`.
      ts.TypeFormatFlags.NoTypeReduction | ts.TypeFormatFlags.NoTruncation,
    ),
  }));
}

/** Finds the implementation of the given function declaration overload signature. */
export function findImplementationOfFunction(
  node: FunctionLike,
  typeChecker: ts.TypeChecker,
): FunctionLike | undefined {
  if ((node as ts.FunctionDeclaration).body !== undefined || node.name === undefined) {
    return node;
  }

  const symbol = typeChecker.getSymbolAtLocation(node.name);
  const implementation = symbol?.declarations?.find(
    (s): s is ts.FunctionDeclaration => ts.isFunctionDeclaration(s) && s.body !== undefined,
  );

  return implementation;
}
