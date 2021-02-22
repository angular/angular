/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ivyEnabled, obsoleteInIvy} from '@angular/private/testing';
import * as path from 'path';
import * as shx from 'shelljs';

/** Runfiles helper from bazel to resolve file name paths.  */
const runfiles = require(process.env['BAZEL_NODE_RUNFILES_HELPER']!);

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
    segments.push(...entry.split('/').filter(s => s !== ''));
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
        expect(shx.grep('"main":', packageJson)).toContain(`./bundles/core.umd.js`);
        expect(shx.grep('"module":', packageJson)).toContain(`./fesm2015/core.js`);
        expect(shx.grep('"es2015":', packageJson)).toContain(`./fesm2015/core.js`);
        expect(shx.grep('"esm2015":', packageJson)).toContain(`./esm2015/core.js`);
        expect(shx.grep('"typings":', packageJson)).toContain(`./core.d.ts`);
      });

      it('should contain metadata for ng update', () => {
        interface PackageJson {
          'ng-update': {packageGroup: string[];};
        }
        expect(shx.cat(packageJson)).not.toContain('NG_UPDATE_PACKAGE_GROUP');
        expect((JSON.parse(shx.cat(packageJson)) as PackageJson)['ng-update'].packageGroup)
            .toContain('@angular/core');
      });
    });

    describe('typescript support', () => {
      if (ivyEnabled) {
        it('should have an index d.ts file', () => {
          expect(shx.cat('core.d.ts')).toContain(`export *`);
        });

        it('should not have amd module names', () => {
          expect(shx.cat('public_api.d.ts')).not.toContain('<amd-module name');
        });
      } else {
        it('should have an index d.ts file', () => {
          expect(shx.cat('core.d.ts')).toContain('export declare');
        });
        it('should have an r3_symbols d.ts file', () => {
          expect(shx.cat('src/r3_symbols.d.ts')).toContain('export declare');
        });
      }
    });

    obsoleteInIvy('metadata files are no longer needed or produced in Ivy')
        .describe('angular metadata', () => {
          it('should have metadata.json files', () => {
            expect(shx.cat('core.metadata.json')).toContain(`"__symbolic":"module"`);
          });
          it('should not have self-references in metadata.json', () => {
            expect(shx.cat('core.metadata.json')).not.toContain(`"from":"./core"`);
          });
        });

    describe('fesm2015', () => {
      it('should have a fesm15 file in the /fesm2015 directory', () => {
        expect(shx.cat('fesm2015/core.js')).toContain(`export {`);
      });

      it('should have a source map', () => {
        expect(shx.cat('fesm2015/core.js.map'))
            .toContain(`{"version":3,"file":"core.js","sources":`);
      });

      it('should have the version info in the header', () => {
        expect(shx.cat('fesm2015/core.js'))
            .toMatch(/@license Angular v\d+\.\d+\.\d+(?!-PLACEHOLDER)/);
      });

      obsoleteInIvy('we no longer need to export private symbols')
          .it('should have been built from the generated bundle index', () => {
            expect(shx.cat('fesm2015/core.js')).toMatch('export {.*makeParamDecorator');
          });
    });

    describe('esm2015', () => {
      it('should not contain any *.ngfactory.js files', () => {
        expect(shx.find('esm2015').filter(f => f.endsWith('.ngfactory.js'))).toEqual([]);
      });

      it('should not contain any *.ngsummary.js files', () => {
        expect(shx.find('esm2015').filter(f => f.endsWith('.ngsummary.js'))).toEqual([]);
      });
    });

    describe('umd', () => {
      it('should have a umd file in the /bundles directory', () => {
        expect(shx.ls('bundles/core.umd.js').length).toBe(1, 'File not found');
      });

      it('should have a source map next to the umd file', () => {
        expect(shx.ls('bundles/core.umd.js.map').length).toBe(1, 'File not found');
      });

      it('should have a minified umd file in the /bundles directory', () => {
        expect(shx.ls('bundles/core.umd.min.js').length).toBe(1, 'File not found');
      });

      it('should have a source map next to the minified umd file', () => {
        expect(shx.ls('bundles/core.umd.min.js.map').length).toBe(1, 'File not found');
      });

      it('should have the version info in the header', () => {
        expect(shx.cat('bundles/core.umd.js'))
            .toMatch(/@license Angular v\d+\.\d+\.\d+(?!-PLACEHOLDER)/);
      });

      it('should have tslib helpers', () => {
        expect(shx.cat('bundles/core.umd.js')).toContain('function __extends');
        expect(shx.cat('bundles/core.umd.js')).not.toContain('undefined.__extends');
      });
      it('should have an AMD name', () => {
        expect(shx.cat('bundles/core.umd.js')).toContain('define(\'@angular/core\'');
      });
      it('should define ng global symbols', () => {
        expect(shx.cat('bundles/core.umd.js')).toContain('global.ng.core = {}');
      });
    });
  });

  describe('secondary entry-point', () => {
    describe('package.json', () => {
      const packageJson = p`testing/package.json`;

      it('should have a package.json file', () => {
        expect(shx.grep('"name":', packageJson)).toContain(`@angular/core/testing`);
      });

      it('should have its module resolution mappings defined in the nested package.json', () => {
        const packageJson = p`testing/package.json`;
        expect(shx.grep('"main":', packageJson)).toContain(`../bundles/core-testing.umd.js`);
        expect(shx.grep('"module":', packageJson)).toContain(`../fesm2015/testing.js`);
        expect(shx.grep('"es2015":', packageJson)).toContain(`../fesm2015/testing.js`);
        expect(shx.grep('"esm2015":', packageJson)).toContain(`../esm2015/testing/testing.js`);
        expect(shx.grep('"typings":', packageJson)).toContain(`./testing.d.ts`);
      });
    });

    describe('typings', () => {
      if (ivyEnabled) {
        const typingsFile = p`testing/index.d.ts`;
        it('should have a typings file', () => {
          expect(shx.cat(typingsFile)).toContain(`export * from './public_api';`);
        });
      } else {
        const typingsFile = p`testing/testing.d.ts`;
        it('should have a typings file', () => {
          expect(shx.cat(typingsFile)).toContain('export declare');
        });
      }

      obsoleteInIvy(
          'now that we don\'t need metadata files, we don\'t need these redirects to help resolve paths to them')
          .it('should have an \'redirect\' d.ts file in the parent dir', () => {
            expect(shx.cat('testing.d.ts')).toContain(`export * from './testing/testing';`);
          });
    });

    obsoleteInIvy('metadata files are no longer needed or produced in Ivy')
        .describe('angular metadata file', () => {
          it('should have a \'redirect\' metadata.json file next to the d.ts file', () => {
            expect(shx.cat('testing.metadata.json'))
                .toContain(
                    `"exports":[{"from":"./testing/testing"}],"flatModuleIndexRedirect":true`);
          });
        });

    describe('fesm2015', () => {
      it('should have a fesm15 file in the /fesm2015 directory', () => {
        expect(shx.cat('fesm2015/testing.js')).toContain(`export {`);
      });

      it('should have a source map', () => {
        expect(shx.cat('fesm2015/testing.js.map'))
            .toContain(`{"version":3,"file":"testing.js","sources":`);
      });

      it('should have the version info in the header', () => {
        expect(shx.cat('fesm2015/testing.js'))
            .toMatch(/@license Angular v\d+\.\d+\.\d+(?!-PLACEHOLDER)/);
      });
    });

    describe('umd', () => {
      it('should have a umd file in the /bundles directory', () => {
        expect(shx.ls('bundles/core-testing.umd.js').length).toBe(1, 'File not found');
      });

      it('should have a source map next to the umd file', () => {
        expect(shx.ls('bundles/core-testing.umd.js.map').length).toBe(1, 'File not found');
      });

      it('should have a minified umd file in the /bundles directory', () => {
        expect(shx.ls('bundles/core-testing.umd.min.js').length).toBe(1, 'File not found');
      });

      it('should have a source map next to the minified umd file', () => {
        expect(shx.ls('bundles/core-testing.umd.min.js.map').length).toBe(1, 'File not found');
      });

      it('should have an AMD name', () => {
        expect(shx.cat('bundles/core-testing.umd.js'))
            .toContain('define(\'@angular/core/testing\'');
      });

      it('should define ng global symbols', () => {
        expect(shx.cat('bundles/core-testing.umd.js')).toContain('global.ng.core.testing = {}');
      });
    });
  });
});
