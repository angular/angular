import {defineJasmineTestCases, findBazelVersionTestCases} from '@angular/cdk/schematics/testing';
import {getAllVersionNames} from '@angular/cdk/schematics';

/** Path to the schematic collection that includes the migrations. */
export const migrationCollection = require.resolve('../../migration.json');

describe('Material upgrade test cases', () => {

  const versionNames = getAllVersionNames().map(versionName => versionName.toLowerCase());
  const testCasesMap = findBazelVersionTestCases(
    'angular_material/src/lib/schematics/ng-update/test-cases');

  // Setup the test cases for each target version. The test cases will be automatically
  // detected through Bazel's runfiles manifest.
  versionNames.forEach(version => describe(`${version} update`, () => {
    defineJasmineTestCases(version, migrationCollection, testCasesMap.get(version));
  }));
});
