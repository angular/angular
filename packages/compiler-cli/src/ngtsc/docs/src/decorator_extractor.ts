/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {DecoratorEntry, DecoratorType, EntryType, JsDocTagEntry, ParameterEntry} from './entities';
import {extractJsDocDescription, extractJsDocTags, extractRawJsDoc} from './jsdoc_extractor';

/** Extracts an API documentation entry for an Angular decorator. */
export function extractorDecorator(
  declaration: ts.VariableDeclaration,
  typeChecker: ts.TypeChecker,
): DecoratorEntry {
  const documentedNode = getDecoratorJsDocNode(declaration);

  const decoratorType = getDecoratorType(declaration);
  if (!decoratorType) {
    throw new Error(`"${declaration.name.getText()} is not a decorator."`);
  }

  return {
    name: declaration.name.getText(),
    decoratorType: decoratorType,
    entryType: EntryType.Decorator,
    rawComment: extractRawJsDoc(documentedNode),
    description: extractJsDocDescription(documentedNode),
    jsdocTags: extractJsDocTags(documentedNode),
    signatures: getDecoratorSignatures(declaration, typeChecker),
  };
}

/** Gets whether the given variable declaration is an Angular decorator declaration. */
export function isDecoratorDeclaration(declaration: ts.VariableDeclaration): boolean {
  return !!getDecoratorType(declaration);
}

/** Gets whether an interface is the options interface for a decorator in the same file. */
export function isDecoratorOptionsInterface(declaration: ts.InterfaceDeclaration): boolean {
  return declaration
    .getSourceFile()
    .statements.some(
      (s) =>
        ts.isVariableStatement(s) &&
        s.declarationList.declarations.some(
          (d) => isDecoratorDeclaration(d) && d.name.getText() === declaration.name.getText(),
        ),
    );
}

/** Gets the type of decorator, or undefined if the declaration is not a decorator. */
function getDecoratorType(declaration: ts.VariableDeclaration): DecoratorType | undefined {
  // All Angular decorators are initialized with one of `makeDecorator`, `makePropDecorator`,
  // or `makeParamDecorator`.
  const initializer = declaration.initializer?.getFullText() ?? '';
  if (initializer.includes('makeDecorator')) return DecoratorType.Class;
  if (initializer.includes('makePropDecorator')) return DecoratorType.Member;
  if (initializer.includes('makeParamDecorator')) return DecoratorType.Parameter;

  return undefined;
}

/** Gets the doc entry for the options object for an Angular decorator */
function getDecoratorSignatures(
  declaration: ts.VariableDeclaration,
  typeChecker: ts.TypeChecker,
): {
  parameters: ParameterEntry[];
  jsdocTags: JsDocTagEntry[];
}[] {
  // Decorators have a complex type definition.
  // The information we're looking for is located in the interface referenced when creating the decorator.

  const decoratorName = declaration.name.getText();

  const decoratorDeclaration = declaration;
  const decoratorType = typeChecker.getTypeAtLocation(decoratorDeclaration!);
  const aliasDeclaration = decoratorType.getSymbol()!.getDeclarations()![0];

  const decoratorInterface = aliasDeclaration as ts.InterfaceDeclaration;
  if (!decoratorInterface || !ts.isInterfaceDeclaration(decoratorInterface)) {
    throw new Error(`No decorator interface found for "${decoratorName}".`);
  }

  // Pulling all the overloads for the decorator function.
  const callSignatures = decoratorInterface.members.filter(ts.isCallSignatureDeclaration);

  return callSignatures.map((signatureDecl) => {
    // What really matters for us are the parameters and the JsDoc tags.
    return {
      parameters: params(signatureDecl.parameters, typeChecker),
      jsdocTags: extractJsDocTags(signatureDecl),
    };
  });
}

function params(
  params: ts.NodeArray<ts.ParameterDeclaration>,
  typeChecker: ts.TypeChecker,
): ParameterEntry[] {
  return params.map((param) => ({
    name: param.name.getText(),
    description: extractJsDocDescription(param),
    type: getParamTypeString(param, typeChecker),
    isOptional: !!(param.questionToken || param.initializer),
    isRestParam: !!param.dotDotDotToken,
  }));
}

/**
 * Gets the call signature node that has the decorator's public JsDoc block.
 *
 * Every decorator has three parts:
 * - A const that has the actual decorator.
 * - An interface with the same name as the const that documents the decorator's options.
 * - An interface suffixed with "Decorator" that has the decorator's call signature and JsDoc block.
 *
 * For the description and JsDoc tags, we need the interface suffixed with "Decorator".
 */
function getDecoratorJsDocNode(declaration: ts.VariableDeclaration): ts.HasJSDoc {
  const name = declaration.name.getText();

  // Assume the existence of an interface in the same file with the same name
  // suffixed with "Decorator".
  const decoratorInterface = declaration.getSourceFile().statements.find((s) => {
    return ts.isInterfaceDeclaration(s) && s.name.getText() === `${name}Decorator`;
  });

  if (!decoratorInterface || !ts.isInterfaceDeclaration(decoratorInterface)) {
    throw new Error(`No interface "${name}Decorator" found.`);
  }

  // The public-facing JsDoc for each decorator is on one of its interface's call signatures.
  const callSignature = decoratorInterface.members.find((node) => {
    // The description block lives on one of the call signatures for this interface.
    return ts.isCallSignatureDeclaration(node) && extractRawJsDoc(node);
  });

  if (!callSignature || !ts.isCallSignatureDeclaration(callSignature)) {
    throw new Error(`No call signature with JsDoc on "${name}Decorator"`);
  }

  return callSignature;
}

/**
 * Advanced function to generate the type string for a parameter.
 * Interfaces (like Component, Decorator, etc.) are expanded to their properties.
 *
 */
export function getParamTypeString(
  paramNode: ts.ParameterDeclaration,
  typeChecker: ts.TypeChecker,
): string {
  const type = typeChecker.getTypeAtLocation(paramNode);
  const printer = ts.createPrinter({removeComments: true});
  const sourceFile = paramNode.getSourceFile();

  const replace: {initial: string; replacedWith: string}[] = [];
  if (type.isClassOrInterface()) {
    // In the cases where the parameter is a sole interface, we expand it. e.g. Component.
    const interfaceDecl = type.getSymbol()!.getDeclarations()![0] as ts.InterfaceDeclaration;

    replace.push({
      initial: type.symbol.name,
      replacedWith: expandType(interfaceDecl, sourceFile, printer),
    });
  } else if (type.isUnion()) {
    // The parameter can be a union, this includes optional parameters whiceh are a union of the type and undefined.
    type.types.forEach((subType) => {
      const decl = subType.getSymbol()?.getDeclarations()?.[0];

      // We only care to expand interfaces
      if (decl && ts.isInterfaceDeclaration(decl)) {
        replace.push({
          initial: subType.symbol.name,
          replacedWith: expandType(decl, sourceFile, printer),
        });
      }
    });
  }

  // Using a print here instead of typeToString as it doesn't return optional props as a union of undefined
  let result = printer
    .printNode(ts.EmitHint.Unspecified, paramNode, sourceFile)
    // Removing the parameter name, the conditional question mark and the colon (e.g. opts?: {foo: string})
    .replace(new RegExp(`${paramNode.name.getText()}\\??\: `), '')
    .replaceAll(/\s+/g, ' '); // Remove extra spaces/line breaks

  // Replace the
  for (const {initial, replacedWith} of replace) {
    result = result.replace(initial, replacedWith);
  }

  return result;
}

function expandType(
  decl: ts.InterfaceDeclaration,
  sourceFile: ts.SourceFile,
  printer: ts.Printer,
): string {
  const props = decl.members
    // printer will return each member with a semicolon at the end
    .map((member) => printer.printNode(ts.EmitHint.Unspecified, member, sourceFile))
    .join(' ')
    .replaceAll(/\s+/g, ' '); // Remove extra spaces/line breaks
  return `{${props}}`;
}
