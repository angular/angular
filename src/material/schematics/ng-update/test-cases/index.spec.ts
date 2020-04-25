import {getAllVersionNames} from '@angular/cdk/schematics';
import {defineJasmineTestCases, findBazelVersionTestCases} from '@angular/cdk/schematics/testing';
import {MIGRATION_PATH} from '../../index.spec';

describe('Material upgrade test cases', () => {
  const versionNames = getAllVersionNames().map(versionName => versionName.toLowerCase());
  const testCasesMap =
      findBazelVersionTestCases('angular_material/src/material/schematics/ng-update/test-cases');

  // Setup the test cases for each target version. The test cases will be automatically
  // detected through Bazel's runfiles manifest.
  versionNames.forEach(version => describe(`${version} update`, () => {
                         defineJasmineTestCases(
                             version, MIGRATION_PATH, testCasesMap.get(version));
                       }));
});
