/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isNamedClassDeclaration} from '@angular/compiler-cli/src/ngtsc/reflection';
import {PotentialDirective, ReferenceSymbol, Symbol, SymbolKind, TcbLocation, VariableSymbol} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import ts from 'typescript';


// Reverse mappings of enum would generate strings
export const ALIAS_NAME = ts.SymbolDisplayPartKind[ts.SymbolDisplayPartKind.aliasName];
export const SYMBOL_INTERFACE = ts.SymbolDisplayPartKind[ts.SymbolDisplayPartKind.interfaceName];
export const SYMBOL_PUNC = ts.SymbolDisplayPartKind[ts.SymbolDisplayPartKind.punctuation];
export const SYMBOL_SPACE = ts.SymbolDisplayPartKind[ts.SymbolDisplayPartKind.space];
export const SYMBOL_TEXT = ts.SymbolDisplayPartKind[ts.SymbolDisplayPartKind.text];


/**
 * Label for various kinds of Angular entities for TS display info.
 */
export enum DisplayInfoKind {
  ATTRIBUTE = 'attribute',
  COMPONENT = 'component',
  DIRECTIVE = 'directive',
  EVENT = 'event',
  REFERENCE = 'reference',
  ELEMENT = 'element',
  VARIABLE = 'variable',
  PIPE = 'pipe',
  PROPERTY = 'property',
  METHOD = 'method',
  TEMPLATE = 'template',
}

export interface DisplayInfo {
  kind: DisplayInfoKind;
  displayParts: ts.SymbolDisplayPart[];
  documentation: ts.SymbolDisplayPart[]|undefined;
}

export function getSymbolDisplayInfo(
    tsLS: ts.LanguageService, typeChecker: ts.TypeChecker,
    symbol: ReferenceSymbol|VariableSymbol): DisplayInfo {
  let kind: DisplayInfoKind;
  if (symbol.kind === SymbolKind.Reference) {
    kind = DisplayInfoKind.REFERENCE;
  } else if (symbol.kind === SymbolKind.Variable) {
    kind = DisplayInfoKind.VARIABLE;
  } else {
    throw new Error(
        `AssertionError: unexpected symbol kind ${SymbolKind[(symbol as Symbol).kind]}`);
  }

  const displayParts = createDisplayParts(
      symbol.declaration.name, kind, /* containerName */ undefined,
      typeChecker.typeToString(symbol.tsType));
  const documentation = symbol.kind === SymbolKind.Reference ?
      getDocumentationFromTypeDefAtLocation(tsLS, symbol.targetLocation) :
      getDocumentationFromTypeDefAtLocation(tsLS, symbol.initializerLocation);
  return {
    kind,
    displayParts,
    documentation,
  };
}

/**
 * Construct a compound `ts.SymbolDisplayPart[]` which incorporates the container and type of a
 * target declaration.
 * @param name Name of the target
 * @param kind component, directive, pipe, etc.
 * @param containerName either the Symbol's container or the NgModule that contains the directive
 * @param type user-friendly name of the type
 * @param documentation docstring or comment
 */
export function createDisplayParts(
    name: string, kind: DisplayInfoKind, containerName: string|undefined,
    type: string|undefined): ts.SymbolDisplayPart[] {
  const containerDisplayParts = containerName !== undefined ?
      [
        {text: containerName, kind: SYMBOL_INTERFACE},
        {text: '.', kind: SYMBOL_PUNC},
      ] :
      [];

  const typeDisplayParts = type !== undefined ?
      [
        {text: ':', kind: SYMBOL_PUNC},
        {text: ' ', kind: SYMBOL_SPACE},
        {text: type, kind: SYMBOL_INTERFACE},
      ] :
      [];
  return [
    {text: '(', kind: SYMBOL_PUNC},
    {text: kind, kind: SYMBOL_TEXT},
    {text: ')', kind: SYMBOL_PUNC},
    {text: ' ', kind: SYMBOL_SPACE},
    ...containerDisplayParts,
    {text: name, kind: SYMBOL_INTERFACE},
    ...typeDisplayParts,
  ];
}

/**
 * Convert a `SymbolDisplayInfoKind` to a `ts.ScriptElementKind` type, allowing it to pass through
 * TypeScript APIs.
 *
 * In practice, this is an "illegal" type cast. Since `ts.ScriptElementKind` is a string, this is
 * safe to do if TypeScript only uses the value in a string context. Consumers of this conversion
 * function are responsible for ensuring this is the case.
 */
export function unsafeCastDisplayInfoKindToScriptElementKind(kind: DisplayInfoKind):
    ts.ScriptElementKind {
  return kind as string as ts.ScriptElementKind;
}

function getDocumentationFromTypeDefAtLocation(
    tsLS: ts.LanguageService, tcbLocation: TcbLocation): ts.SymbolDisplayPart[]|undefined {
  const typeDefs =
      tsLS.getTypeDefinitionAtPosition(tcbLocation.tcbPath, tcbLocation.positionInFile);
  if (typeDefs === undefined || typeDefs.length === 0) {
    return undefined;
  }
  return tsLS.getQuickInfoAtPosition(typeDefs[0].fileName, typeDefs[0].textSpan.start)
      ?.documentation;
}

export function getDirectiveDisplayInfo(
    tsLS: ts.LanguageService, dir: PotentialDirective): DisplayInfo {
  const kind = dir.isComponent ? DisplayInfoKind.COMPONENT : DisplayInfoKind.DIRECTIVE;
  const decl = dir.tsSymbol.declarations.find(ts.isClassDeclaration);
  if (decl === undefined || decl.name === undefined) {
    return {kind, displayParts: [], documentation: []};
  }

  const res = tsLS.getQuickInfoAtPosition(decl.getSourceFile().fileName, decl.name.getStart());
  if (res === undefined) {
    return {kind, displayParts: [], documentation: []};
  }

  const displayParts =
      createDisplayParts(dir.tsSymbol.name, kind, dir.ngModule?.name?.text, undefined);

  return {
    kind,
    displayParts,
    documentation: res.documentation,
  };
}

export function getTsSymbolDisplayInfo(
    tsLS: ts.LanguageService, checker: ts.TypeChecker, symbol: ts.Symbol, kind: DisplayInfoKind,
    ownerName: string|null): DisplayInfo|null {
  const decl = symbol.valueDeclaration;
  if (decl === undefined ||
      (!ts.isPropertyDeclaration(decl) && !ts.isMethodDeclaration(decl) &&
       !isNamedClassDeclaration(decl)) ||
      !ts.isIdentifier(decl.name)) {
    return null;
  }
  const res = tsLS.getQuickInfoAtPosition(decl.getSourceFile().fileName, decl.name.getStart());
  if (res === undefined) {
    return {kind, displayParts: [], documentation: []};
  }

  const type = checker.getDeclaredTypeOfSymbol(symbol);
  const typeString = checker.typeToString(type);

  const displayParts = createDisplayParts(symbol.name, kind, ownerName ?? undefined, typeString);

  return {
    kind,
    displayParts,
    documentation: res.documentation,
  };
}
