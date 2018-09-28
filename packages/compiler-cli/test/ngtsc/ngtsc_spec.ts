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
  if (!process.env.TEST_SRCDIR) {
    throw new Error('`setupFakeCore` must be run within a Bazel test');
  }
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

  function writeConfig(extraOpts: {[key: string]: string | boolean} = {}): void {
    const opts = JSON.stringify({...extraOpts, 'enableIvy': 'ngtsc'});
    const tsconfig: string =
        `{"extends": "./tsconfig-base.json", "angularCompilerOptions": ${opts}}`;
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
          bootstrap: [TestCmp],
        })
        export class TestModule {}
    `);

    const exitCode = main(['-p', basePath], errorSpy);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(exitCode).toBe(0);

    const jsContents = getContents('test.js');
    expect(jsContents)
        .toContain(
            'i0.ɵdefineNgModule({ type: TestModule, bootstrap: [TestCmp], ' +
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
            `function TestModule_Factory(t) { return new (t || TestModule)(); }, providers: [{ provide: ` +
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
            'factory: function TestPipe_Factory(t) { return new (t || TestPipe)(); }, pure: false })');
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
            'factory: function TestPipe_Factory(t) { return new (t || TestPipe)(); }, pure: true })');
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
    expect(jsContents).toContain('return new (t || TestPipe)(i0.ɵdirectiveInject(Dep));');
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
        .toContain('i0.ɵNgModuleDef<TestModule, [typeof TestPipe, typeof TestCmp], never, never>');
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
          Renderer2,
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
            r2: Renderer2,
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
            `factory: function FooCmp_Factory(t) { return new (t || FooCmp)(i0.ɵinjectAttribute("test"), i0.ɵdirectiveInject(ChangeDetectorRef), i0.ɵdirectiveInject(ElementRef), i0.ɵdirectiveInject(i0.INJECTOR), i0.ɵinjectRenderer2(), i0.ɵdirectiveInject(TemplateRef), i0.ɵdirectiveInject(ViewContainerRef)); }`);
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
    expect(jsContents).toContain(`i0.ɵquery(null, ["bar"], true, TemplateRef)`);
    expect(jsContents).toContain(`i0.ɵquery(null, TemplateRef, false)`);
    expect(jsContents).toContain(`i0.ɵquery(null, ["test2"], true)`);
    expect(jsContents).toContain(`i0.ɵquery(0, ["accessor"], true)`);
    expect(jsContents).toContain(`i0.ɵquery(1, ["test1"], true)`);
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
    expect(jsContents).toContain(`i0.ɵquery(null, TemplateRef, true)`);
    expect(jsContents).toContain(`i0.ɵquery(null, ViewContainerRef, true)`);
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
    expect(jsContents)
        .toContain(
            `i0.ɵelementProperty(elIndex, "attr.hello", i0.ɵbind(i0.ɵloadDirective(dirIndex).foo));`);
    expect(jsContents)
        .toContain(
            `i0.ɵelementProperty(elIndex, "prop", i0.ɵbind(i0.ɵloadDirective(dirIndex).bar));`);
    expect(jsContents)
        .toContain(
            'i0.ɵelementProperty(elIndex, "class.someclass", i0.ɵbind(i0.ɵloadDirective(dirIndex).someClass))');
    expect(jsContents).toContain('i0.ɵloadDirective(dirIndex).onClick($event)');
    expect(jsContents)
        .toContain('i0.ɵloadDirective(dirIndex).onChange(i0.ɵloadDirective(dirIndex).arg)');
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

  it('should generate exportAs declarations', () => {
    writeConfig();
    write('test.ts', `
        import {Component, Directive} from '@angular/core';

        @Directive({
          selector: '[test]',
          exportAs: 'foo',
        })
        class Dir {}
    `);

    const exitCode = main(['-p', basePath], errorSpy);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(exitCode).toBe(0);

    const jsContents = getContents('test.js');
    expect(jsContents).toContain(`exportAs: "foo"`);
  });

  it('should generate correct factory stubs for a test module', () => {
    writeConfig({'allowEmptyCodegenFiles': true});

    write('test.ts', `
        import {Injectable, NgModule} from '@angular/core';

        @Injectable()
        export class NotAModule {}

        @NgModule({})
        export class TestModule {}
    `);

    write('empty.ts', `
        import {Injectable} from '@angular/core';

        @Injectable()
        export class NotAModule {}
    `);

    const exitCode = main(['-p', basePath], errorSpy);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(exitCode).toBe(0);

    const factoryContents = getContents('test.ngfactory.js');
    expect(factoryContents).toContain(`import * as i0 from '@angular/core';`);
    expect(factoryContents).toContain(`import { NotAModule, TestModule } from './test';`);
    expect(factoryContents)
        .toContain(`export var TestModuleNgFactory = new i0.ɵNgModuleFactory(TestModule);`);
    expect(factoryContents).not.toContain(`NotAModuleNgFactory`);
    expect(factoryContents).not.toContain('ɵNonEmptyModule');

    const emptyFactory = getContents('empty.ngfactory.js');
    expect(emptyFactory).toContain(`import * as i0 from '@angular/core';`);
    expect(emptyFactory).toContain(`export var ɵNonEmptyModule = true;`);
  });

  it('should compile a banana-in-a-box inside of a template', () => {
    writeConfig();
    write('test.ts', `
        import {Component} from '@angular/core';

        @Component({
          template: '<div *tmpl [(bananaInABox)]="prop"></div>',
          selector: 'test'
        })
        class TestCmp {}
    `);

    const exitCode = main(['-p', basePath], errorSpy);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(exitCode).toBe(0);
  });

  it('generates inherited factory definitions', () => {
    writeConfig();
    write(`test.ts`, `
        import {Injectable} from '@angular/core';

        class Dep {}

        @Injectable()
        class Base {
          constructor(dep: Dep) {}
        }

        @Injectable()
        class Child extends Base {}

        @Injectable()
        class GrandChild extends Child {
          constructor() {
            super(null!);
          }
        }
    `);


    const exitCode = main(['-p', basePath], errorSpy);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(exitCode).toBe(0);
    const jsContents = getContents('test.js');

    expect(jsContents)
        .toContain('function Base_Factory(t) { return new (t || Base)(i0.inject(Dep)); }');
    expect(jsContents).toContain('var ɵChild_BaseFactory = i0.ɵgetInheritedFactory(Child)');
    expect(jsContents)
        .toContain('function Child_Factory(t) { return ɵChild_BaseFactory((t || Child)); }');
    expect(jsContents)
        .toContain('function GrandChild_Factory(t) { return new (t || GrandChild)(); }');
  });

  it('generates base factories for directives', () => {
    writeConfig();
    write(`test.ts`, `
        import {Directive} from '@angular/core';

        class Base {}

        @Directive({
          selector: '[test]',
        })
        class Dir extends Base {
        }
    `);


    const exitCode = main(['-p', basePath], errorSpy);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(exitCode).toBe(0);
    const jsContents = getContents('test.js');

    expect(jsContents).toContain('var ɵDir_BaseFactory = i0.ɵgetInheritedFactory(Dir)');
  });

  it('should wrap "directives" in component metadata in a closure when forward references are present',
     () => {
       writeConfig();
       write('test.ts', `
        import {Component, NgModule} from '@angular/core';

        @Component({
          selector: 'cmp-a',
          template: '<cmp-b></cmp-b>',
        })
        class CmpA {}

        @Component({
          selector: 'cmp-b',
          template: 'This is B',
        })
        class CmpB {}

        @NgModule({
          declarations: [CmpA, CmpB],
        })
        class Module {}
    `);

       const exitCode = main(['-p', basePath], errorSpy);
       expect(errorSpy).not.toHaveBeenCalled();
       expect(exitCode).toBe(0);

       const jsContents = getContents('test.js');
       expect(jsContents).toContain('directives: function () { return [CmpB]; }');
     });
});
