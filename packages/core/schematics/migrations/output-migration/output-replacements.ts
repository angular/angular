/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import {Replacement, TextUpdate} from '../../utils/tsurge';
import {absoluteFromSourceFile, AbsoluteFsPath} from '@angular/compiler-cli';
import {applyImportManagerChanges} from '../../utils/tsurge/helpers/apply_import_manager';
import {ImportManager} from '../../../../compiler-cli/private/migrations';

const printer = ts.createPrinter();

export function calculateDeclarationReplacements(
  node: ts.PropertyDeclaration,
  aliasParam?: ts.Expression,
): Replacement[] {
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

  const updatedOutputDeclaration = ts.factory.updatePropertyDeclaration(
    node,
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

  return [
    new Replacement(
      absoluteFromSourceFile(sf),
      new TextUpdate({
        position: node.getStart(),
        end: node.getEnd(),
        toInsert: printer.printNode(ts.EmitHint.Unspecified, updatedOutputDeclaration, sf),
      }),
    ),
  ];
}

export function calculateImportReplacements(sourceFiles: ts.SourceFile[]) {
  const importReplacements: Record<
    AbsoluteFsPath,
    {add: Replacement[]; addAndRemove: Replacement[]}
  > = {};

  const importManager = new ImportManager();

  for (const sf of sourceFiles) {
    const addOnly: Replacement[] = [];
    const addRemove: Replacement[] = [];

    const absolutePath = absoluteFromSourceFile(sf);
    importManager.addImport({
      requestedFile: sf,
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'output',
    });
    applyImportManagerChanges(importManager, addOnly, [sf]);

    importManager.addImport({
      requestedFile: sf,
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'output',
    });
    importManager.removeImport(sf, 'Output', '@angular/core');
    importManager.removeImport(sf, 'EventEmitter', '@angular/core');
    applyImportManagerChanges(importManager, addRemove, [sf]);

    importReplacements[absolutePath] = {add: addOnly, addAndRemove: addRemove};
  }

  return importReplacements;
}
