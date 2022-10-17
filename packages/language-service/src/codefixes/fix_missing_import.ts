/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ErrorCode as NgCompilerErrorCode, ngErrorCode} from '@angular/compiler-cli/src/ngtsc/diagnostics/index';
import {PotentialDirective, PotentialImport, TemplateTypeChecker} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import * as t from '@angular/compiler/src/render3/r3_ast';  // t for template AST
import ts from 'typescript';

import {getTargetAtPosition, TargetNodeKind} from '../template_target';
import {ensureArrayWithIdentifier, findAllMatchingNodes, findFirstMatchingNode, generateImport, hasImport, moduleSpecifierPointsToFile, nonCollidingImportName, printNode, updateImport, updateObjectValueForKey} from '../ts_utils';
import {getDirectiveMatchesForElementTag} from '../utils';

import {CodeActionContext, CodeActionMeta, FixIdForCodeFixesAll} from './utils';

const errorCodes: number[] = [
  ngErrorCode(NgCompilerErrorCode.SCHEMA_INVALID_ELEMENT),
];

/**
 * This code action will generate a new import for an unknown selector.
 */
export const missingImportMeta: CodeActionMeta = {
  errorCodes,
  getCodeActions,
  fixIds: [FixIdForCodeFixesAll.FIX_MISSING_IMPORT],
  // TODO(dylhunn): implement "Fix All"
  getAllCodeActions: ({tsLs, scope, fixId, formatOptions, preferences, compiler, diagnostics}) => {
    return {
      changes: [],
    };
  }
};

function getCodeActions(
    {templateInfo, start, compiler, formatOptions, preferences, errorCode, tsLs}:
        CodeActionContext) {
  let codeActions: ts.CodeFixAction[] = [];

  const checker = compiler.getTemplateTypeChecker();
  const tsChecker = compiler.programDriver.getProgram().getTypeChecker();

  // The error must be an invalid element in tag, which is interpreted as an intended selector.
  const target = getTargetAtPosition(templateInfo.template, start);
  if (target === null || target.context.kind !== TargetNodeKind.ElementInTagContext ||
      target.context.node instanceof t.Template) {
    return [];
  }
  const missingElement = target.context.node;

  // The class which has an imports array; either a standalone trait or its owning NgModule.
  const componentDecorator = checker.getPrimaryAngularDecorator(templateInfo.component);
  if (componentDecorator == null) {
    return [];
  }
  const owningNgModule = checker.getOwningNgModule(templateInfo.component);
  const isMarkedStandalone = isStandaloneDecorator(componentDecorator);
  if (owningNgModule === null && !isMarkedStandalone) {
    // TODO(dylhunn): This is a "moduleless component." We should probably suggest the user add
    // `standalone: true`.
    return [];
  }
  const importOn = owningNgModule ?? templateInfo.component;

  // Find all possible importable directives with a matching selector.
  const allPossibleDirectives = checker.getPotentialTemplateDirectives(templateInfo.component);
  const matchingDirectives =
      getDirectiveMatchesForElementTag(missingElement, allPossibleDirectives);
  const matches = matchingDirectives.values();

  // Generate suggestions for each possible match.
  for (let currMatch of matches) {
    const currMatchSymbol = currMatch.tsSymbol.valueDeclaration;

    // Get possible trait imports corresponding to the recommended directive.
    const potentialImports = checker.getPotentialImportsFor(currMatch, importOn);

    // For each possible import specifier, create a suggestion.
    for (let potentialImport of potentialImports) {
      // Update the imports on the TypeScript file and Angular decorator.
      let [fileImportChanges, importName] = updateImportsForTypescriptFile(
          tsChecker, importOn.getSourceFile(), potentialImport, currMatchSymbol.getSourceFile());
      let traitImportChanges = updateImportsForAngularTrait(checker, importOn, importName);

      // All quick fixes should always update the trait import; however, the TypeScript import might
      // already be present.
      if (traitImportChanges.length === 0) {
        continue;
      }

      // Create a code action for this import.
      codeActions.push({
        fixName: FixIdForCodeFixesAll.FIX_MISSING_IMPORT,
        description: `Import ${importName} from '${potentialImport.moduleSpecifier}' on ${
            importOn.name!.text}`,
        changes: [{
          fileName: importOn.getSourceFile().fileName,
          textChanges: [...fileImportChanges, ...traitImportChanges],
        }]
      });
    }
  }

  return codeActions;
}

/**
 * Updates the imports on a TypeScript file, by ensuring the provided import is present.
 * Returns the text changes, as well as the name with which the imported symbol can be referred to.
 */
function updateImportsForTypescriptFile(
    tsChecker: ts.TypeChecker, file: ts.SourceFile, newImport: PotentialImport,
    tsFileToImport: ts.SourceFile): [ts.TextChange[], string] {
  const changes = new Array<ts.TextChange>();

  // The trait might already be imported, possibly under a different name. If so, determine the
  // local name of the imported trait.
  const allImports = findAllMatchingNodes(file, {filter: ts.isImportDeclaration});
  const existingImportName: string|null =
      hasImport(tsChecker, allImports, newImport.symbolName, tsFileToImport);
  if (existingImportName !== null) {
    return [[], existingImportName];
  }

  // If the trait has not already been imported, we need to insert the new import.
  const existingImportDeclaration = allImports.find(
      decl => moduleSpecifierPointsToFile(tsChecker, decl.moduleSpecifier, tsFileToImport));
  const importName = nonCollidingImportName(allImports, newImport.symbolName);

  if (existingImportDeclaration !== undefined) {
    // Update an existing import declaration.
    const bindings = existingImportDeclaration.importClause?.namedBindings;
    if (bindings === undefined || ts.isNamespaceImport(bindings)) {
      // This should be impossible. If a namespace import is present, the symbol was already
      // considered imported above.
      console.error(`Unexpected namespace import ${existingImportDeclaration.getText()}`);
      return [[], ''];
    }
    let span = {start: bindings.getStart(), length: bindings.getWidth()};
    const updatedBindings = updateImport(bindings, newImport.symbolName, importName);
    const importString = printNode(updatedBindings, file);
    return [[{span, newText: importString}], importName];
  }

  // Find the last import in the file.
  let lastImport: ts.ImportDeclaration|null = null;
  file.forEachChild(child => {
    if (ts.isImportDeclaration(child)) lastImport = child;
  });

  // Generate a new import declaration, and insert it after the last import declaration, only
  // looking at root nodes in the AST. If no import exists, place it at the start of the file.
  let span: ts.TextSpan = {start: 0, length: 0};
  if (lastImport as any !== null) {  // TODO: Why does the compiler insist this is null?
    span.start = lastImport!.getStart() + lastImport!.getWidth();
  }
  const newImportDeclaration =
      generateImport(newImport.symbolName, importName, newImport.moduleSpecifier);
  const importString = '\n' + printNode(newImportDeclaration, file);
  return [[{span, newText: importString}], importName];
}

/**
 * Updates a given Angular trait, such as an NgModule or standalone Component, by adding
 * `importName` to the list of imports on the decorator arguments.
 */
function updateImportsForAngularTrait(
    checker: TemplateTypeChecker, trait: ts.ClassDeclaration, importName: string): ts.TextChange[] {
  // Get the object with arguments passed into the primary Angular decorator for this trait.
  const decorator = checker.getPrimaryAngularDecorator(trait);
  if (decorator === null) {
    return [];
  }
  const decoratorProps = findFirstMatchingNode(decorator, {filter: ts.isObjectLiteralExpression});
  if (decoratorProps === null) {
    return [];
  }

  let updateRequired = true;
  // Update the trait's imports.
  const newDecoratorProps =
      updateObjectValueForKey(decoratorProps, 'imports', (oldValue?: ts.Expression) => {
        if (oldValue && !ts.isArrayLiteralExpression(oldValue)) {
          return oldValue;
        }
        const newArr = ensureArrayWithIdentifier(ts.factory.createIdentifier(importName), oldValue);
        updateRequired = newArr !== null;
        return newArr!;
      });

  if (!updateRequired) {
    return [];
  }
  return [{
    span: {
      start: decoratorProps.getStart(),
      length: decoratorProps.getEnd() - decoratorProps.getStart()
    },
    newText: printNode(newDecoratorProps, trait.getSourceFile())
  }];
}

function isStandaloneDecorator(decorator: ts.Decorator): boolean|null {
  const decoratorProps = findFirstMatchingNode(decorator, {filter: ts.isObjectLiteralExpression});
  if (decoratorProps === null) {
    return null;
  }

  for (const property of decoratorProps.properties) {
    if (!ts.isPropertyAssignment(property)) {
      continue;
    }
    // TODO(dylhunn): What if this is a dynamically evaluated expression?
    if (property.name.getText() === 'standalone' && property.initializer.getText() === 'true') {
      return true;
    }
  }
  return false;
}
