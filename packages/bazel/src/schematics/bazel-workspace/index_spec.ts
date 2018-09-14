/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SchematicTestRunner} from '@angular-devkit/schematics/testing';

describe('Bazel-workspace Schematic', () => {
  const schematicRunner =
      new SchematicTestRunner('@angular/bazel', require.resolve('../collection.json'), );
  const defaultOptions = {
    name: 'demo',
  };

  it('should generate Bazel workspace files', () => {
    const options = {...defaultOptions};
    const host = schematicRunner.runSchematic('bazel-workspace', options);
    const files = host.files;
    expect(files).toContain('/demo/.bazelignore');
    expect(files).toContain('/demo/.bazelrc');
    expect(files).toContain('/demo/BUILD.bazel');
    expect(files).toContain('/demo/src/BUILD.bazel');
    expect(files).toContain('/demo/WORKSPACE');
    expect(files).toContain('/demo/yarn.lock');
  });

  describe('WORKSPACE', () => {
    it('should contain project name', () => {
      const options = {...defaultOptions};
      const host = schematicRunner.runSchematic('bazel-workspace', options);
      expect(host.files).toContain('/demo/WORKSPACE');
      const content = host.readContent('/demo/WORKSPACE');
      expect(content).toContain('workspace(name = "demo")');
    });

    it('should convert dashes in name to underscore', () => {
      const options = {...defaultOptions, name: 'demo-project'};
      const host = schematicRunner.runSchematic('bazel-workspace', options);
      expect(host.files).toContain('/demo-project/WORKSPACE');
      const content = host.readContent('/demo-project/WORKSPACE');
      expect(content).toContain('workspace(name = "demo_project"');
    });
  });
});
