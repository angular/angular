/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {extractInterface} from './class_extractor';
import {DecoratorEntry, DecoratorType, EntryType, PropertyEntry} from './entities';
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
    members: getDecoratorOptions(declaration, typeChecker),
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
function getDecoratorOptions(
  declaration: ts.VariableDeclaration,
  typeChecker: ts.TypeChecker,
): PropertyEntry[] {
  const name = declaration.name.getText();

  // Every decorator has an interface with its options in the same SourceFile.
  // Queries, however, are defined as a type alias pointing to an interface.
  const optionsDeclaration = declaration.getSourceFile().statements.find((node) => {
    return (
      (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) &&
      node.name.getText() === name
    );
  });

  if (!optionsDeclaration) {
    throw new Error(`Decorator "${name}" has no corresponding options interface.`);
  }

  let optionsInterface: ts.InterfaceDeclaration;
  if (ts.isTypeAliasDeclaration(optionsDeclaration)) {
    // We hard-code the assumption that if the decorator's option type is a type alias,
    // it resolves to a single interface (this is true for all query decorators at time of
    // this writing).
    const aliasedType = typeChecker.getTypeAtLocation(optionsDeclaration.type);
    optionsInterface = (aliasedType.getSymbol()?.getDeclarations() ?? []).find((d) =>
      ts.isInterfaceDeclaration(d),
    ) as ts.InterfaceDeclaration;
  } else {
    optionsInterface = optionsDeclaration as ts.InterfaceDeclaration;
  }

  if (!optionsInterface || !ts.isInterfaceDeclaration(optionsInterface)) {
    throw new Error(`Options for decorator "${name}" is not an interface.`);
  }

  // Take advantage of the interface extractor to pull the appropriate member info.
  // Hard code the knowledge that decorator options only have properties, never methods.
  return extractInterface(optionsInterface, typeChecker).members as PropertyEntry[];
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
