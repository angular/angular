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
    expect(files).toContain('/demo/.bazelignore');
    expect(files).toContain('/demo/.bazelrc');
    expect(files).toContain('/demo/BUILD.bazel');
    expect(files).toContain('/demo/src/BUILD.bazel');
    expect(files).toContain('/demo/WORKSPACE');
    expect(files).toContain('/demo/yarn.lock');
  });

  it('should find existing Angular version', () => {
    let host = new UnitTestTree(new HostTree);
    host.create('/demo/node_modules/@angular/core/package.json', JSON.stringify({
      name: '@angular/core',
      version: '6.6.6',
    }));
    const options = {...defaultOptions};
    host = schematicRunner.runSchematic('bazel-workspace', options, host);
    expect(host.files).toContain('/demo/WORKSPACE');
    const workspace = host.readContent('/demo/WORKSPACE');
    expect(workspace).toMatch('ANGULAR_VERSION = "6.6.6"');
  });

  it('should have the correct entry_module for devserver', () => {
    const options = {...defaultOptions, name: 'demo-app'};
    const host = schematicRunner.runSchematic('bazel-workspace', options);
    const {files} = host;
    expect(files).toContain('/demo-app/src/BUILD.bazel');
    const content = host.readContent('/demo-app/src/BUILD.bazel');
    expect(content).toContain('entry_module = "demo_app/src/main.dev"');
  });

  it('should add router if project contains routing module', () => {
    let host = new UnitTestTree(new HostTree);
    host.create('/demo/src/app/app-routing.module.ts', '');
    expect(host.files).toContain('/demo/src/app/app-routing.module.ts');
    const options = {...defaultOptions};
    host = schematicRunner.runSchematic('bazel-workspace', options, host);
    expect(host.files).toContain('/demo/src/BUILD.bazel');
    const content = host.readContent('/demo/src/BUILD.bazel');
    expect(content).toContain('@angular//packages/router');
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

  describe('SASS', () => {
    let host = new UnitTestTree(new HostTree);
    beforeAll(() => {
      host.create('/demo/src/app/app.component.scss', '');
      expect(host.files).toContain('/demo/src/app/app.component.scss');
      const options = {...defaultOptions};
      host = schematicRunner.runSchematic('bazel-workspace', options, host);
      expect(host.files).toContain('/demo/WORKSPACE');
      expect(host.files).toContain('/demo/src/BUILD.bazel');
    });

    it('should download rules_sass in WORKSPACE', () => {
      const content = host.readContent('/demo/WORKSPACE');
      expect(content).toContain('RULES_SASS_VERSION');
      expect(content).toContain('io_bazel_rules_sass');
    });

    it('should load sass_repositories in WORKSPACE', () => {
      const content = host.readContent('/demo/WORKSPACE');
      expect(content).toContain(
          'load("@io_bazel_rules_sass//sass:sass_repositories.bzl", "sass_repositories")');
      expect(content).toContain('sass_repositories()');
    });

    it('should add sass_binary rules in src/BUILD', () => {
      const content = host.readContent('/demo/src/BUILD.bazel');
      expect(content).toContain('load("@io_bazel_rules_sass//:defs.bzl", "sass_binary")');
      expect(content).toMatch(/sass_binary\((.*\n)+\)/);
    });

    it('should add SASS targets to assets of ng_module in src/BUILD', () => {
      const content = host.readContent('/demo/src/BUILD.bazel');
      expect(content).toContain(`
    assets = glob([
      "**/*.css",
      "**/*.html",
    ]) + [":style_" + x for x in glob(["**/*.scss"])],`);
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
