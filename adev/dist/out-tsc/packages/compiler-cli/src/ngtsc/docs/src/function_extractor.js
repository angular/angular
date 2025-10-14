/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import ts from 'typescript';
import {EntryType} from './entities';
import {extractGenerics} from './generics_extractor';
import {extractJsDocDescription, extractJsDocTags, extractRawJsDoc} from './jsdoc_extractor';
import {extractResolvedTypeString} from './type_extractor';
export class FunctionExtractor {
  name;
  exportDeclaration;
  typeChecker;
  constructor(name, exportDeclaration, typeChecker) {
    this.name = name;
    this.exportDeclaration = exportDeclaration;
    this.typeChecker = typeChecker;
  }
  extract() {
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
function constructorOverloads(constructorDeclaration, typeChecker) {
  const classDeclaration = constructorDeclaration.parent;
  const constructorNode = classDeclaration.members.filter((member) => {
    return ts.isConstructorDeclaration(member) && !member.body;
  });
  return constructorNode.map((n) => {
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
export function extractAllParams(params, typeChecker) {
  return params.map((param) => ({
    name: param.name.getText(),
    description: extractJsDocDescription(param),
    type: extractResolvedTypeString(param, typeChecker),
    isOptional: !!(param.questionToken || param.initializer),
    isRestParam: !!param.dotDotDotToken,
  }));
}
/** Filters the list signatures to valid function and initializer API signatures. */
function filterSignatureDeclarations(signatures) {
  const result = [];
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
export function extractCallSignatures(name, typeChecker, type) {
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
function extractReturnType(signature, typeChecker) {
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
export function findImplementationOfFunction(node, typeChecker) {
  if (node.body !== undefined || node.name === undefined) {
    return node;
  }
  const symbol = typeChecker.getSymbolAtLocation(node.name);
  const implementation = symbol?.declarations?.find(
    (s) => ts.isFunctionDeclaration(s) && s.body !== undefined,
  );
  return implementation;
}
//# sourceMappingURL=function_extractor.js.map
