/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {ImportManager} from '@angular/compiler-cli/private/migrations';
import {
  ProgramInfo,
  ProjectFile,
  projectFile,
  ProjectFileID,
  Replacement,
  TextUpdate,
} from '../../utils/tsurge';
import {applyImportManagerChanges} from '../../utils/tsurge/helpers/apply_import_manager';
import {AbsoluteSourceSpan} from '@angular/compiler';

const printer = ts.createPrinter();

export function calculateDeclarationReplacement(
  info: ProgramInfo,
  node: ts.PropertyDeclaration,
  aliasParam?: string,
): Replacement {
  const sf = node.getSourceFile();

  let payloadTypes: ts.NodeArray<ts.TypeNode> | undefined;

  if (node.initializer && ts.isNewExpression(node.initializer) && node.initializer.typeArguments) {
    payloadTypes = node.initializer.typeArguments;
  } else if (node.type && ts.isTypeReferenceNode(node.type) && node.type.typeArguments) {
    payloadTypes = ts.factory.createNodeArray(node.type.typeArguments);
  }

  const outputCall = ts.factory.createCallExpression(
    ts.factory.createIdentifier('output'),
    payloadTypes,
    aliasParam !== undefined
      ? [
          ts.factory.createObjectLiteralExpression(
            [
              ts.factory.createPropertyAssignment(
                'alias',
                ts.factory.createStringLiteral(aliasParam, true),
              ),
            ],
            false,
          ),
        ]
      : [],
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

  return prepareTextReplacementForNode(
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

  for (const sf of sourceFiles) {
    const importManager = new ImportManager();

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
  return prepareTextReplacementForNode(info, node, 'emit');
}

export function calculateNextFnReplacementInTemplate(
  file: ProjectFile,
  span: AbsoluteSourceSpan,
): Replacement {
  return prepareTextReplacement(file, 'emit', span.start, span.end);
}

export function calculateNextFnReplacementInHostBinding(
  file: ProjectFile,
  offset: number,
  span: AbsoluteSourceSpan,
): Replacement {
  return prepareTextReplacement(file, 'emit', offset + span.start, offset + span.end);
}

export function calculateCompleteCallReplacement(
  info: ProgramInfo,
  node: ts.ExpressionStatement,
): Replacement {
  return prepareTextReplacementForNode(info, node, '', node.getFullStart());
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
      prepareTextReplacementForNode(
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

function prepareTextReplacementForNode(
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

function prepareTextReplacement(
  file: ProjectFile,
  replacement: string,
  start: number,
  end: number,
): Replacement {
  return new Replacement(
    file,
    new TextUpdate({
      position: start,
      end: end,
      toInsert: replacement,
    }),
  );
}
