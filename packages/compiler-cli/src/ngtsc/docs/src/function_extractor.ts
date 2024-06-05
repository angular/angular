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
      ? this.typeChecker.typeToString(this.typeChecker.getReturnTypeOfSignature(signature))
      : 'unknown';

    const implementation =
      findImplementationOfFunction(this.exportDeclaration, this.typeChecker) ??
      this.exportDeclaration;

    const type = this.typeChecker.getTypeAtLocation(this.exportDeclaration);
    const overloads = extractOverloadSignatures(this.name, this.typeChecker, type);
    const jsdocTags = extractJsDocTags(implementation);
    const description = extractJsDocDescription(implementation);

    return {
      signatures: overloads,
      implementation: {
        params: extractAllParams(implementation.parameters, this.typeChecker),
        isNewType: ts.isConstructSignatureDeclaration(implementation),
        returnType,
        returnDescription: jsdocTags.find((tag) => tag.name === 'returns')?.comment,
        generics: extractGenerics(implementation),
        name: this.name,
        description,
        entryType: EntryType.Function,
        jsdocTags,
        rawComment: extractRawJsDoc(implementation),
      },
      description,
      entryType: EntryType.Function,
      name: this.name,
      jsdocTags,
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

/** Filters the list signatures to valid initializer API signatures. */
export function filterSignatureDeclarations(signatures: readonly ts.Signature[]) {
  const result: Array<ts.FunctionDeclaration | ts.CallSignatureDeclaration> = [];
  for (const signature of signatures) {
    const decl = signature.getDeclaration();
    if (ts.isFunctionDeclaration(decl) || ts.isCallSignatureDeclaration(decl)) {
      result.push(decl);
    }
  }
  return result;
}

export function extractOverloadSignatures(
  name: string,
  typeChecker: ts.TypeChecker,
  type: ts.Type,
) {
  return filterSignatureDeclarations(type.getCallSignatures()).map((s) => ({
    name: name,
    entryType: EntryType.Function,
    description: extractJsDocDescription(s),
    generics: extractGenerics(s),
    isNewType: false,
    jsdocTags: extractJsDocTags(s),
    params: extractAllParams(s.parameters, typeChecker),
    rawComment: extractRawJsDoc(s),
    returnType: typeChecker.typeToString(
      typeChecker.getReturnTypeOfSignature(typeChecker.getSignatureFromDeclaration(s)!),
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
