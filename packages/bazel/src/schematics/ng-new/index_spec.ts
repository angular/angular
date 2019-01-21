/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SchematicTestRunner} from '@angular-devkit/schematics/testing';

describe('Ng-new Schematic', () => {
  const schematicRunner =
      new SchematicTestRunner('@angular/bazel', require.resolve('../collection.json'), );
  const defaultOptions = {
    name: 'demo',
    version: '7.0.0',
  };

  it('should call external @schematics/angular', () => {
    const options = {...defaultOptions};
    const host = schematicRunner.runSchematic('ng-new', options);
    const {files} = host;
    // External schematic should produce workspace file angular.json
    expect(files).toContain('/demo/angular.json');
  });

  it('should add @angular/bazel to package.json dependencies', () => {
    const options = {...defaultOptions};
    const host = schematicRunner.runSchematic('ng-new', options);
    const {files} = host;
    expect(files).toContain('/demo/package.json');
    const content = host.readContent('/demo/package.json');
    expect(() => JSON.parse(content)).not.toThrow();
    const json = JSON.parse(content);
    const core = '@angular/core';
    const bazel = '@angular/bazel';
    expect(Object.keys(json)).toContain('dependencies');
    expect(Object.keys(json)).toContain('devDependencies');
    expect(Object.keys(json.dependencies)).toContain(core);
    expect(Object.keys(json.devDependencies)).toContain(bazel);
    expect(json.dependencies[core]).toBe(json.devDependencies[bazel]);
  });

  it('should add @bazel/* dev dependencies', () => {
    const options = {...defaultOptions};
    const host = schematicRunner.runSchematic('ng-new', options);
    const content = host.readContent('/demo/package.json');
    const json = JSON.parse(content);
    const devDeps = Object.keys(json.devDependencies);
    expect(devDeps).toContain('@bazel/karma');
    expect(devDeps).toContain('@bazel/typescript');
  });

  it('should create Bazel workspace file', () => {
    const options = {...defaultOptions};
    const host = schematicRunner.runSchematic('ng-new', options);
    const {files} = host;
    expect(files).toContain('/demo/WORKSPACE');
    expect(files).toContain('/demo/BUILD.bazel');
  });

  it('should produce main.prod.ts for AOT', () => {
    const options = {...defaultOptions};
    const host = schematicRunner.runSchematic('ng-new', options);
    const {files} = host;
    // main.prod.ts is used by Bazel for AOT
    expect(files).toContain('/demo/src/main.prod.ts');
    // main.ts is produced by original ng-new schematics
    // This file should be present for backwards compatibility.
    expect(files).toContain('/demo/src/main.ts');
  });

  it('should not overwrite index.html with script tags', () => {
    const options = {...defaultOptions};
    const host = schematicRunner.runSchematic('ng-new', options);
    const {files} = host;
    expect(files).toContain('/demo/src/index.html');
    const content = host.readContent('/demo/src/index.html');
    expect(content).not.toMatch('<script src="/zone.min.js"></script>');
    expect(content).not.toMatch('<script src="/bundle.min.js"></script>');
  });

  it('should generate main.dev.ts and main.prod.ts', () => {
    const options = {...defaultOptions};
    const host = schematicRunner.runSchematic('ng-new', options);
    const {files} = host;
    expect(files).toContain('/demo/src/main.dev.ts');
    expect(files).toContain('/demo/src/main.prod.ts');
  });

  it('should overwrite .gitignore for bazel-out directory', () => {
    const options = {...defaultOptions};
    const host = schematicRunner.runSchematic('ng-new', options);
    const {files} = host;
    expect(files).toContain('/demo/.gitignore');
    const content = host.readContent('/demo/.gitignore');
    expect(content).toMatch('/bazel-out');
  });

  it('should update angular.json to use Bazel builder', () => {
    const options = {...defaultOptions};
    const host = schematicRunner.runSchematic('ng-new', options);
    const {files} = host;
    expect(files).toContain('/demo/angular.json');
    const content = host.readContent('/demo/angular.json');
    expect(() => JSON.parse(content)).not.toThrow();
    const json = JSON.parse(content);
    let {architect} = json.projects.demo;
    expect(architect.build.builder).toBe('@angular/bazel:build');
    expect(architect.serve.builder).toBe('@angular/bazel:build');
    expect(architect.test.builder).toBe('@angular/bazel:build');
    architect = json.projects['demo-e2e'].architect;
    expect(architect.e2e.builder).toBe('@angular/bazel:build');
  });
});
