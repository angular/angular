/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as path from 'path';

import {readConfiguration} from '../src/perform_compile';

import {TestSupport, setup} from './test_support';

describe('perform_compile', () => {
  let support: TestSupport;
  let basePath: string;

  beforeEach(() => {
    support = setup();
    basePath = support.basePath;
  });

  function writeSomeConfigs() {
    support.writeFiles({
      'tsconfig-level-1.json': `{
          "extends": "./tsconfig-level-2.json",
          "angularCompilerOptions": {
            "annotateForClosureCompiler": true
          }
        }
      `,
      'tsconfig-level-2.json': `{
          "extends": "./tsconfig-level-3.json",
          "angularCompilerOptions": {
            "skipMetadataEmit": true
          }
        }
      `,
      'tsconfig-level-3.json': `{
          "angularCompilerOptions": {
            "annotateForClosureCompiler": false,
            "annotationsAs": "decorators"
          }
        }
      `,
    });
  }

  it('should merge tsconfig "angularCompilerOptions"', () => {
    writeSomeConfigs();
    const {options} = readConfiguration(path.resolve(basePath, 'tsconfig-level-1.json'));
    expect(options.annotateForClosureCompiler).toBe(true);
    expect(options.annotationsAs).toBe('decorators');
    expect(options.skipMetadataEmit).toBe(true);
  });

});
