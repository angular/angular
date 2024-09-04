/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {AbsoluteFsPath, ImportManager} from '../../../../compiler-cli/private/migrations';
import {
  ProjectRelativePath,
  projectRelativePath,
  Replacement,
  TextUpdate,
} from '../../utils/tsurge';
import {applyImportManagerChanges} from '../../utils/tsurge/helpers/apply_import_manager';

const printer = ts.createPrinter();

export function calculateDeclarationReplacements(
  projectDirAbsPath: AbsoluteFsPath,
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
      projectRelativePath(sf, projectDirAbsPath),
      new TextUpdate({
        position: node.getStart(),
        end: node.getEnd(),
        toInsert: printer.printNode(ts.EmitHint.Unspecified, updatedOutputDeclaration, sf),
      }),
    ),
  ];
}

export function calculateImportReplacements(
  projectDirAbsPath: AbsoluteFsPath,
  sourceFiles: ts.SourceFile[],
) {
  const importReplacements: Record<
    ProjectRelativePath,
    {add: Replacement[]; addAndRemove: Replacement[]}
  > = {};

  const importManager = new ImportManager();

  for (const sf of sourceFiles) {
    const addOnly: Replacement[] = [];
    const addRemove: Replacement[] = [];

    importManager.addImport({
      requestedFile: sf,
      exportModuleSpecifier: '@angular/core',
      exportSymbolName: 'output',
    });
    applyImportManagerChanges(importManager, addOnly, [sf], projectDirAbsPath);

    importManager.removeImport(sf, 'Output', '@angular/core');
    importManager.removeImport(sf, 'EventEmitter', '@angular/core');
    applyImportManagerChanges(importManager, addRemove, [sf], projectDirAbsPath);

    importReplacements[projectRelativePath(sf, projectDirAbsPath)] = {
      add: addOnly,
      addAndRemove: addRemove,
    };
  }

  return importReplacements;
}

export function calculateNextFnReplacement(
  projectDirAbsPath: AbsoluteFsPath,
  node: ts.MemberName,
): Replacement {
  const sf = node.getSourceFile();
  return new Replacement(
    projectRelativePath(sf, projectDirAbsPath),
    new TextUpdate({
      position: node.getStart(),
      end: node.getEnd(),
      toInsert: 'emit',
    }),
  );
}
