/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HostTree} from '@angular-devkit/schematics';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing';

describe('ng-add schematic', () => {

  const defaultOptions = {name: 'demo'};
  let host: UnitTestTree;
  let schematicRunner: SchematicTestRunner;

  beforeEach(() => {
    host = new UnitTestTree(new HostTree());
    host.create('package.json', JSON.stringify({
      name: 'demo',
      dependencies: {
        '@angular/core': '1.2.3',
        'rxjs': '~6.3.3',
      },
      devDependencies: {
        'typescript': '3.2.2',
      },
    }));
    host.create('tsconfig.json', JSON.stringify({
      compileOnSave: false,
      compilerOptions: {
        baseUrl: './',
        outDir: './dist/out-tsc',
      }
    }));
    host.create('angular.json', JSON.stringify({
      projects: {
        'demo': {
          architect: {
            build: {},
            serve: {},
            test: {},
            'extract-i18n': {
              builder: '@angular-devkit/build-angular:extract-i18n',
            },
          },
        },
        'demo-e2e': {
          architect: {
            e2e: {},
            lint: {
              builder: '@angular-devkit/build-angular:tslint',
            },
          },
        },
      },
      defaultProject: 'demo',
    }));
    schematicRunner =
        new SchematicTestRunner('@angular/bazel', require.resolve('../collection.json'));
  });

  it('throws if package.json is not found', () => {
    expect(host.files).toContain('/package.json');
    host.delete('/package.json');
    expect(() => schematicRunner.runSchematic('ng-add', defaultOptions))
        .toThrowError('Could not find package.json');
  });

  it('throws if angular.json is not found', () => {
    expect(host.files).toContain('/angular.json');
    host.delete('/angular.json');
    expect(() => schematicRunner.runSchematic('ng-add', defaultOptions, host))
        .toThrowError('Could not find angular.json');
  });

  it('should add @angular/bazel to package.json dependencies', () => {
    host = schematicRunner.runSchematic('ng-add', defaultOptions, host);
    const {files} = host;
    expect(files).toContain('/package.json');
    const content = host.readContent('/package.json');
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
    host = schematicRunner.runSchematic('ng-add', defaultOptions, host);
    const content = host.readContent('/package.json');
    const json = JSON.parse(content);
    const devDeps = Object.keys(json.devDependencies);
    expect(devDeps).toContain('@bazel/bazel');
    expect(devDeps).toContain('@bazel/ibazel');
    expect(devDeps).toContain('@bazel/karma');
  });

  it('should replace an existing dev dependency', () => {
    expect(host.files).toContain('/package.json');
    const packageJson = JSON.parse(host.readContent('/package.json'));
    packageJson.devDependencies['@angular/bazel'] = '4.2.42';
    host.overwrite('/package.json', JSON.stringify(packageJson));
    host = schematicRunner.runSchematic('ng-add', defaultOptions, host);
    const content = host.readContent('/package.json');
    // It is possible that a dep gets added twice if the package already exists.
    expect(content.match(/@angular\/bazel/g) !.length).toEqual(1);
    const json = JSON.parse(content);
    expect(json.devDependencies['@angular/bazel']).toBe('1.2.3');
  });

  it('should remove an existing dependency', () => {
    expect(host.files).toContain('/package.json');
    const packageJson = JSON.parse(host.readContent('/package.json'));
    packageJson.dependencies['@angular/bazel'] = '4.2.42';
    expect(Object.keys(packageJson.dependencies)).toContain('@angular/bazel');
    host.overwrite('/package.json', JSON.stringify(packageJson));
    host = schematicRunner.runSchematic('ng-add', defaultOptions, host);
    const content = host.readContent('/package.json');
    const json = JSON.parse(content);
    expect(Object.keys(json.dependencies)).not.toContain('@angular/bazel');
    expect(json.devDependencies['@angular/bazel']).toBe('1.2.3');
  });

  it('should not create Bazel workspace file', () => {
    host = schematicRunner.runSchematic('ng-add', defaultOptions, host);
    const {files} = host;
    expect(files).not.toContain('/WORKSPACE');
    expect(files).not.toContain('/BUILD.bazel');
  });

  it('should produce main.dev.ts and main.prod.ts for AOT', () => {
    host.create('/src/main.ts', 'generated by CLI');
    host = schematicRunner.runSchematic('ng-add', defaultOptions, host);
    const {files} = host;
    // main.dev.ts and main.prod.ts are used by Bazel for AOT
    expect(files).toContain('/src/main.dev.ts');
    expect(files).toContain('/src/main.prod.ts');
    // main.ts is produced by original ng-add schematics
    // This file should be present for backwards compatibility.
    expect(files).toContain('/src/main.ts');
  });

  it('should not overwrite index.html with script tags', () => {
    host.create('/src/index.html', '<html>Hello World</html>');
    host = schematicRunner.runSchematic('ng-add', defaultOptions, host);
    const {files} = host;
    expect(files).toContain('/src/index.html');
    const content = host.readContent('/src/index.html');
    expect(content).not.toMatch('<script src="/zone.min.js"></script>');
    expect(content).not.toMatch('<script src="/bundle.min.js"></script>');
  });

  it('should generate main.dev.ts and main.prod.ts', () => {
    host = schematicRunner.runSchematic('ng-add', defaultOptions, host);
    const {files} = host;
    expect(files).toContain('/src/main.dev.ts');
    expect(files).toContain('/src/main.prod.ts');
  });

  it('should overwrite .gitignore for bazel-out directory', () => {
    host.create('.gitignore', '\n# compiled output\n');
    host = schematicRunner.runSchematic('ng-add', defaultOptions, host);
    const {files} = host;
    expect(files).toContain('/.gitignore');
    const content = host.readContent('/.gitignore');
    expect(content).toMatch('\n# compiled output\n/bazel-out\n');
  });

  it('should create a backup for original angular.json', () => {
    expect(host.files).toContain('/angular.json');
    const original = host.readContent('/angular.json');
    host = schematicRunner.runSchematic('ng-add', defaultOptions, host);
    expect(host.files).toContain('/angular.json.bak');
    const content = host.readContent('/angular.json.bak');
    expect(content.startsWith('// This is a backup file')).toBe(true);
    expect(content).toMatch(original);
  });

  it('should update angular.json to use Bazel builder', () => {
    host = schematicRunner.runSchematic('ng-add', defaultOptions, host);
    const {files} = host;
    expect(files).toContain('/angular.json');
    const content = host.readContent('/angular.json');
    expect(() => JSON.parse(content)).not.toThrow();
    const json = JSON.parse(content);
    const demo = json.projects.demo;
    const demo_e2e = json.projects['demo-e2e'];
    const {build, serve, test} = demo.architect;
    expect(build.builder).toBe('@angular/bazel:build');
    expect(serve.builder).toBe('@angular/bazel:build');
    expect(test.builder).toBe('@angular/bazel:build');
    const {e2e, lint} = demo_e2e.architect;
    expect(e2e.builder).toBe('@angular/bazel:build');
    // it should leave non-Bazel commands unmodified
    expect(demo.architect['extract-i18n'].builder)
        .toBe('@angular-devkit/build-angular:extract-i18n');
    expect(lint.builder).toBe('@angular-devkit/build-angular:tslint');
  });

  it('should get defaultProject if name is not provided', () => {
    const options = {};
    host = schematicRunner.runSchematic('ng-add', options, host);
    const content = host.readContent('/angular.json');
    const json = JSON.parse(content);
    const builder = json.projects.demo.architect.build.builder;
    expect(builder).toBe('@angular/bazel:build');
  });

  describe('rxjs', () => {
    const cases = [
      // version|upgrade
      ['6.3.3', true],
      ['~6.3.3', true],
      ['^6.3.3', true],
      ['~6.3.11', true],
      ['6.4.0', false],
      ['~6.4.0', false],
      ['~6.4.1', false],
      ['6.5.0', false],
      ['~6.5.0', false],
      ['^6.5.0', false],
      ['~7.0.1', false],
    ];
    for (const [version, upgrade] of cases) {
      it(`should ${upgrade ? '' : 'not '}upgrade v${version}')`, () => {
        host.overwrite('package.json', JSON.stringify({
          name: 'demo',
          dependencies: {
            '@angular/core': '1.2.3',
            'rxjs': version,
          },
          devDependencies: {
            'typescript': '3.2.2',
          },
        }));
        host = schematicRunner.runSchematic('ng-add', defaultOptions, host);
        expect(host.files).toContain('/package.json');
        const content = host.readContent('/package.json');
        const json = JSON.parse(content);
        if (upgrade) {
          expect(json.dependencies.rxjs).toBe('~6.4.0');
        } else {
          expect(json.dependencies.rxjs).toBe(version);
        }
      });
    }
  });

  it('should add a postinstall step to package.json', () => {
    host = schematicRunner.runSchematic('ng-add', defaultOptions, host);
    expect(host.files).toContain('/package.json');
    const content = host.readContent('/package.json');
    const json = JSON.parse(content);
    expect(json.scripts.postinstall).toBe('ngc -p ./angular-metadata.tsconfig.json');
  });

  it('should work when run on a minimal project (without test and e2e targets)', () => {
    host.overwrite('angular.json', JSON.stringify({
      projects: {
        'demo': {
          architect: {
            build: {},
            serve: {},
            'extract-i18n': {
              builder: '@angular-devkit/build-angular:extract-i18n',
            },
          },
        },
      },
    }));

    expect(() => schematicRunner.runSchematic('ng-add', defaultOptions, host)).not.toThrowError();
  });

});
