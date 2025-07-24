/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {EntryType, FunctionEntry, FunctionSignatureMetadata, ParameterEntry} from './entities';
import {extractGenerics} from './generics_extractor';
import {extractJsDocDescription, extractJsDocTags, extractRawJsDoc} from './jsdoc_extractor';
import {extractResolvedTypeString} from './type_extractor';

export type FunctionLike =
  | ts.FunctionDeclaration
  | ts.MethodDeclaration
  | ts.MethodSignature
  | ts.CallSignatureDeclaration
  | ts.ConstructSignatureDeclaration
  | ts.ConstructorDeclaration;

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
    const returnType = signature ? extractReturnType(signature, this.typeChecker) : 'unknown';

    const implementation =
      findImplementationOfFunction(this.exportDeclaration, this.typeChecker) ??
      this.exportDeclaration;

    const type = this.typeChecker.getTypeAtLocation(this.exportDeclaration);
    const overloads = ts.isConstructorDeclaration(this.exportDeclaration)
      ? constructorOverloads(this.exportDeclaration, this.typeChecker)
      : extractCallSignatures(this.name, this.typeChecker, type);
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

function constructorOverloads(
  constructorDeclaration: ts.ConstructorDeclaration,
  typeChecker: ts.TypeChecker,
) {
  const classDeclaration = constructorDeclaration.parent;
  const constructorNode = classDeclaration.members.filter(
    (member): member is ts.ConstructorDeclaration => {
      return ts.isConstructorDeclaration(member) && !member.body;
    },
  );

  return constructorNode.map((n): FunctionSignatureMetadata => {
    return {
      name: 'constructor',
      params: extractAllParams(n.parameters, typeChecker),
      returnType: typeChecker.getTypeAtLocation(classDeclaration)?.symbol.name,
      description: extractJsDocDescription(n),
      entryType: EntryType.Function,
      jsdocTags: extractJsDocTags(n),
      rawComment: extractRawJsDoc(n),
      generics: extractGenerics(n),
      isNewType: false,
    };
  });
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
    decl:
      | ts.FunctionDeclaration
      | ts.CallSignatureDeclaration
      | ts.MethodDeclaration
      | ts.ConstructSignatureDeclaration;
  }> = [];
  for (const signature of signatures) {
    const decl = signature.getDeclaration();
    if (
      ts.isFunctionDeclaration(decl) ||
      ts.isCallSignatureDeclaration(decl) ||
      ts.isMethodDeclaration(decl) ||
      ts.isConstructSignatureDeclaration(decl)
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
    returnType: extractReturnType(signature, typeChecker),
  }));
}

function extractReturnType(signature: ts.Signature, typeChecker: ts.TypeChecker): string {
  // Handling Type Predicates
  if (signature?.declaration?.type && ts.isTypePredicateNode(signature.declaration.type)) {
    return signature.declaration.type.getText();
  }

  return typeChecker.typeToString(
    typeChecker.getReturnTypeOfSignature(signature),
    undefined,
    // This ensures that e.g. `T | undefined` is not reduced to `T`.
    ts.TypeFormatFlags.NoTypeReduction | ts.TypeFormatFlags.NoTruncation,
  );
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
