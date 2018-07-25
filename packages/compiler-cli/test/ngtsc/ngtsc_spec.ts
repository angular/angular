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
    expect(dtsContents).toContain('static ngInjectableDef: i0.ɵInjectableDef<Dep>;');
    expect(dtsContents).toContain('static ngInjectableDef: i0.ɵInjectableDef<Service>;');
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
    expect(jsContents).toContain('TestCmp.ngComponentDef = i0.ɵdefineComponent');
    expect(jsContents).not.toContain('__decorate');

    const dtsContents = getContents('test.d.ts');
    expect(dtsContents).toContain('static ngComponentDef: i0.ɵComponentDef<TestCmp, \'test-cmp\'>');
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
            'i0.ɵdefineNgModule({ type: TestModule, bootstrap: [], ' +
            'declarations: [TestCmp], imports: [], exports: [] })');

    const dtsContents = getContents('test.d.ts');
    expect(dtsContents).toContain('static ngComponentDef: i0.ɵComponentDef<TestCmp, \'test-cmp\'>');
    expect(dtsContents)
        .toContain(
            'static ngModuleDef: i0.ɵNgModuleDef<TestModule, [typeof TestCmp], never, never>');
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
    expect(jsContents).toContain('i0.ɵdefineNgModule({ type: TestModule,');
    expect(jsContents)
        .toContain(
            `TestModule.ngInjectorDef = i0.defineInjector({ factory: ` +
            `function TestModule_Factory() { return new TestModule(); }, providers: [{ provide: ` +
            `Token, useValue: 'test' }], imports: [[OtherModule]] });`);

    const dtsContents = getContents('test.d.ts');
    expect(dtsContents)
        .toContain(
            'static ngModuleDef: i0.ɵNgModuleDef<TestModule, [typeof TestCmp], [typeof OtherModule], never>');
    expect(dtsContents).toContain('static ngInjectorDef: i0.ɵInjectorDef');
  });

  it('should compile NgModules with references to local components', () => {
    writeConfig();
    write('test.ts', `
      import {NgModule} from '@angular/core';
      import {Foo} from './foo';

      @NgModule({
        declarations: [Foo],
      })
      export class FooModule {}
    `);
    write('foo.ts', `
      import {Component} from '@angular/core';
      @Component({selector: 'foo', template: ''})
      export class Foo {}
    `);

    const exitCode = main(['-p', basePath], errorSpy);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(exitCode).toBe(0);

    const jsContents = getContents('test.js');
    const dtsContents = getContents('test.d.ts');

    expect(jsContents).toContain('import { Foo } from \'./foo\';');
    expect(jsContents).not.toMatch(/as i[0-9] from '.\/foo'/);
    expect(dtsContents).toContain('as i1 from \'./foo\';');
  });

  it('should compile NgModules with references to absolute components', () => {
    writeConfig();
    write('test.ts', `
      import {NgModule} from '@angular/core';
      import {Foo} from 'foo';

      @NgModule({
        declarations: [Foo],
      })
      export class FooModule {}
    `);
    write('node_modules/foo/index.d.ts', `
      import * as i0 from '@angular/core';
      export class Foo {
        static ngComponentDef: i0.ɵComponentDef<Foo, 'foo'>;
      }
    `);

    const exitCode = main(['-p', basePath], errorSpy);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(exitCode).toBe(0);

    const jsContents = getContents('test.js');
    const dtsContents = getContents('test.d.ts');

    expect(jsContents).toContain('import { Foo } from \'foo\';');
    expect(jsContents).not.toMatch(/as i[0-9] from 'foo'/);
    expect(dtsContents).toContain('as i1 from \'foo\';');
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
            'TestPipe.ngPipeDef = i0.ɵdefinePipe({ name: "test-pipe", type: TestPipe, ' +
            'factory: function TestPipe_Factory() { return new TestPipe(); }, pure: false })');
    expect(dtsContents).toContain('static ngPipeDef: i0.ɵPipeDef<TestPipe, \'test-pipe\'>;');
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
            'TestPipe.ngPipeDef = i0.ɵdefinePipe({ name: "test-pipe", type: TestPipe, ' +
            'factory: function TestPipe_Factory() { return new TestPipe(); }, pure: true })');
    expect(dtsContents).toContain('static ngPipeDef: i0.ɵPipeDef<TestPipe, \'test-pipe\'>;');
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
    expect(jsContents).toContain('return new TestPipe(i0.ɵdirectiveInject(Dep));');
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
    expect(dtsContents)
        .toContain('i0.ɵNgModuleDef<TestModule, [typeof TestPipe,typeof TestCmp], never, never>');
  });

  it('should unwrap a ModuleWithProviders function if a generic type is provided for it', () => {
    writeConfig();
    write(`test.ts`, `
        import {NgModule} from '@angular/core';
        import {RouterModule} from 'router';

        @NgModule({imports: [RouterModule.forRoot()]})
        export class TestModule {}
    `);

    write('node_modules/router/index.d.ts', `
        import {ModuleWithProviders} from '@angular/core';

        declare class RouterModule {
          static forRoot(): ModuleWithProviders<RouterModule>;
        }
    `);

    const exitCode = main(['-p', basePath], errorSpy);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(exitCode).toBe(0);

    const jsContents = getContents('test.js');
    expect(jsContents).toContain('imports: [[RouterModule.forRoot()]]');

    const dtsContents = getContents('test.d.ts');
    expect(dtsContents).toContain(`import * as i1 from 'router';`);
    expect(dtsContents)
        .toContain('i0.ɵNgModuleDef<TestModule, never, [typeof i1.RouterModule], never>');
  });

  it('should inject special types according to the metadata', () => {
    writeConfig();
    write(`test.ts`, `
        import {
          Attribute,
          ChangeDetectorRef,
          Component,
          ElementRef,
          Injector,
          TemplateRef,
          ViewContainerRef,
        } from '@angular/core';

        @Component({
          selector: 'test',
          template: 'Test',
        })
        class FooCmp {
          constructor(
            @Attribute("test") attr: string,
            cdr: ChangeDetectorRef,
            er: ElementRef,
            i: Injector,
            tr: TemplateRef,
            vcr: ViewContainerRef,
          ) {}
        }
    `);

    const exitCode = main(['-p', basePath], errorSpy);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(exitCode).toBe(0);
    const jsContents = getContents('test.js');
    expect(jsContents)
        .toContain(
            `factory: function FooCmp_Factory() { return new FooCmp(i0.ɵinjectAttribute("test"), i0.ɵinjectChangeDetectorRef(), i0.ɵinjectElementRef(), i0.ɵdirectiveInject(i0.INJECTOR), i0.ɵinjectTemplateRef(), i0.ɵinjectViewContainerRef()); }`);
  });

  it('should generate queries for components', () => {
    writeConfig();
    write(`test.ts`, `
        import {Component, ContentChild, ContentChildren, TemplateRef, ViewChild} from '@angular/core';

        @Component({
          selector: 'test',
          template: '<div #foo></div>',
          queries: {
            'mview': new ViewChild('test1'),
            'mcontent': new ContentChild('test2'),
          }
        })
        class FooCmp {
          @ContentChild('bar', {read: TemplateRef}) child: any;
          @ContentChildren(TemplateRef) children: any;
          get aview(): any { return null; }
          @ViewChild('accessor') set aview(value: any) {}
        }
    `);

    const exitCode = main(['-p', basePath], errorSpy);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(exitCode).toBe(0);
    const jsContents = getContents('test.js');
    expect(jsContents).toContain(`i0.ɵQ(null, ["bar"], true, TemplateRef)`);
    expect(jsContents).toContain(`i0.ɵQ(null, TemplateRef, false)`);
    expect(jsContents).toContain(`i0.ɵQ(null, ["test2"], true)`);
    expect(jsContents).toContain(`i0.ɵQ(0, ["accessor"], true)`);
    expect(jsContents).toContain(`i0.ɵQ(1, ["test1"], true)`);
  });

  it('should handle queries that use forwardRef', () => {
    writeConfig();
    write(`test.ts`, `
        import {Component, ContentChild, TemplateRef, ViewContainerRef, forwardRef} from '@angular/core';

        @Component({
          selector: 'test',
          template: '<div #foo></div>',
        })
        class FooCmp {
          @ContentChild(forwardRef(() => TemplateRef)) child: any;

          @ContentChild(forwardRef(function() { return ViewContainerRef; })) child2: any;
        }
    `);

    const exitCode = main(['-p', basePath], errorSpy);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(exitCode).toBe(0);
    const jsContents = getContents('test.js');
    expect(jsContents).toContain(`i0.ɵQ(null, TemplateRef, true)`);
    expect(jsContents).toContain(`i0.ɵQ(null, ViewContainerRef, true)`);
  });

  it('should generate host bindings for directives', () => {
    writeConfig();
    write(`test.ts`, `
        import {Component, HostBinding, HostListener, TemplateRef} from '@angular/core';

        @Component({
          selector: 'test',
          template: 'Test',
          host: {
            '[attr.hello]': 'foo',
            '(click)': 'onClick($event)',
            '[prop]': 'bar',
          },
        })
        class FooCmp {
          onClick(event: any): void {}

          @HostBinding('class.someclass')
          get someClass(): boolean { return false; }

          @HostListener('onChange', ['arg'])
          onChange(event: any, arg: any): void {}
        }
    `);

    const exitCode = main(['-p', basePath], errorSpy);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(exitCode).toBe(0);
    const jsContents = getContents('test.js');
    expect(jsContents).toContain(`i0.ɵp(elIndex, "attr.hello", i0.ɵb(i0.ɵd(dirIndex).foo));`);
    expect(jsContents).toContain(`i0.ɵp(elIndex, "prop", i0.ɵb(i0.ɵd(dirIndex).bar));`);
    expect(jsContents)
        .toContain('i0.ɵp(elIndex, "class.someclass", i0.ɵb(i0.ɵd(dirIndex).someClass))');
    expect(jsContents).toContain('i0.ɵd(dirIndex).onClick($event)');
    expect(jsContents).toContain('i0.ɵd(dirIndex).onChange(i0.ɵd(dirIndex).arg)');
  });

  it('should correctly recognize local symbols', () => {
    writeConfig();
    write('module.ts', `
        import {NgModule} from '@angular/core';
        import {Dir, Comp} from './test';

        @NgModule({
          declarations: [Dir, Comp],
          exports: [Dir, Comp],
        })
        class Module {}
    `);
    write(`test.ts`, `
        import {Component, Directive} from '@angular/core';

        @Directive({
          selector: '[dir]',
        })
        export class Dir {}

        @Component({
          selector: 'test',
          template: '<div dir>Test</div>',
        })
        export class Comp {}
    `);

    const exitCode = main(['-p', basePath], errorSpy);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(exitCode).toBe(0);
    const jsContents = getContents('test.js');
    expect(jsContents).not.toMatch(/import \* as i[0-9] from ['"].\/test['"]/);
  });
});
