/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HostTree} from '@angular-devkit/schematics';
import {UnitTestTree} from '@angular-devkit/schematics/testing/index.js';

import {getProjectTsConfigPaths} from '../utils/project_tsconfig_paths';

describe('project tsconfig paths', () => {
  let testTree: UnitTestTree;

  beforeEach(() => {
    testTree = new UnitTestTree(new HostTree());
  });

  it('should detect build tsconfig path inside of angular.json file', async () => {
    testTree.create('/my-custom-config.json', '');
    testTree.create(
      '/angular.json',
      JSON.stringify({
        version: 1,
        projects: {
          my_name: {root: '', architect: {build: {options: {tsConfig: './my-custom-config.json'}}}},
        },
      }),
    );

    expect((await getProjectTsConfigPaths(testTree)).buildPaths).toEqual(['my-custom-config.json']);
  });

  it('should be able to read workspace configuration which is using jsconc-parser features', async () => {
    testTree.create('/my-build-config.json', '');
    testTree.create(
      '/angular.json',
      `{
      "version": 1,
      // Comments are supported in the workspace configurations.
      "projects": {
        "with_tests": {
          "root": "",
          "targets": {
            "build": {
              "options": {
                "tsConfig": "./my-build-config.json",
              }
            }
          }
        }
      },
    }`,
    );

    expect((await getProjectTsConfigPaths(testTree)).buildPaths).toEqual(['my-build-config.json']);
  });

  it('should detect test tsconfig path inside of angular.json file', async () => {
    testTree.create('/my-test-config.json', '');
    testTree.create(
      '/angular.json',
      JSON.stringify({
        version: 1,
        projects: {
          my_name: {root: '', architect: {test: {options: {tsConfig: './my-test-config.json'}}}},
        },
      }),
    );

    expect((await getProjectTsConfigPaths(testTree)).testPaths).toEqual(['my-test-config.json']);
  });

  it('should detect test tsconfig path inside of .angular.json file', async () => {
    testTree.create('/my-test-config.json', '');
    testTree.create(
      '/.angular.json',
      JSON.stringify({
        version: 1,
        projects: {
          with_tests: {root: '', architect: {test: {options: {tsConfig: './my-test-config.json'}}}},
        },
      }),
    );

    expect((await getProjectTsConfigPaths(testTree)).testPaths).toEqual(['my-test-config.json']);
  });

  it('should not return duplicate tsconfig files', async () => {
    testTree.create('/tsconfig.json', '');
    testTree.create(
      '/.angular.json',
      JSON.stringify({
        version: 1,
        projects: {app: {root: '', architect: {build: {options: {tsConfig: 'tsconfig.json'}}}}},
      }),
    );

    expect((await getProjectTsConfigPaths(testTree)).buildPaths).toEqual(['tsconfig.json']);
  });

  it('should only return tsconfig paths of Angular builders when `angularBuildersOnly` is set', async () => {
    testTree.create('/tsconfig.app.json', '');
    testTree.create('/tsconfig.nx.json', '');
    testTree.create('/tsconfig.lib.json', '');
    testTree.create('/tsconfig.ngx-build-plus.json', '');
    testTree.create(
      '/angular.json',
      JSON.stringify({
        version: 1,
        projects: {
          angular_app: {
            root: '',
            architect: {
              build: {
                builder: '@angular/build:application',
                options: {tsConfig: './tsconfig.app.json'},
              },
            },
          },
          nx_angular_app: {
            root: '',
            architect: {
              build: {
                builder: '@nx/angular:webpack-browser',
                options: {tsConfig: './tsconfig.nx.json'},
              },
            },
          },
          node_lib: {
            root: '',
            architect: {
              build: {builder: '@nx/js:tsc', options: {tsConfig: './tsconfig.lib.json'}},
            },
          },
          ngx_build_plus_app: {
            root: '',
            architect: {
              build: {
                builder: 'ngx-build-plus:browser',
                options: {tsConfig: './tsconfig.ngx-build-plus.json'},
              },
            },
          },
        },
      }),
    );

    const {buildPaths} = await getProjectTsConfigPaths(testTree, {angularBuildersOnly: true});
    expect(buildPaths).toEqual([
      'tsconfig.app.json',
      'tsconfig.nx.json',
      'tsconfig.ngx-build-plus.json',
    ]);
  });
});
