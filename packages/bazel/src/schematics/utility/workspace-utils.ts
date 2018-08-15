/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {JsonAstNode, JsonAstObject} from '@angular-devkit/core';
import {findPropertyInAstObject} from '@schematics/angular/utility/json-utils';
import {isJsonAstObject} from './json-utils';

/**
 * Find the e2e architect node in the JSON ast.
 * The e2e application is relocated alongside the existing application.
 * This function supports looking up the e2e architect in both the new and old
 * layout.
 * See https://github.com/angular/angular-cli/pull/13780
 */
export function findE2eArchitect(ast: JsonAstObject, name: string): JsonAstObject|null {
  const projects = findPropertyInAstObject(ast, 'projects');
  if (!isJsonAstObject(projects)) {
    return null;
  }
  let architect: JsonAstNode|null;
  const e2e = findPropertyInAstObject(projects, `${name}-e2e`);
  if (isJsonAstObject(e2e)) {
    architect = findPropertyInAstObject(e2e, 'architect');
  } else {
    const project = findPropertyInAstObject(projects, name);
    if (!isJsonAstObject(project)) {
      return null;
    }
    architect = findPropertyInAstObject(project, 'architect');
  }
  if (!isJsonAstObject(architect)) {
    return null;
  }
  return architect;
}
