/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import path from 'path';
import {UniqueID} from '../helpers/unique_id';
import ts from 'typescript';
import {ProgramInfo} from '../program_info';
import {DtsMetadataReader} from '@angular/compiler-cli/src/ngtsc/metadata';
import {ClassDeclaration, ReflectionHost} from '@angular/compiler-cli/src/ngtsc/reflection';
import {Reference} from '@angular/compiler-cli/src/ngtsc/imports';
import {getAngularDecorators} from '@angular/compiler-cli/src/ngtsc/annotations';
import {projectFile} from '../project_paths';

export type OutputID = UniqueID<'output-node'>;

export function getIdOfOutput(info: ProgramInfo, prop: ts.PropertyDeclaration): OutputID {
  const fileId = projectFile(prop.getSourceFile(), info).id.replace(/\.d\.ts/, '.ts');
  return `${fileId}@@${prop.parent.name ?? 'unknown-class'}@@${prop.name.getText()}` as OutputID;
}

export function findOutputDeclarationsAndReferences(
  info: ProgramInfo,
  checker: ts.TypeChecker,
  reflector: ReflectionHost,
  dtsReader: DtsMetadataReader,
) {
  const {sourceFiles} = info;
  const sourceOutputs = new Map<OutputID, ts.PropertyDeclaration>();
  const problematicReferencedOutputs = new Set<OutputID>();

  for (const sf of sourceFiles) {
    const visitor = (node: ts.Node) => {
      // Detect output declarations.
      if (
        ts.isPropertyDeclaration(node) &&
        node.initializer !== undefined &&
        ts.isNewExpression(node.initializer) &&
        ts.isIdentifier(node.initializer.expression) &&
        node.initializer.expression.text === 'EventEmitter'
      ) {
        sourceOutputs.set(getIdOfOutput(info, node), node);
      }

      // Detect problematic output references.
      if (
        ts.isPropertyAccessExpression(node) &&
        ts.isIdentifier(node.name) &&
        node.name.text === 'pipe'
      ) {
        const targetSymbol = checker.getSymbolAtLocation(node.expression);
        if (
          targetSymbol !== undefined &&
          targetSymbol.valueDeclaration !== undefined &&
          ts.isPropertyDeclaration(targetSymbol.valueDeclaration) &&
          isOutputDeclaration(targetSymbol.valueDeclaration, reflector, dtsReader)
        ) {
          // Mark output to indicate a seen problematic usage.
          problematicReferencedOutputs.add(getIdOfOutput(info, targetSymbol.valueDeclaration));
        }
      }

      ts.forEachChild(node, visitor);
    };

    ts.forEachChild(sf, visitor);
  }

  return {sourceOutputs, problematicReferencedOutputs};
}

function isOutputDeclaration(
  node: ts.PropertyDeclaration,
  reflector: ReflectionHost,
  dtsReader: DtsMetadataReader,
): boolean {
  // `.d.ts` file, so we check the `static ecmp` metadata on the `declare class`.
  if (node.getSourceFile().isDeclarationFile) {
    if (
      !ts.isIdentifier(node.name) ||
      !ts.isClassDeclaration(node.parent) ||
      node.parent.name === undefined
    ) {
      return false;
    }

    const ref = new Reference(node.parent as ClassDeclaration);
    const directiveMeta = dtsReader.getDirectiveMetadata(ref);
    return !!directiveMeta?.outputs.getByClassPropertyName(node.name.text);
  }

  // `.ts` file, so we check for the `@Output()` decorator.
  const decorators = reflector.getDecoratorsOfDeclaration(node);
  const ngDecorators =
    decorators !== null ? getAngularDecorators(decorators, ['Output'], /* isCore */ false) : [];

  return ngDecorators.length > 0;
}
