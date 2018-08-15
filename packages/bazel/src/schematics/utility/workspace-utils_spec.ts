/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {JsonAstObject, parseJsonAst} from '@angular-devkit/core';
import {isJsonAstObject} from './json-utils';
import {findE2eArchitect} from './workspace-utils';

describe('Workspace utils', () => {
  describe('findE2eArchitect', () => {
    it('should find e2e architect in old project layout', () => {
      const workspace = {
        projects: {
          demo: {},
          'demo-e2e': {
            architect: {},
          },
        },
      };
      const ast = parseJsonAst(JSON.stringify(workspace));
      const architect = findE2eArchitect(ast as JsonAstObject, 'demo');
      expect(isJsonAstObject(architect)).toBe(true);
    });

    it('should find e2e architect in new project layout', () => {
      const workspace = {
        projects: {
          demo: {
            architect: {},
          },
        },
      };
      const ast = parseJsonAst(JSON.stringify(workspace));
      const architect = findE2eArchitect(ast as JsonAstObject, 'demo');
      expect(isJsonAstObject(architect)).toBe(true);
    });
  });
});
