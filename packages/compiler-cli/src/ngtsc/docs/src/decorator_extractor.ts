/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {
  DecoratorEntry,
  DecoratorType,
  EntryType,
  JsDocTagEntry,
  ParameterEntry,
  PropertyEntry,
} from './entities';
import {extractJsDocDescription, extractJsDocTags, extractRawJsDoc} from './jsdoc_extractor';
import {extractInterface} from './class_extractor';

/** Extracts an API documentation entry for an Angular decorator. */
export function extractorDecorator(
  declaration: ts.VariableDeclaration,
  typeChecker: ts.TypeChecker,
): DecoratorEntry {
  const documentedNode = getDecoratorJsDocNode(declaration, typeChecker);

  const decoratorType = getDecoratorType(declaration);
  if (!decoratorType) {
    throw new Error(`"${declaration.name.getText()} is not a decorator."`);
  }

  const members = getDecoratorProperties(declaration, typeChecker);
  let signatures: {parameters: ParameterEntry[]; jsdocTags: JsDocTagEntry[]}[] = [];

  if (!members) {
    const decoratorInterface = getDecoratorDeclaration(declaration, typeChecker);
    const callSignatures = decoratorInterface.members.filter(ts.isCallSignatureDeclaration);
    signatures = getDecoratorSignatures(callSignatures, typeChecker);
  }

  return {
    name: declaration.name.getText(),
    decoratorType: decoratorType,
    entryType: EntryType.Decorator,
    rawComment: extractRawJsDoc(documentedNode),
    description: extractJsDocDescription(documentedNode),
    jsdocTags: extractJsDocTags(documentedNode),
    members,
    signatures,
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

function getDecoratorDeclaration(
  declaration: ts.VariableDeclaration,
  typeChecker: ts.TypeChecker,
): ts.InterfaceDeclaration {
  const decoratorName = declaration.name.getText();

  const decoratorDeclaration = declaration;
  const decoratorType = typeChecker.getTypeAtLocation(decoratorDeclaration!);
  const aliasDeclaration = decoratorType.getSymbol()!.getDeclarations()![0];

  const decoratorInterface = aliasDeclaration as ts.InterfaceDeclaration;
  if (!decoratorInterface || !ts.isInterfaceDeclaration(decoratorInterface)) {
    throw new Error(`No decorator interface found for "${decoratorName}".`);
  }
  return decoratorInterface;
}

/**
 * @returns Interface properties for decorators that are akin to interfaces eg. @Component
 * else return null for decorators that are akin to functions eg. @Inject
 */
function getDecoratorProperties(
  declaration: ts.VariableDeclaration,
  typeChecker: ts.TypeChecker,
): PropertyEntry[] | null {
  // Some decorators like Component, Directive are basically interchangeable with a interface declaration.
  // We want to acount for that and treat them a such.
  // To determine which type of decorator we have, we check the type of the first parameter of its call signature

  const decoratorCallSig = getDecoratorJsDocNode(declaration, typeChecker);

  const decoratorFirstParam = decoratorCallSig.parameters[0];
  const firstParamType = typeChecker.getTypeAtLocation(decoratorFirstParam);

  let firstParamTypeDecl: ts.Declaration | undefined;
  if (firstParamType.isUnion()) {
    // If the first param is a union, we need to get the first type
    // This happens for example when the decorator param is optional (eg @Directive())
    const firstParamTypeUnion = firstParamType.types.find(
      (t) => (t.flags & ts.TypeFlags.Undefined) === 0,
    );
    firstParamTypeDecl = firstParamTypeUnion?.getSymbol()?.getDeclarations()![0];
  } else {
    firstParamTypeDecl = firstParamType.getSymbol()?.getDeclarations()![0];
  }

  if (!firstParamTypeDecl || !ts.isInterfaceDeclaration(firstParamTypeDecl)) {
    // At this point we either have on first param, eg for decorators without parameters
    // or we have a decorator that isn't akin to an interface
    // We will threat them as functions (in another function) and return null here
    return null;
  }

  const interfaceDeclaration = firstParamTypeDecl;
  return extractInterface(interfaceDeclaration, typeChecker).members as PropertyEntry[];
}

function getDecoratorSignatures(
  callSignatures: ts.CallSignatureDeclaration[],
  typeChecker: ts.TypeChecker,
): {
  parameters: ParameterEntry[];
  jsdocTags: JsDocTagEntry[];
}[] {
  return callSignatures.map((signatureDecl) => {
    return {
      parameters: extractParams(signatureDecl.parameters, typeChecker),
      jsdocTags: extractJsDocTags(signatureDecl),
    };
  });
}

function extractParams(
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
 * Find the the interface usually suffixed with "Decorator" that describes the decorator.
 */
function getDecoratorInterface(declaration: ts.VariableDeclaration, typeChecker: ts.TypeChecker) {
  const name = declaration.name.getText();
  const symbol = typeChecker.getSymbolAtLocation(declaration.name)!;
  const decoratorType = typeChecker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration!);

  // This is the interface xxxxDecorator
  const decoratorInterface = decoratorType.getSymbol()?.getDeclarations()![0];
  if (!decoratorInterface || !ts.isInterfaceDeclaration(decoratorInterface)) {
    throw new Error(`No decorator interface found for "${name}".`);
  }
  return decoratorInterface;
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
function getDecoratorJsDocNode(
  declaration: ts.VariableDeclaration,
  typeChecker: ts.TypeChecker,
): ts.HasJSDoc & ts.CallSignatureDeclaration {
  const name = declaration.name.getText();

  const decoratorInterface = getDecoratorInterface(declaration, typeChecker);

  // The public-facing JsDoc for each decorator is on one of its interface's call signatures.
  const callSignature = decoratorInterface.members
    .filter((node) => {
      // The description block lives on one of the call signatures for this interface.
      return ts.isCallSignatureDeclaration(node) && extractRawJsDoc(node);
    })
    .at(-1); // Get the last one, as it is the most complete

  if (!callSignature || !ts.isCallSignatureDeclaration(callSignature)) {
    throw new Error(`No call signature with JsDoc on "${name}Decorator"`);
  }

  return callSignature;
}

/**
 * Advanced function to generate the type string (as single line) for a parameter.
 * Interfaces in unions are expanded.
 */
function getParamTypeString(
  paramNode: ts.ParameterDeclaration,
  typeChecker: ts.TypeChecker,
): string {
  const type = typeChecker.getTypeAtLocation(paramNode);
  const printer = ts.createPrinter({removeComments: true});
  const sourceFile = paramNode.getSourceFile();

  const replace: {initial: string; replacedWith: string}[] = [];
  if (type.isUnion()) {
    // The parameter can be a union, this includes optional parameters whiceh are a union of the type and undefined.
    for (const subType of type.types) {
      const decl = subType.getSymbol()?.getDeclarations()?.[0];

      // We only care to expand interfaces
      if (decl && ts.isInterfaceDeclaration(decl) && decl.name.text !== 'Function') {
        // the Function type is actually an interface but we don't want to expand it
        replace.push({
          initial: subType.symbol.name,
          replacedWith: expandType(decl, sourceFile, printer),
        });
      }
    }
  }

  // Using a print here instead of typeToString as it doesn't return optional props as a union of undefined
  let result = printer
    .printNode(ts.EmitHint.Unspecified, paramNode, sourceFile)
    // Removing the parameter name, the conditional question mark and the colon (e.g. opts?: {foo: string})
    .replace(new RegExp(`${paramNode.name.getText()}\\??\: `), '')
    // Remove extra spaces/line breaks
    .replaceAll(/\s+/g, ' ');

  // Replace the types we expanded
  for (const {initial, replacedWith} of replace) {
    result = result.replace(initial, replacedWith);
  }

  return result;
}

/**
 * @return a given interface declaration as single line string
 */
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
