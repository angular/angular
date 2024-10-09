/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {ImportManager} from '../../../../compiler-cli/private/migrations';
import {ProgramInfo, projectFile, ProjectFileID, Replacement, TextUpdate} from '../../utils/tsurge';
import {applyImportManagerChanges} from '../../utils/tsurge/helpers/apply_import_manager';

const printer = ts.createPrinter();

export function calculateDeclarationReplacement(
  info: ProgramInfo,
  node: ts.PropertyDeclaration,
  aliasParam?: ts.Expression,
): Replacement {
  const sf = node.getSourceFile();
  const payloadTypes =
    node.initializer !== undefined && ts.isNewExpression(node.initializer)
      ? node.initializer?.typeArguments
      : undefined;

  const outputCall = ts.factory.createCallExpression(
    ts.factory.createIdentifier('output'),
    payloadTypes,
    aliasParam ? [aliasParam] : [],
  );

  const existingModifiers = (node.modifiers ?? []).filter(
    (modifier) => !ts.isDecorator(modifier) && modifier.kind !== ts.SyntaxKind.ReadonlyKeyword,
  );

  const updatedOutputDeclaration = ts.factory.createPropertyDeclaration(
    // Think: this logic of dealing with modifiers is applicable to all signal-based migrations
    ts.factory.createNodeArray([
      ...existingModifiers,
      ts.factory.createModifier(ts.SyntaxKind.ReadonlyKeyword),
    ]),
    node.name,
    undefined,
    undefined,
    outputCall,
  );

  return prepareTextReplacement(
    info,
    node,
    printer.printNode(ts.EmitHint.Unspecified, updatedOutputDeclaration, sf),
  );
}

export function calculateImportReplacements(info: ProgramInfo, sourceFiles: Set<ts.SourceFile>) {
  const importReplacements: Record<
    ProjectFileID,
    {add: Replacement[]; addAndRemove: Replacement[]}
  > = {};

  const importManager = new ImportManager();

  for (const sf of sourceFiles) {
    const addOnly: Replacement[] = [];
    const addRemove: Replacement[] = [];
    const file = projectFile(sf, info);

    importManager.addImport({
      requestedFile: sf,
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'output',
    });
    applyImportManagerChanges(importManager, addOnly, [sf], info);

    importManager.removeImport(sf, 'Output', '@angular/core');
    importManager.removeImport(sf, 'EventEmitter', '@angular/core');
    applyImportManagerChanges(importManager, addRemove, [sf], info);

    importReplacements[file.id] = {
      add: addOnly,
      addAndRemove: addRemove,
    };
  }

  return importReplacements;
}

export function calculateNextFnReplacement(info: ProgramInfo, node: ts.MemberName): Replacement {
  return prepareTextReplacement(info, node, 'emit');
}

export function calculateCompleteCallReplacement(
  info: ProgramInfo,
  node: ts.ExpressionStatement,
): Replacement {
  return prepareTextReplacement(info, node, '', node.getFullStart());
}

export function calculatePipeCallReplacement(
  info: ProgramInfo,
  node: ts.CallExpression,
): Replacement[] {
  if (ts.isPropertyAccessExpression(node.expression)) {
    const sf = node.getSourceFile();
    const importManager = new ImportManager();

    const outputToObservableIdent = importManager.addImport({
      requestedFile: sf,
      exportModuleSpecifier: '@angular/core/rxjs-interop',
      exportSymbolName: 'outputToObservable',
    });
    const toObsCallExp = ts.factory.createCallExpression(outputToObservableIdent, undefined, [
      node.expression.expression,
    ]);
    const pipePropAccessExp = ts.factory.updatePropertyAccessExpression(
      node.expression,
      toObsCallExp,
      node.expression.name,
    );
    const pipeCallExp = ts.factory.updateCallExpression(
      node,
      pipePropAccessExp,
      [],
      node.arguments,
    );

    const replacements = [
      prepareTextReplacement(
        info,
        node,
        printer.printNode(ts.EmitHint.Unspecified, pipeCallExp, sf),
      ),
    ];

    applyImportManagerChanges(importManager, replacements, [sf], info);

    return replacements;
  } else {
    // TODO: assert instead?
    throw new Error(
      `Unexpected call expression for .pipe - expected a property access but got "${node.getText()}"`,
    );
  }
}

function prepareTextReplacement(
  info: ProgramInfo,
  node: ts.Node,
  replacement: string,
  start?: number,
): Replacement {
  const sf = node.getSourceFile();
  return new Replacement(
    projectFile(sf, info),
    new TextUpdate({
      position: start ?? node.getStart(),
      end: node.getEnd(),
      toInsert: replacement,
    }),
  );
}
