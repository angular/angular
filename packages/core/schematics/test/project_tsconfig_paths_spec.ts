/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HostTree} from '@angular-devkit/schematics';
import {UnitTestTree} from '@angular-devkit/schematics/testing';

import {getProjectTsConfigPaths} from '../utils/project_tsconfig_paths';

describe('project tsconfig paths', () => {
  let testTree: UnitTestTree;

  beforeEach(() => {
    testTree = new UnitTestTree(new HostTree());
  });

  it('should detect build tsconfig path inside of angular.json file', async () => {
    testTree.create('/my-custom-config.json', '');
    testTree.create('/angular.json', JSON.stringify({
      version: 1,
      projects: {
        my_name: {root: '', architect: {build: {options: {tsConfig: './my-custom-config.json'}}}}
      }
    }));

    expect((await getProjectTsConfigPaths(testTree)).buildPaths).toEqual(['my-custom-config.json']);
  });

  it('should be able to read workspace configuration which is using jsconc-parser features',
     async () => {
       testTree.create('/my-build-config.json', '');
       testTree.create('/angular.json', `{
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
    }`);

       expect((await getProjectTsConfigPaths(testTree)).buildPaths).toEqual([
         'my-build-config.json'
       ]);
     });

  it('should detect test tsconfig path inside of angular.json file', async () => {
    testTree.create('/my-test-config.json', '');
    testTree.create('/angular.json', JSON.stringify({
      version: 1,
      projects:
          {my_name: {root: '', architect: {test: {options: {tsConfig: './my-test-config.json'}}}}}
    }));

    expect((await getProjectTsConfigPaths(testTree)).testPaths).toEqual(['my-test-config.json']);
  });

  it('should detect test tsconfig path inside of .angular.json file', async () => {
    testTree.create('/my-test-config.json', '');
    testTree.create('/.angular.json', JSON.stringify({
      version: 1,
      projects: {
        with_tests: {root: '', architect: {test: {options: {tsConfig: './my-test-config.json'}}}}
      }
    }));

    expect((await getProjectTsConfigPaths(testTree)).testPaths).toEqual(['my-test-config.json']);
  });

  it('should not return duplicate tsconfig files', async () => {
    testTree.create('/tsconfig.json', '');
    testTree.create('/.angular.json', JSON.stringify({
      version: 1,
      projects: {app: {root: '', architect: {build: {options: {tsConfig: 'tsconfig.json'}}}}}
    }));

    expect((await getProjectTsConfigPaths(testTree)).buildPaths).toEqual(['tsconfig.json']);
  });
});
