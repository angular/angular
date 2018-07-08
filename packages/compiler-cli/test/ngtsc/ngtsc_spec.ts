/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

import {main, readCommandLineAndConfiguration, watchMode} from '../../src/main';
import {TestSupport, isInBazel, makeTempDir, setup} from '../test_support';

function setupFakeCore(support: TestSupport): void {
  const fakeCore = path.join(
      process.env.TEST_SRCDIR, 'angular/packages/compiler-cli/test/ngtsc/fake_core/npm_package');

  const nodeModulesPath = path.join(support.basePath, 'node_modules');
  const angularCoreDirectory = path.join(nodeModulesPath, '@angular/core');

  fs.symlinkSync(fakeCore, angularCoreDirectory);
}

function getNgRootDir() {
  const moduleFilename = module.filename.replace(/\\/g, '/');
  const distIndex = moduleFilename.indexOf('/dist/all');
  return moduleFilename.substr(0, distIndex);
}

describe('ngtsc behavioral tests', () => {
  if (!isInBazel()) {
    // These tests should be excluded from the non-Bazel build.
    return;
  }

  let basePath: string;
  let outDir: string;
  let write: (fileName: string, content: string) => void;
  let errorSpy: jasmine.Spy&((s: string) => void);

  function shouldExist(fileName: string) {
    if (!fs.existsSync(path.resolve(outDir, fileName))) {
      throw new Error(`Expected ${fileName} to be emitted (outDir: ${outDir})`);
    }
  }

  function shouldNotExist(fileName: string) {
    if (fs.existsSync(path.resolve(outDir, fileName))) {
      throw new Error(`Did not expect ${fileName} to be emitted (outDir: ${outDir})`);
    }
  }

  function getContents(fileName: string): string {
    shouldExist(fileName);
    const modulePath = path.resolve(outDir, fileName);
    return fs.readFileSync(modulePath, 'utf8');
  }

  function writeConfig(
      tsconfig: string =
          '{"extends": "./tsconfig-base.json", "angularCompilerOptions": {"enableIvy": "ngtsc"}}') {
    write('tsconfig.json', tsconfig);
  }

  beforeEach(() => {
    errorSpy = jasmine.createSpy('consoleError').and.callFake(console.error);
    const support = setup();
    basePath = support.basePath;
    outDir = path.join(basePath, 'built');
    process.chdir(basePath);
    write = (fileName: string, content: string) => { support.write(fileName, content); };

    setupFakeCore(support);
    write('tsconfig-base.json', `{
      "compilerOptions": {
        "experimentalDecorators": true,
        "skipLibCheck": true,
        "noImplicitAny": true,
        "types": [],
        "outDir": "built",
        "rootDir": ".",
        "baseUrl": ".",
        "declaration": true,
        "target": "es5",
        "module": "es2015",
        "moduleResolution": "node",
        "lib": ["es6", "dom"],
        "typeRoots": ["node_modules/@types"]
      },
      "angularCompilerOptions": {
        "enableIvy": "ngtsc"
      }
    }`);
  });

  it('should compile Injectables without errors', () => {
    writeConfig();
    write('test.ts', `
        import {Injectable} from '@angular/core';

        @Injectable()
        export class Dep {}

        @Injectable()
        export class Service {
          constructor(dep: Dep) {}
        }
    `);

    const exitCode = main(['-p', basePath], errorSpy);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(exitCode).toBe(0);


    const jsContents = getContents('test.js');
    expect(jsContents).toContain('Dep.ngInjectableDef =');
    expect(jsContents).toContain('Service.ngInjectableDef =');
    expect(jsContents).not.toContain('__decorate');
    const dtsContents = getContents('test.d.ts');
    expect(dtsContents).toContain('static ngInjectableDef: ɵ0.InjectableDef<Dep>;');
    expect(dtsContents).toContain('static ngInjectableDef: ɵ0.InjectableDef<Service>;');
  });

  it('should compile Components without errors', () => {
    writeConfig();
    write('test.ts', `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          template: 'this is a test',
        })
        export class TestCmp {}
    `);

    const exitCode = main(['-p', basePath], errorSpy);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(exitCode).toBe(0);

    const jsContents = getContents('test.js');
    expect(jsContents).toContain('TestCmp.ngComponentDef = ɵ0.ɵdefineComponent');
    expect(jsContents).not.toContain('__decorate');

    const dtsContents = getContents('test.d.ts');
    expect(dtsContents).toContain('static ngComponentDef: ɵ0.ComponentDef<TestCmp, \'test-cmp\'>');
  });

  it('should compile Components without errors', () => {
    writeConfig();
    write('test.ts', `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          templateUrl: './dir/test.html',
        })
        export class TestCmp {}
    `);
    write('dir/test.html', '<p>Hello World</p>');

    const exitCode = main(['-p', basePath], errorSpy);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(exitCode).toBe(0);

    const jsContents = getContents('test.js');
    expect(jsContents).toContain('Hello World');
  });

  it('should compile NgModules without errors', () => {
    writeConfig();
    write('test.ts', `
        import {Component, NgModule} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          template: 'this is a test',
        })
        export class TestCmp {}

        @NgModule({
          declarations: [TestCmp],
        })
        export class TestModule {}
    `);

    const exitCode = main(['-p', basePath], errorSpy);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(exitCode).toBe(0);

    const jsContents = getContents('test.js');
    expect(jsContents)
        .toContain(
            'ɵ0.ɵdefineNgModule({ type: TestModule, bootstrap: [], ' +
            'declarations: [TestCmp], imports: [], exports: [] })');

    const dtsContents = getContents('test.d.ts');
    expect(dtsContents).toContain('static ngComponentDef: ɵ0.ComponentDef<TestCmp, \'test-cmp\'>');
    expect(dtsContents)
        .toContain('static ngModuleDef: ɵ0.NgModuleDef<TestModule, [TestCmp], [], []>');
    expect(dtsContents).not.toContain('__decorate');
  });

  it('should compile NgModules with services without errors', () => {
    writeConfig();
    write('test.ts', `
        import {Component, NgModule} from '@angular/core';

        export class Token {}

        @NgModule({})
        export class OtherModule {}

        @Component({
          selector: 'test-cmp',
          template: 'this is a test',
        })
        export class TestCmp {}

        @NgModule({
          declarations: [TestCmp],
          providers: [{provide: Token, useValue: 'test'}],
          imports: [OtherModule],
        })
        export class TestModule {}
    `);

    const exitCode = main(['-p', basePath], errorSpy);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(exitCode).toBe(0);

    const jsContents = getContents('test.js');
    expect(jsContents).toContain('ɵ0.ɵdefineNgModule({ type: TestModule,');
    expect(jsContents)
        .toContain(
            `TestModule.ngInjectorDef = ɵ0.defineInjector({ factory: ` +
            `function TestModule_Factory() { return new TestModule(); }, providers: [{ provide: ` +
            `Token, useValue: 'test' }], imports: [OtherModule] });`);

    const dtsContents = getContents('test.d.ts');
    expect(dtsContents)
        .toContain('static ngModuleDef: ɵ0.NgModuleDef<TestModule, [TestCmp], [OtherModule], []>');
    expect(dtsContents).toContain('static ngInjectorDef: ɵ0.InjectorDef');
  });

  it('should compile Pipes without errors', () => {
    writeConfig();
    write('test.ts', `
        import {Pipe} from '@angular/core';

        @Pipe({
          name: 'test-pipe',
          pure: false,
        })
        export class TestPipe {}
    `);

    const exitCode = main(['-p', basePath], errorSpy);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(exitCode).toBe(0);

    const jsContents = getContents('test.js');
    const dtsContents = getContents('test.d.ts');

    expect(jsContents)
        .toContain(
            'TestPipe.ngPipeDef = ɵ0.ɵdefinePipe({ name: "test-pipe", type: TestPipe, ' +
            'factory: function TestPipe_Factory() { return new TestPipe(); }, pure: false })');
    expect(dtsContents).toContain('static ngPipeDef: ɵ0.ɵPipeDef<TestPipe, \'test-pipe\'>;');
  });

  it('should compile pure Pipes without errors', () => {
    writeConfig();
    write('test.ts', `
        import {Pipe} from '@angular/core';

        @Pipe({
          name: 'test-pipe',
        })
        export class TestPipe {}
    `);

    const exitCode = main(['-p', basePath], errorSpy);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(exitCode).toBe(0);

    const jsContents = getContents('test.js');
    const dtsContents = getContents('test.d.ts');

    expect(jsContents)
        .toContain(
            'TestPipe.ngPipeDef = ɵ0.ɵdefinePipe({ name: "test-pipe", type: TestPipe, ' +
            'factory: function TestPipe_Factory() { return new TestPipe(); }, pure: true })');
    expect(dtsContents).toContain('static ngPipeDef: ɵ0.ɵPipeDef<TestPipe, \'test-pipe\'>;');
  });

  it('should compile Pipes with dependencies', () => {
    writeConfig();
    write('test.ts', `
        import {Pipe} from '@angular/core';

        export class Dep {}

        @Pipe({
          name: 'test-pipe',
          pure: false,
        })
        export class TestPipe {
          constructor(dep: Dep) {}
        }
    `);

    const exitCode = main(['-p', basePath], errorSpy);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(exitCode).toBe(0);

    const jsContents = getContents('test.js');
    expect(jsContents).toContain('return new TestPipe(ɵ0.ɵdirectiveInject(Dep));');
  });

  it('should include @Pipes in @NgModule scopes', () => {
    writeConfig();
    write('test.ts', `
        import {Component, NgModule, Pipe} from '@angular/core';

        @Pipe({name: 'test'})
        export class TestPipe {}

        @Component({selector: 'test-cmp', template: '{{value | test}}'})
        export class TestCmp {}

        @NgModule({declarations: [TestPipe, TestCmp]})
        export class TestModule {}
    `);

    const exitCode = main(['-p', basePath], errorSpy);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(exitCode).toBe(0);

    const jsContents = getContents('test.js');
    expect(jsContents).toContain('pipes: [TestPipe]');

    const dtsContents = getContents('test.d.ts');
    expect(dtsContents).toContain('ɵ0.NgModuleDef<TestModule, [TestPipe,TestCmp], [], []>');
  });
});
