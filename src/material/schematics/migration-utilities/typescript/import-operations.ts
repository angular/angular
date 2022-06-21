/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Update} from '../update';
import * as ts from 'typescript';

/** Returns an Update that renames the module specifier of the given import declaration node. */
export function updateModuleSpecifier(
  node: ts.ImportDeclaration,
  opts: {
    moduleSpecifier: string;
  },
): Update {
  const moduleSpecifier = node.moduleSpecifier as ts.StringLiteral;
  return {
    offset: moduleSpecifier.pos,
    updateFn: (text: string) => {
      const index = text.indexOf(moduleSpecifier.text, moduleSpecifier.pos);
      return (
        text.slice(0, index) +
        opts.moduleSpecifier +
        text.slice(index + moduleSpecifier.text.length)
      );
    },
  };
}
