/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import {
  ReflectionHost,
  ClassDeclaration,
  Decorator,
} from '../../../../compiler-cli/src/ngtsc/reflection';
import {DtsMetadataReader} from '../../../../compiler-cli/src/ngtsc/metadata';
import {Reference} from '../../../../compiler-cli/src/ngtsc/imports';
import {getAngularDecorators} from '../../../../compiler-cli/src/ngtsc/annotations';

import {ProgramInfo, projectFile, UniqueID} from '../../utils/tsurge';

/** Branded type for unique IDs of Angular `@Output`s. */
export type OutputID = UniqueID<'output-node'>;

/** Type describing an extracted output query that can be migrated. */
export interface ExtractedOutput {
  id: OutputID;
  aliasParam?: ts.Expression;
}

/**
 * Determines if the given node refers to a decorator-based output, and
 * returns its resolved metadata if possible.
 */
export function extractSourceOutputDefinition(
  node: ts.PropertyDeclaration,
  reflector: ReflectionHost,
  info: ProgramInfo,
): ExtractedOutput | null {
  const outputDecorator = getOutputDecorator(node, reflector);

  if (outputDecorator !== null && isOutputDeclarationEligibleForMigration(node)) {
    return {
      id: getUniqueIdForProperty(info, node),
      aliasParam: outputDecorator.args?.at(0),
    };
  }

  return null;
}

function isOutputDeclarationEligibleForMigration(node: ts.PropertyDeclaration) {
  return (
    node.initializer !== undefined &&
    ts.isNewExpression(node.initializer) &&
    ts.isIdentifier(node.initializer.expression) &&
    node.initializer.expression.text === 'EventEmitter'
  );
}

function isPotentialOutputCallUsage(node: ts.Node, name: string): node is ts.CallExpression {
  if (
    ts.isCallExpression(node) &&
    ts.isPropertyAccessExpression(node.expression) &&
    ts.isIdentifier(node.expression.name)
  ) {
    return node.expression?.name.text === name;
  } else {
    return false;
  }
}

export function isPotentialPipeCallUsage(node: ts.Node): node is ts.CallExpression {
  return isPotentialOutputCallUsage(node, 'pipe');
}

export function isPotentialNextCallUsage(node: ts.Node): node is ts.CallExpression {
  return isPotentialOutputCallUsage(node, 'next');
}

export function isPotentialCompleteCallUsage(node: ts.Node): node is ts.CallExpression {
  return isPotentialOutputCallUsage(node, 'complete');
}

export function isTargetOutputDeclaration(
  node: ts.Node,
  checker: ts.TypeChecker,
  reflector: ReflectionHost,
  dtsReader: DtsMetadataReader,
): ts.PropertyDeclaration | null {
  const targetSymbol = checker.getSymbolAtLocation(node);
  if (targetSymbol !== undefined) {
    const propertyDeclaration = getTargetPropertyDeclaration(targetSymbol);
    if (
      propertyDeclaration !== null &&
      isOutputDeclaration(propertyDeclaration, reflector, dtsReader)
    ) {
      return propertyDeclaration;
    }
  }
  return null;
}

/** Gets whether the given property is an Angular `@Output`. */
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
  return getOutputDecorator(node, reflector) !== null;
}

export function getTargetPropertyDeclaration(
  targetSymbol: ts.Symbol,
): ts.PropertyDeclaration | null {
  const valDeclaration = targetSymbol.valueDeclaration;
  if (valDeclaration !== undefined && ts.isPropertyDeclaration(valDeclaration)) {
    return valDeclaration;
  }
  return null;
}

/** Returns Angular `@Output` decorator or null when a given property declaration is not an @Output */
function getOutputDecorator(
  node: ts.PropertyDeclaration,
  reflector: ReflectionHost,
): Decorator | null {
  const decorators = reflector.getDecoratorsOfDeclaration(node);
  const ngDecorators =
    decorators !== null ? getAngularDecorators(decorators, ['Output'], /* isCore */ false) : [];

  return ngDecorators.length > 0 ? ngDecorators[0] : null;
}

// THINK: this utility + type is not specific to @Output, really, maybe move it to tsurge?
/** Computes an unique ID for a given Angular `@Output` property. */
export function getUniqueIdForProperty(info: ProgramInfo, prop: ts.PropertyDeclaration): OutputID {
  const {id} = projectFile(prop.getSourceFile(), info);
  id.replace(/\.d\.ts$/, '.ts');
  return `${id}@@${prop.parent.name ?? 'unknown-class'}@@${prop.name.getText()}` as OutputID;
}

export function isTestRunnerImport(node: ts.Node) {
  if (ts.isImportDeclaration(node)) {
    const moduleSpecifier = node.moduleSpecifier.getText();
    return moduleSpecifier.includes('jasmine') || moduleSpecifier.includes('catalyst');
  }
  return false;
}
