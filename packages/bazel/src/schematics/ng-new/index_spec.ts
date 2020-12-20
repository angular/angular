/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SchematicTestRunner} from '@angular-devkit/schematics/testing';

describe('ng-new schematic', () => {
  const schematicRunner = new SchematicTestRunner(
      '@angular/bazel',
      require.resolve('../collection.json'),
  );
  const defaultOptions = {
    name: 'demo',
    version: '7.0.0',
  };

  it('should call external @schematics/angular', async () => {
    const options = {...defaultOptions};
    const host = await schematicRunner.runSchematicAsync('ng-new', options).toPromise();
    const {files} = host;
    // External schematic should produce workspace file angular.json
    expect(files).toContain('/demo/angular.json');
    expect(files).toContain('/demo/package.json');
  });

  it('should call ng-add to generate additional files needed by Bazel', async () => {
    const options = {...defaultOptions};
    const host = await schematicRunner.runSchematicAsync('ng-new', options).toPromise();
    const {files} = host;
    expect(files).toContain('/demo/src/main.dev.ts');
    expect(files).toContain('/demo/src/main.prod.ts');
  });
});
