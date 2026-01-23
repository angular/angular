/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {
  EntryType,
  FunctionDefinitionEntry,
  InitializerApiFunctionEntry,
  JsDocTagEntry,
} from './entities';
import {
  extractAllParams,
  extractCallSignatures,
  findImplementationOfFunction,
} from './function_extractor';
import {extractGenerics} from './generics_extractor';
import {extractJsDocDescription, extractJsDocTags, extractRawJsDoc} from './jsdoc_extractor';

/** JSDoc used to recognize an initializer API function. */
const initializerApiTag = 'initializerApiFunction';

/**
 * Checks whether the given node corresponds to an initializer API function.
 *
 * An initializer API function is a function declaration or variable declaration
 * that is explicitly annotated with `@initializerApiFunction`.
 *
 * Note: The node may be a function overload signature that is automatically
 * resolved to its implementation to detect the JSDoc tag.
 */
export function isInitializerApiFunction(
  node: ts.Node,
  typeChecker: ts.TypeChecker,
): node is ts.VariableDeclaration | ts.FunctionDeclaration {
  // If this is matching an overload signature, resolve to the implementation
  // as it would hold the `@initializerApiFunction` tag.
  if (ts.isFunctionDeclaration(node) && node.name !== undefined && node.body === undefined) {
    const implementation = findImplementationOfFunction(node, typeChecker);
    if (implementation !== undefined) {
      node = implementation;
    }
  }

  if (!ts.isFunctionDeclaration(node) && !ts.isVariableDeclaration(node)) {
    return false;
  }

  let tagContainer = ts.isFunctionDeclaration(node) ? node : getContainerVariableStatement(node);
  if (tagContainer === null) {
    return false;
  }
  const tags = ts.getJSDocTags(tagContainer);
  return tags.some((t) => t.tagName.text === initializerApiTag);
}

/**
 * Extracts the given node as initializer API function and returns
 * a docs entry that can be rendered to represent the API function.
 */
export function extractInitializerApiFunction(
  node: ts.VariableDeclaration | ts.FunctionDeclaration,
  typeChecker: ts.TypeChecker,
): InitializerApiFunctionEntry {
  if (node.name === undefined || !ts.isIdentifier(node.name)) {
    throw new Error(`Initializer API: Expected literal variable name.`);
  }

  const container = ts.isFunctionDeclaration(node) ? node : getContainerVariableStatement(node);
  if (container === null) {
    throw new Error('Initializer API: Could not find container AST node of variable.');
  }

  const name = node.name.text;
  const type = typeChecker.getTypeAtLocation(node);

  // Top-level call signatures. E.g. `input()`, `input<ReadT>(initialValue: ReadT)`. etc.
  const callFunction: FunctionDefinitionEntry = extractFunctionWithOverloads(
    name,
    type,
    typeChecker,
  );
  // Sub-functions like `input.required()`.
  const subFunctions: FunctionDefinitionEntry[] = [];

  for (const property of type.getProperties()) {
    const subName = property.getName();
    const subDecl = property.getDeclarations()?.[0];
    if (subDecl === undefined || !ts.isPropertySignature(subDecl)) {
      throw new Error(
        `Initializer API: Could not resolve declaration of sub-property: ${name}.${subName}`,
      );
    }

    const subType = typeChecker.getTypeAtLocation(subDecl);
    subFunctions.push(extractFunctionWithOverloads(subName, subType, typeChecker));
  }

  let jsdocTags: JsDocTagEntry[];
  let description: string;
  let rawComment: string;

  // Extract container API documentation.
  // The container description describes the overall function, while
  // we allow the individual top-level call signatures to represent
  // their individual overloads.
  if (ts.isFunctionDeclaration(node)) {
    const implementation = findImplementationOfFunction(node, typeChecker);
    if (implementation === undefined) {
      throw new Error(`Initializer API: Could not find implementation of function: ${name}`);
    }

    callFunction.implementation = {
      name,
      entryType: EntryType.Function,
      isNewType: false,
      description: extractJsDocDescription(implementation),
      generics: extractGenerics(implementation),
      jsdocTags: extractJsDocTags(implementation),
      params: extractAllParams(implementation.parameters, typeChecker),
      rawComment: extractRawJsDoc(implementation),
      returnType: typeChecker.typeToString(
        typeChecker.getReturnTypeOfSignature(
          typeChecker.getSignatureFromDeclaration(implementation)!,
        ),
      ),
    };

    jsdocTags = callFunction.implementation.jsdocTags;
    description = callFunction.implementation.description;
    rawComment = callFunction.implementation.description;
  } else {
    jsdocTags = extractJsDocTags(container);
    description = extractJsDocDescription(container);
    rawComment = extractRawJsDoc(container);
  }

  // Extract additional docs metadata from the initializer API JSDoc tag.
  const metadataTag = jsdocTags.find((t) => t.name === initializerApiTag);
  if (metadataTag === undefined) {
    throw new Error(
      'Initializer API: Detected initializer API function does ' +
        `not have "@initializerApiFunction" tag: ${name}`,
    );
  }

  let parsedMetadata: InitializerApiFunctionEntry['__docsMetadata__'] = undefined;
  if (metadataTag.comment.trim() !== '') {
    try {
      parsedMetadata = JSON.parse(metadataTag.comment) as typeof parsedMetadata;
    } catch (e: unknown) {
      throw new Error(`Could not parse initializer API function metadata: ${e}`);
    }
  }

  return {
    entryType: EntryType.InitializerApiFunction,
    name,
    description,
    jsdocTags,
    rawComment,
    callFunction,
    subFunctions,
    __docsMetadata__: parsedMetadata,
  };
}

/**
 * Gets the container node of the given variable declaration.
 *
 * A variable declaration may be annotated with e.g. `@initializerApiFunction`,
 * but the JSDoc tag is not attached to the node, but to the containing variable
 * statement.
 */
function getContainerVariableStatement(node: ts.VariableDeclaration): ts.VariableStatement | null {
  if (!ts.isVariableDeclarationList(node.parent)) {
    return null;
  }
  if (!ts.isVariableStatement(node.parent.parent)) {
    return null;
  }
  return node.parent.parent;
}

/**
 * Extracts all given signatures and returns them as a function with
 * overloads.
 *
 * The implementation of the function may be attached later, or may
 * be non-existent. E.g. initializer APIs declared using an interface
 * with call signatures do not have an associated implementation function
 * that is statically retrievable. The constant holds the overall API description.
 */
function extractFunctionWithOverloads(
  name: string,
  type: ts.Type,
  typeChecker: ts.TypeChecker,
): FunctionDefinitionEntry {
  return {
    name,
    signatures: extractCallSignatures(name, typeChecker, type),
    // Implementation may be populated later.
    implementation: null,
  };
}
