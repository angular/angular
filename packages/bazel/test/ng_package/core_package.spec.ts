/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {runfiles} from '@bazel/runfiles';
import path from 'path';
import shx from 'shelljs';

import {matchesObjectWithOrder} from './test_utils';

// Resolve the "npm_package" directory by using the runfile resolution. Note that we need to
// resolve the "package.json" of the package since otherwise NodeJS would resolve the "main"
// file, which is not necessarily at the root of the "npm_package".
shx.cd(path.dirname(runfiles.resolve('angular/packages/core/npm_package/package.json')));

/**
 * Utility functions that allows me to create fs paths
 *   p`${foo}/some/${{bar}}/path` rather than path.join(foo, 'some',
 */
function p(templateStringArray: TemplateStringsArray) {
  const segments = [];
  for (const entry of templateStringArray) {
    segments.push(...entry.split('/').filter((s) => s !== ''));
  }
  return path.join(...segments);
}

describe('@angular/core ng_package', () => {
  describe('misc root files', () => {
    describe('README.md', () => {
      it('should have a README.md file with basic info', () => {
        expect(shx.cat('README.md')).toContain(`Angular`);
        expect(shx.cat('README.md')).toContain(`https://github.com/angular/angular`);
      });
    });
  });

  describe('primary entry-point', () => {
    describe('package.json', () => {
      const packageJson = 'package.json';

      it('should have a package.json file', () => {
        expect(shx.grep('"name":', packageJson)).toContain(`@angular/core`);
      });

      it('should contain correct version number with the PLACEHOLDER string replaced', () => {
        expect(shx.grep('"version":', packageJson)).toMatch(/\d+\.\d+\.\d+(?!-PLACEHOLDER)/);
      });

      it('should contain module resolution mappings', () => {
        const data = JSON.parse(shx.cat(packageJson)) as any;
        expect(data).toEqual(
          jasmine.objectContaining({
            module: `./fesm2022/core.mjs`,
            typings: `./index.d.ts`,
            exports: matchesObjectWithOrder({
              './schematics/*': {default: './schematics/*.js'},
              './event-dispatch-contract.min.js': {default: './event-dispatch-contract.min.js'},
              './package.json': {default: './package.json'},
              '.': {
                types: './index.d.ts',
                default: './fesm2022/core.mjs',
              },
              './primitives/di': {
                types: './primitives/di/index.d.ts',
                default: './fesm2022/primitives/di.mjs',
              },
              './primitives/event-dispatch': {
                types: './primitives/event-dispatch/index.d.ts',
                default: './fesm2022/primitives/event-dispatch.mjs',
              },
              './primitives/signals': {
                types: './primitives/signals/index.d.ts',
                default: './fesm2022/primitives/signals.mjs',
              },
              './rxjs-interop': {
                types: './rxjs-interop/index.d.ts',
                default: './fesm2022/rxjs-interop.mjs',
              },
              './testing': {
                types: './testing/index.d.ts',
                default: './fesm2022/testing.mjs',
              },
            }),
          }),
        );
      });

      it('should contain metadata for ng update', () => {
        interface PackageJson {
          'ng-update': {packageGroup: string[]};
        }

        expect(shx.cat(packageJson)).not.toContain('NG_UPDATE_PACKAGE_GROUP');
        expect(
          (JSON.parse(shx.cat(packageJson)) as PackageJson)['ng-update'].packageGroup,
        ).toContain('@angular/core');
      });
    });

    describe('typescript support', () => {
      it('should not have amd module names', () => {
        expect(shx.cat('index.d.ts')).not.toContain('<amd-module name');
      });
      it('should have an index d.ts file', () => {
        expect(shx.cat('index.d.ts')).toContain('export ');
      });

      // The `r3_symbols` file was needed for View Engine ngcc processing.
      // This test ensures we no longer ship it by accident.
      it('should not have an r3_symbols d.ts file', () => {
        expect(shx.test('-e', 'src/r3_symbols.d.ts')).toBe(false);
      });
    });

    describe('fesm2022', () => {
      it('should have a fesm2022 file in the /fesm2022 directory', () => {
        expect(shx.cat('fesm2022/core.mjs')).toContain(`export {`);
      });

      it('should have a source map', () => {
        expect(shx.cat('fesm2022/core.mjs.map')).toContain(
          `{"version":3,"file":"core.mjs","sources":`,
        );
      });

      it('should have the version info in the header', () => {
        expect(shx.cat('fesm2022/core.mjs')).toMatch(
          /@license Angular v\d+\.\d+\.\d+(?!-PLACEHOLDER)/,
        );
      });
    });
  });

  describe('secondary entry-point', () => {
    describe('typings', () => {
      const typingsFile = p`testing/index.d.ts`;
      it('should have a typings file', () => {
        expect(shx.cat(typingsFile)).toContain('export ');
      });
    });

    describe('fesm2022', () => {
      it('should have a fesm2022 file in the /fesm2022 directory', () => {
        expect(shx.cat('fesm2022/testing.mjs')).toContain(`export {`);
      });

      it('should have a source map', () => {
        expect(shx.cat('fesm2022/testing.mjs.map')).toContain(
          `{"version":3,"file":"testing.mjs","sources":`,
        );
      });

      it('should have the version info in the header', () => {
        expect(shx.cat('fesm2022/testing.mjs')).toMatch(
          /@license Angular v\d+\.\d+\.\d+(?!-PLACEHOLDER)/,
        );
      });
    });
  });
});
