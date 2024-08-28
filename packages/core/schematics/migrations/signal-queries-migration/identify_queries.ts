/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import {
  getAngularDecorators,
  queryDecoratorNames,
} from '@angular/compiler-cli/src/ngtsc/annotations';
import {ReflectionHost} from '@angular/compiler-cli/src/ngtsc/reflection';
import {UniqueID} from '../../utils/tsurge';
import path from 'path';
import {extractDecoratorQueryMetadata} from '@angular/compiler-cli/src/ngtsc/annotations/directive';
import {PartialEvaluator} from '@angular/compiler-cli/private/migrations';
import {R3QueryMetadata} from '../../../../compiler';

/** Branded type to uniquely identify class properties in a project. */
export type ClassPropertyID = UniqueID<'ClassPropertyID; Potentially a query'>;

/** Type describing an extracted decorator query that can be migrated. */
export interface ExtractedQuery {
  id: ClassPropertyID;
  kind: 'viewChild' | 'viewChildren' | 'contentChild' | 'contentChildren';
  args: ts.Expression[];
  queryInfo: R3QueryMetadata;
}

/**
 * Determines if the given node refers to a decorator-based query, and
 * returns its resolved metadata if possible.
 */
export function extractSourceQueryDefinition(
  node: ts.Node,
  reflector: ReflectionHost,
  evaluator: PartialEvaluator,
  projectDirAbsPath: string,
): ExtractedQuery | null {
  if (
    !ts.isPropertyDeclaration(node) ||
    !ts.isClassDeclaration(node.parent) ||
    node.parent.name === undefined ||
    !ts.isIdentifier(node.name)
  ) {
    return null;
  }

  const decorators = reflector.getDecoratorsOfDeclaration(node) ?? [];
  const ngDecorators = getAngularDecorators(decorators, queryDecoratorNames, /* isCore */ false);
  if (ngDecorators.length === 0) {
    return null;
  }
  const decorator = ngDecorators[0];

  const id = getUniqueIDForClassProperty(node, projectDirAbsPath);
  if (id === null) {
    return null;
  }

  let kind: ExtractedQuery['kind'];
  if (decorator.name === 'ViewChild') {
    kind = 'viewChild';
  } else if (decorator.name === 'ViewChildren') {
    kind = 'viewChildren';
  } else if (decorator.name === 'ContentChild') {
    kind = 'contentChild';
  } else if (decorator.name === 'ContentChildren') {
    kind = 'contentChildren';
  } else {
    throw new Error('Unexpected query decorator detected.');
  }

  const queryInfo = extractDecoratorQueryMetadata(
    node,
    decorator.name,
    decorator.args ?? [],
    node.name.text,
    reflector,
    evaluator,
  );

  return {
    id,
    kind,
    args: decorator.args ?? [],
    queryInfo,
  };
}

/**
 * Gets a unique ID for the given class property.
 *
 * This is useful for matching class fields across compilation units.
 * E.g. a reference may point to the field via `.d.ts`, while the other
 * may reference it via actual `.ts` sources. IDs for the same fields
 * would then match identity.
 */
export function getUniqueIDForClassProperty(
  property: ts.PropertyDeclaration,
  projectDirAbsPath: string,
): ClassPropertyID | null {
  if (!ts.isClassDeclaration(property.parent) || property.parent.name === undefined) {
    return null;
  }
  const filePath = path
    .relative(projectDirAbsPath, property.getSourceFile().fileName)
    .replace(/\.d\.ts$/, '.ts');

  // Note: If a class is nested, there could be an ID clash.
  // This is highly unlikely though, and this is not a problem because
  // in such cases, there is even less chance there are any references to
  // a non-exported classes; in which case, cross-compilation unit references
  // likely can't exist anyway.

  return `${filePath}-${property.parent.name.text}-${property.name.getText()}` as ClassPropertyID;
}
