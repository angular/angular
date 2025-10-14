/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import ts from 'typescript';
import {DecoratorType, EntryType} from './entities';
import {extractJsDocDescription, extractJsDocTags, extractRawJsDoc} from './jsdoc_extractor';
import {extractInterface} from './class_extractor';
/** Extracts an API documentation entry for an Angular decorator. */
export function extractorDecorator(declaration, typeChecker) {
  const documentedNode = getDecoratorJsDocNode(declaration, typeChecker);
  const decoratorType = getDecoratorType(declaration);
  if (!decoratorType) {
    throw new Error(`"${declaration.name.getText()} is not a decorator."`);
  }
  const members = getDecoratorProperties(declaration, typeChecker);
  let signatures = [];
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
export function isDecoratorDeclaration(declaration) {
  return !!getDecoratorType(declaration);
}
/** Gets whether an interface is the options interface for a decorator in the same file. */
export function isDecoratorOptionsInterface(declaration) {
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
function getDecoratorType(declaration) {
  // All Angular decorators are initialized with one of `makeDecorator`, `makePropDecorator`,
  // or `makeParamDecorator`.
  const initializer = declaration.initializer?.getFullText() ?? '';
  if (initializer.includes('makeDecorator')) return DecoratorType.Class;
  if (initializer.includes('makePropDecorator')) return DecoratorType.Member;
  if (initializer.includes('makeParamDecorator')) return DecoratorType.Parameter;
  return undefined;
}
function getDecoratorDeclaration(declaration, typeChecker) {
  const decoratorName = declaration.name.getText();
  const decoratorDeclaration = declaration;
  const decoratorType = typeChecker.getTypeAtLocation(decoratorDeclaration);
  const aliasDeclaration = decoratorType.getSymbol().getDeclarations()[0];
  const decoratorInterface = aliasDeclaration;
  if (!decoratorInterface || !ts.isInterfaceDeclaration(decoratorInterface)) {
    throw new Error(`No decorator interface found for "${decoratorName}".`);
  }
  return decoratorInterface;
}
/**
 * @returns Interface properties for decorators that are akin to interfaces eg. @Component
 * else return null for decorators that are akin to functions eg. @Inject
 */
function getDecoratorProperties(declaration, typeChecker) {
  // Some decorators like Component, Directive are basically interchangeable with a interface declaration.
  // We want to acount for that and treat them a such.
  // To determine which type of decorator we have, we check the type of the first parameter of its call signature
  const decoratorCallSig = getDecoratorJsDocNode(declaration, typeChecker);
  const decoratorFirstParam = decoratorCallSig.parameters[0];
  const firstParamType = typeChecker.getTypeAtLocation(decoratorFirstParam);
  let firstParamTypeDecl;
  if (firstParamType.isUnion()) {
    // If the first param is a union, we need to get the first type
    // This happens for example when the decorator param is optional (eg @Directive())
    const firstParamTypeUnion = firstParamType.types.find(
      (t) => (t.flags & ts.TypeFlags.Undefined) === 0,
    );
    firstParamTypeDecl = firstParamTypeUnion?.getSymbol()?.getDeclarations()[0];
  } else {
    firstParamTypeDecl = firstParamType.getSymbol()?.getDeclarations()[0];
  }
  if (!firstParamTypeDecl || !ts.isInterfaceDeclaration(firstParamTypeDecl)) {
    // At this point we either have on first param, eg for decorators without parameters
    // or we have a decorator that isn't akin to an interface
    // We will threat them as functions (in another function) and return null here
    return null;
  }
  const interfaceDeclaration = firstParamTypeDecl;
  return extractInterface(interfaceDeclaration, typeChecker).members;
}
function getDecoratorSignatures(callSignatures, typeChecker) {
  return callSignatures.map((signatureDecl) => {
    return {
      parameters: extractParams(signatureDecl.parameters, typeChecker),
      jsdocTags: extractJsDocTags(signatureDecl),
    };
  });
}
function extractParams(params, typeChecker) {
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
function getDecoratorInterface(declaration, typeChecker) {
  const name = declaration.name.getText();
  const symbol = typeChecker.getSymbolAtLocation(declaration.name);
  const decoratorType = typeChecker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration);
  // This is the interface xxxxDecorator
  const decoratorInterface = decoratorType.getSymbol()?.getDeclarations()[0];
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
function getDecoratorJsDocNode(declaration, typeChecker) {
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
function getParamTypeString(paramNode, typeChecker) {
  const type = typeChecker.getTypeAtLocation(paramNode);
  const printer = ts.createPrinter({removeComments: true});
  const sourceFile = paramNode.getSourceFile();
  const replace = [];
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
function expandType(decl, sourceFile, printer) {
  const props = decl.members
    // printer will return each member with a semicolon at the end
    .map((member) => printer.printNode(ts.EmitHint.Unspecified, member, sourceFile))
    .join(' ')
    .replaceAll(/\s+/g, ' '); // Remove extra spaces/line breaks
  return `{${props}}`;
}
//# sourceMappingURL=decorator_extractor.js.map
