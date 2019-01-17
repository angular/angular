/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HostTree} from '@angular-devkit/schematics';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';
import {clean} from './index';

describe('Bazel-workspace Schematic', () => {
  const schematicRunner =
      new SchematicTestRunner('@angular/bazel', require.resolve('../collection.json'));
  const defaultOptions = {
    name: 'demo',
  };

  it('should generate Bazel workspace files', () => {
    const options = {...defaultOptions};
    const host = schematicRunner.runSchematic('bazel-workspace', options);
    const files = host.files;
    expect(files).toContain('/.bazelignore');
    expect(files).toContain('/.bazelrc');
    expect(files).toContain('/BUILD.bazel');
    expect(files).toContain('/src/BUILD.bazel');
    expect(files).toContain('/WORKSPACE');
    expect(files).toContain('/yarn.lock');
  });

  it('should find existing Angular version', () => {
    let host = new UnitTestTree(new HostTree);
    host.create('/node_modules/@angular/core/package.json', JSON.stringify({
      name: '@angular/core',
      version: '6.6.6',
    }));
    const options = {...defaultOptions};
    host = schematicRunner.runSchematic('bazel-workspace', options, host);
    expect(host.files).toContain('/WORKSPACE');
    const workspace = host.readContent('/WORKSPACE');
    expect(workspace).toMatch('ANGULAR_VERSION = "6.6.6"');
  });

  it('should have the correct entry_module for devserver', () => {
    const options = {...defaultOptions, name: 'demo-app'};
    const host = schematicRunner.runSchematic('bazel-workspace', options);
    const {files} = host;
    expect(files).toContain('/src/BUILD.bazel');
    const content = host.readContent('/src/BUILD.bazel');
    expect(content).toContain('entry_module = "demo_app/src/main.dev"');
  });

  it('should add router if project contains routing module', () => {
    let host = new UnitTestTree(new HostTree);
    host.create('/src/app/app-routing.module.ts', '');
    expect(host.files).toContain('/src/app/app-routing.module.ts');
    const options = {...defaultOptions};
    host = schematicRunner.runSchematic('bazel-workspace', options, host);
    expect(host.files).toContain('/src/BUILD.bazel');
    const content = host.readContent('/src/BUILD.bazel');
    expect(content).toContain('@angular//packages/router');
  });

  describe('WORKSPACE', () => {
    it('should contain project name', () => {
      const options = {...defaultOptions};
      const host = schematicRunner.runSchematic('bazel-workspace', options);
      expect(host.files).toContain('/WORKSPACE');
      const content = host.readContent('/WORKSPACE');
      expect(content).toContain('workspace(name = "demo")');
    });

    it('should convert dashes in name to underscore', () => {
      const options = {...defaultOptions, name: 'demo-project'};
      const host = schematicRunner.runSchematic('bazel-workspace', options);
      expect(host.files).toContain('/WORKSPACE');
      const content = host.readContent('/WORKSPACE');
      expect(content).toContain('workspace(name = "demo_project"');
    });
  });

  describe('SASS', () => {
    let host = new UnitTestTree(new HostTree);
    beforeAll(() => {
      host.create('/src/app/app.component.scss', '');
      expect(host.files).toContain('/src/app/app.component.scss');
      const options = {...defaultOptions};
      host = schematicRunner.runSchematic('bazel-workspace', options, host);
      expect(host.files).toContain('/WORKSPACE');
      expect(host.files).toContain('/src/BUILD.bazel');
    });

    it('should download and load rules_sass in WORKSPACE', () => {
      const content = host.readContent('/WORKSPACE');
      expect(content).toContain('RULES_SASS_VERSION');
      expect(content).toContain(
          'load("@io_bazel_rules_sass//sass:sass_repositories.bzl", "sass_repositories")');
    });

    it('should add sass_binary rules in src/BUILD', () => {
      const content = host.readContent('/src/BUILD.bazel');
      expect(content).toContain('load("@io_bazel_rules_sass//:defs.bzl", "sass_binary")');
      expect(content).toContain('glob(["**/*.scss"])');
    });
  });
});

describe('clean', () => {
  [['1.2.3', '1.2.3'], ['  1.2.3', '1.2.3'], ['1.2.3  ', '1.2.3'], ['~1.2.3', '1.2.3'],
   ['^1.2.3', '1.2.3'], ['v1.2.3', '1.2.3'], ['1.2', null], ['a.b.c', null],
  ].forEach(([version, want]: [string, string]) => {
    it(`should match ${version} with ${want}`, () => {
      const got = clean(version);
      expect(got).toBe(want);
    });
  });
});
