/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LazyRoute} from '@angular/compiler-cli/src/ngtsc/routing';
import * as path from 'path';
import * as ts from 'typescript';

import {NgtscTestEnvironment} from './env';

const trim = (input: string): string => input.replace(/\s+/g, ' ').trim();

const varRegExp = (name: string): RegExp => new RegExp(`var \\w+ = \\[\"${name}\"\\];`);

const viewQueryRegExp = (descend: boolean, ref?: string): RegExp => {
  const maybeRef = ref ? `, ${ref}` : ``;
  return new RegExp(`i0\\.ɵviewQuery\\(\\w+, ${descend}${maybeRef}\\)`);
};

const contentQueryRegExp = (predicate: string, descend: boolean, ref?: string): RegExp => {
  const maybeRef = ref ? `, ${ref}` : ``;
  return new RegExp(`i0\\.ɵcontentQuery\\(dirIndex, ${predicate}, ${descend}${maybeRef}\\)`);
};

describe('ngtsc behavioral tests', () => {
  let env !: NgtscTestEnvironment;

  beforeEach(() => { env = NgtscTestEnvironment.setup(); });

  it('should compile Injectables without errors', () => {
    env.tsconfig();
    env.write('test.ts', `
        import {Injectable} from '@angular/core';

        @Injectable()
        export class Dep {}

        @Injectable()
        export class Service {
          constructor(dep: Dep) {}
        }
    `);

    env.driveMain();


    const jsContents = env.getContents('test.js');
    expect(jsContents).toContain('Dep.ngInjectableDef =');
    expect(jsContents).toContain('Service.ngInjectableDef =');
    expect(jsContents).not.toContain('__decorate');
    const dtsContents = env.getContents('test.d.ts');
    expect(dtsContents).toContain('static ngInjectableDef: i0.ɵInjectableDef<Dep>;');
    expect(dtsContents).toContain('static ngInjectableDef: i0.ɵInjectableDef<Service>;');
  });

  it('should compile Injectables with a generic service', () => {
    env.tsconfig();
    env.write('test.ts', `
        import {Injectable} from '@angular/core';

        @Injectable()
        export class Store<T> {}
    `);

    env.driveMain();


    const jsContents = env.getContents('test.js');
    expect(jsContents).toContain('Store.ngInjectableDef =');
    const dtsContents = env.getContents('test.d.ts');
    expect(dtsContents).toContain('static ngInjectableDef: i0.ɵInjectableDef<Store<any>>;');
  });

  it('should compile Injectables with providedIn without errors', () => {
    env.tsconfig();
    env.write('test.ts', `
        import {Injectable} from '@angular/core';

        @Injectable()
        export class Dep {}

        @Injectable({ providedIn: 'root' })
        export class Service {
          constructor(dep: Dep) {}
        }
    `);

    env.driveMain();


    const jsContents = env.getContents('test.js');
    expect(jsContents).toContain('Dep.ngInjectableDef =');
    expect(jsContents).toContain('Service.ngInjectableDef =');
    expect(jsContents)
        .toContain('return new (t || Service)(i0.inject(Dep)); }, providedIn: \'root\' });');
    expect(jsContents).not.toContain('__decorate');
    const dtsContents = env.getContents('test.d.ts');
    expect(dtsContents).toContain('static ngInjectableDef: i0.ɵInjectableDef<Dep>;');
    expect(dtsContents).toContain('static ngInjectableDef: i0.ɵInjectableDef<Service>;');
  });

  it('should compile Injectables with providedIn and factory without errors', () => {
    env.tsconfig();
    env.write('test.ts', `
        import {Injectable} from '@angular/core';

        @Injectable({ providedIn: 'root', useFactory: () => new Service() })
        export class Service {
          constructor() {}
        }
    `);

    env.driveMain();


    const jsContents = env.getContents('test.js');
    expect(jsContents).toContain('Service.ngInjectableDef =');
    expect(jsContents).toContain('(r = new t());');
    expect(jsContents).toContain('(r = (function () { return new Service(); })());');
    expect(jsContents).toContain('factory: function Service_Factory(t) { var r = null; if (t) {');
    expect(jsContents).toContain('return r; }, providedIn: \'root\' });');
    expect(jsContents).not.toContain('__decorate');
    const dtsContents = env.getContents('test.d.ts');
    expect(dtsContents).toContain('static ngInjectableDef: i0.ɵInjectableDef<Service>;');
  });

  it('should compile Injectables with providedIn and factory with deps without errors', () => {
    env.tsconfig();
    env.write('test.ts', `
        import {Injectable} from '@angular/core';

        @Injectable()
        export class Dep {}

        @Injectable({ providedIn: 'root', useFactory: (dep: Dep) => new Service(dep), deps: [Dep] })
        export class Service {
          constructor(dep: Dep) {}
        }
    `);

    env.driveMain();


    const jsContents = env.getContents('test.js');
    expect(jsContents).toContain('Service.ngInjectableDef =');
    expect(jsContents).toContain('factory: function Service_Factory(t) { var r = null; if (t) {');
    expect(jsContents).toContain('(r = new t(i0.inject(Dep)));');
    expect(jsContents)
        .toContain('(r = (function (dep) { return new Service(dep); })(i0.inject(Dep)));');
    expect(jsContents).toContain('return r; }, providedIn: \'root\' });');
    expect(jsContents).not.toContain('__decorate');
    const dtsContents = env.getContents('test.d.ts');
    expect(dtsContents).toContain('static ngInjectableDef: i0.ɵInjectableDef<Service>;');
  });

  it('should compile Components (inline template) without errors', () => {
    env.tsconfig();
    env.write('test.ts', `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          template: 'this is a test',
        })
        export class TestCmp {}
    `);

    env.driveMain();

    const jsContents = env.getContents('test.js');
    expect(jsContents).toContain('TestCmp.ngComponentDef = i0.ɵdefineComponent');
    expect(jsContents).not.toContain('__decorate');

    const dtsContents = env.getContents('test.d.ts');
    expect(dtsContents)
        .toContain(
            'static ngComponentDef: i0.ɵComponentDefWithMeta<TestCmp, "test-cmp", never, {}, {}, never>');
  });

  it('should compile Components (dynamic inline template) without errors', () => {
    env.tsconfig();
    env.write('test.ts', `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          template: 'this is ' + 'a test',
        })
        export class TestCmp {}
    `);

    env.driveMain();

    const jsContents = env.getContents('test.js');
    expect(jsContents).toContain('TestCmp.ngComponentDef = i0.ɵdefineComponent');
    expect(jsContents).not.toContain('__decorate');

    const dtsContents = env.getContents('test.d.ts');
    expect(dtsContents)
        .toContain(
            'static ngComponentDef: i0.ɵComponentDefWithMeta<TestCmp, "test-cmp", never, {}, {}, never>');
  });

  it('should compile Components (function call inline template) without errors', () => {
    env.tsconfig();
    env.write('test.ts', `
        import {Component} from '@angular/core';

        function getTemplate() {
          return 'this is a test';
        }
        @Component({
          selector: 'test-cmp',
          template: getTemplate(),
        })
        export class TestCmp {}
    `);

    env.driveMain();

    const jsContents = env.getContents('test.js');
    expect(jsContents).toContain('TestCmp.ngComponentDef = i0.ɵdefineComponent');
    expect(jsContents).not.toContain('__decorate');

    const dtsContents = env.getContents('test.d.ts');
    expect(dtsContents)
        .toContain(
            'static ngComponentDef: i0.ɵComponentDefWithMeta<TestCmp, "test-cmp", never, {}, {}, never>');
  });

  it('should compile Components (external template) without errors', () => {
    env.tsconfig();
    env.write('test.ts', `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          templateUrl: './dir/test.html',
        })
        export class TestCmp {}
    `);
    env.write('dir/test.html', '<p>Hello World</p>');

    env.driveMain();

    const jsContents = env.getContents('test.js');
    expect(jsContents).toContain('Hello World');
  });

  it('should add @nocollapse to static fields when closure annotations are requested', () => {
    env.tsconfig({
      'annotateForClosureCompiler': true,
    });
    env.write('test.ts', `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          templateUrl: './dir/test.html',
        })
        export class TestCmp {}
    `);
    env.write('dir/test.html', '<p>Hello World</p>');

    env.driveMain();

    const jsContents = env.getContents('test.js');
    expect(jsContents).toContain('/** @nocollapse */ TestCmp.ngComponentDef');
  });

  it('should compile Components with a templateUrl in a different rootDir', () => {
    env.tsconfig({}, ['./extraRootDir']);
    env.write('extraRootDir/test.html', '<p>Hello World</p>');
    env.write('test.ts', `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          templateUrl: 'test.html',
        })
        export class TestCmp {}
    `);

    env.driveMain();

    const jsContents = env.getContents('test.js');
    expect(jsContents).toContain('Hello World');
  });

  it('should compile components with styleUrls', () => {
    env.tsconfig();
    env.write('test.ts', `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test-cmp',
          styleUrls: ['./dir/style.css'],
          template: '',
        })
        export class TestCmp {}
    `);
    env.write('dir/style.css', ':host { background-color: blue; }');

    env.driveMain();

    const jsContents = env.getContents('test.js');
    expect(jsContents).toContain('background-color: blue');
  });

  it('should compile NgModules without errors', () => {
    env.tsconfig();
    env.write('test.ts', `
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

    env.driveMain();

    const jsContents = env.getContents('test.js');
    expect(jsContents)
        .toContain(
            'i0.ɵdefineNgModule({ type: TestModule, bootstrap: [TestCmp], ' +
            'declarations: [TestCmp] })');

    const dtsContents = env.getContents('test.d.ts');
    expect(dtsContents)
        .toContain(
            'static ngComponentDef: i0.ɵComponentDefWithMeta<TestCmp, "test-cmp", never, {}, {}, never>');
    expect(dtsContents)
        .toContain(
            'static ngModuleDef: i0.ɵNgModuleDefWithMeta<TestModule, [typeof TestCmp], never, never>');
    expect(dtsContents).not.toContain('__decorate');
  });

  it('should compile NgModules with services without errors', () => {
    env.tsconfig();
    env.write('test.ts', `
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

    env.driveMain();

    const jsContents = env.getContents('test.js');
    expect(jsContents).toContain('i0.ɵdefineNgModule({ type: TestModule,');
    expect(jsContents)
        .toContain(
            `TestModule.ngInjectorDef = i0.defineInjector({ factory: ` +
            `function TestModule_Factory(t) { return new (t || TestModule)(); }, providers: [{ provide: ` +
            `Token, useValue: 'test' }], imports: [[OtherModule]] });`);

    const dtsContents = env.getContents('test.d.ts');
    expect(dtsContents)
        .toContain(
            'static ngModuleDef: i0.ɵNgModuleDefWithMeta<TestModule, [typeof TestCmp], [typeof OtherModule], never>');
    expect(dtsContents).toContain('static ngInjectorDef: i0.ɵInjectorDef');
  });

  it('should compile NgModules with factory providers without errors', () => {
    env.tsconfig();
    env.write('test.ts', `
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
          providers: [{provide: Token, useFactory: () => new Token()}],
          imports: [OtherModule],
        })
        export class TestModule {}
    `);

    env.driveMain();

    const jsContents = env.getContents('test.js');
    expect(jsContents).toContain('i0.ɵdefineNgModule({ type: TestModule,');
    expect(jsContents)
        .toContain(
            `TestModule.ngInjectorDef = i0.defineInjector({ factory: ` +
            `function TestModule_Factory(t) { return new (t || TestModule)(); }, providers: [{ provide: ` +
            `Token, useFactory: function () { return new Token(); } }], imports: [[OtherModule]] });`);

    const dtsContents = env.getContents('test.d.ts');
    expect(dtsContents)
        .toContain(
            'static ngModuleDef: i0.ɵNgModuleDefWithMeta<TestModule, [typeof TestCmp], [typeof OtherModule], never>');
    expect(dtsContents).toContain('static ngInjectorDef: i0.ɵInjectorDef');
  });

  it('should compile NgModules with factory providers and deps without errors', () => {
    env.tsconfig();
    env.write('test.ts', `
        import {Component, NgModule} from '@angular/core';

        export class Dep {}

        export class Token {
          constructor(dep: Dep) {}
        }

        @NgModule({})
        export class OtherModule {}

        @Component({
          selector: 'test-cmp',
          template: 'this is a test',
        })
        export class TestCmp {}

        @NgModule({
          declarations: [TestCmp],
          providers: [{provide: Token, useFactory: (dep: Dep) => new Token(dep), deps: [Dep]}],
          imports: [OtherModule],
        })
        export class TestModule {}
    `);

    env.driveMain();

    const jsContents = env.getContents('test.js');
    expect(jsContents).toContain('i0.ɵdefineNgModule({ type: TestModule,');
    expect(jsContents)
        .toContain(
            `TestModule.ngInjectorDef = i0.defineInjector({ factory: ` +
            `function TestModule_Factory(t) { return new (t || TestModule)(); }, providers: [{ provide: ` +
            `Token, useFactory: function (dep) { return new Token(dep); }, deps: [Dep] }], imports: [[OtherModule]] });`);

    const dtsContents = env.getContents('test.d.ts');
    expect(dtsContents)
        .toContain(
            'static ngModuleDef: i0.ɵNgModuleDefWithMeta<TestModule, [typeof TestCmp], [typeof OtherModule], never>');
    expect(dtsContents).toContain('static ngInjectorDef: i0.ɵInjectorDef');
  });

  it('should compile NgModules with references to local components', () => {
    env.tsconfig();
    env.write('test.ts', `
      import {NgModule} from '@angular/core';
      import {Foo} from './foo';

      @NgModule({
        declarations: [Foo],
      })
      export class FooModule {}
    `);
    env.write('foo.ts', `
      import {Component} from '@angular/core';
      @Component({selector: 'foo', template: ''})
      export class Foo {}
    `);

    env.driveMain();

    const jsContents = env.getContents('test.js');
    const dtsContents = env.getContents('test.d.ts');

    expect(jsContents).toContain('import { Foo } from \'./foo\';');
    expect(jsContents).not.toMatch(/as i[0-9] from ".\/foo"/);
    expect(dtsContents).toContain('as i1 from "./foo";');
  });

  it('should compile NgModules with references to absolute components', () => {
    env.tsconfig();
    env.write('test.ts', `
      import {NgModule} from '@angular/core';
      import {Foo} from 'foo';

      @NgModule({
        declarations: [Foo],
      })
      export class FooModule {}
    `);
    env.write('node_modules/foo/index.d.ts', `
      import * as i0 from '@angular/core';
      export class Foo {
        static ngComponentDef: i0.ɵComponentDef<Foo, 'foo'>;
      }
    `);

    env.driveMain();

    const jsContents = env.getContents('test.js');
    const dtsContents = env.getContents('test.d.ts');

    expect(jsContents).toContain('import { Foo } from \'foo\';');
    expect(jsContents).not.toMatch(/as i[0-9] from "foo"/);
    expect(dtsContents).toContain('as i1 from "foo";');
  });

  it('should compile Pipes without errors', () => {
    env.tsconfig();
    env.write('test.ts', `
        import {Pipe} from '@angular/core';

        @Pipe({
          name: 'test-pipe',
          pure: false,
        })
        export class TestPipe {}
    `);

    env.driveMain();

    const jsContents = env.getContents('test.js');
    const dtsContents = env.getContents('test.d.ts');

    expect(jsContents)
        .toContain(
            'TestPipe.ngPipeDef = i0.ɵdefinePipe({ name: "test-pipe", type: TestPipe, ' +
            'factory: function TestPipe_Factory(t) { return new (t || TestPipe)(); }, pure: false })');
    expect(dtsContents).toContain('static ngPipeDef: i0.ɵPipeDefWithMeta<TestPipe, "test-pipe">;');
  });

  it('should compile pure Pipes without errors', () => {
    env.tsconfig();
    env.write('test.ts', `
        import {Pipe} from '@angular/core';

        @Pipe({
          name: 'test-pipe',
        })
        export class TestPipe {}
    `);

    env.driveMain();

    const jsContents = env.getContents('test.js');
    const dtsContents = env.getContents('test.d.ts');

    expect(jsContents)
        .toContain(
            'TestPipe.ngPipeDef = i0.ɵdefinePipe({ name: "test-pipe", type: TestPipe, ' +
            'factory: function TestPipe_Factory(t) { return new (t || TestPipe)(); }, pure: true })');
    expect(dtsContents).toContain('static ngPipeDef: i0.ɵPipeDefWithMeta<TestPipe, "test-pipe">;');
  });

  it('should compile Pipes with dependencies', () => {
    env.tsconfig();
    env.write('test.ts', `
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

    env.driveMain();

    const jsContents = env.getContents('test.js');
    expect(jsContents).toContain('return new (t || TestPipe)(i0.ɵdirectiveInject(Dep));');
  });

  it('should include @Pipes in @NgModule scopes', () => {
    env.tsconfig();
    env.write('test.ts', `
        import {Component, NgModule, Pipe} from '@angular/core';

        @Pipe({name: 'test'})
        export class TestPipe {}

        @Component({selector: 'test-cmp', template: '{{value | test}}'})
        export class TestCmp {}

        @NgModule({declarations: [TestPipe, TestCmp]})
        export class TestModule {}
    `);

    env.driveMain();

    const jsContents = env.getContents('test.js');
    expect(jsContents).toContain('pipes: [TestPipe]');

    const dtsContents = env.getContents('test.d.ts');
    expect(dtsContents)
        .toContain(
            'i0.ɵNgModuleDefWithMeta<TestModule, [typeof TestPipe, typeof TestCmp], never, never>');
  });

  describe('unwrapping ModuleWithProviders functions', () => {
    it('should extract the generic type and include it in the module\'s declaration', () => {
      env.tsconfig();
      env.write(`test.ts`, `
        import {NgModule} from '@angular/core';
        import {RouterModule} from 'router';

        @NgModule({imports: [RouterModule.forRoot()]})
        export class TestModule {}
    `);

      env.write('node_modules/router/index.d.ts', `
        import {ModuleWithProviders} from '@angular/core';

        declare class RouterModule {
          static forRoot(): ModuleWithProviders<RouterModule>;
        }
    `);

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('imports: [[RouterModule.forRoot()]]');

      const dtsContents = env.getContents('test.d.ts');
      expect(dtsContents).toContain(`import * as i1 from "router";`);
      expect(dtsContents)
          .toContain('i0.ɵNgModuleDefWithMeta<TestModule, never, [typeof i1.RouterModule], never>');
    });

    it('should extract the generic type if it is provided as qualified type name', () => {
      env.tsconfig();
      env.write(`test.ts`, `
        import {NgModule} from '@angular/core';
        import {RouterModule} from 'router';

        @NgModule({imports: [RouterModule.forRoot()]})
        export class TestModule {}
    `);

      env.write('node_modules/router/index.d.ts', `
        import {ModuleWithProviders} from '@angular/core';
        import * as internal from './internal';
        export {InternalRouterModule} from './internal';

        declare export class RouterModule {
          static forRoot(): ModuleWithProviders<internal.InternalRouterModule>;
        }

    `);

      env.write('node_modules/router/internal.d.ts', `
        export declare class InternalRouterModule {}
    `);

      env.driveMain();

      const jsContents = env.getContents('test.js');
      expect(jsContents).toContain('imports: [[RouterModule.forRoot()]]');

      const dtsContents = env.getContents('test.d.ts');
      expect(dtsContents).toContain(`import * as i1 from "router";`);
      expect(dtsContents)
          .toContain(
              'i0.ɵNgModuleDefWithMeta<TestModule, never, [typeof i1.InternalRouterModule], never>');
    });
  });

  it('should unwrap a ModuleWithProviders-like function if a matching literal type is provided for it',
     () => {
       env.tsconfig();
       env.write(`test.ts`, `
        import {NgModule} from '@angular/core';
        import {RouterModule} from 'router';

        @NgModule({imports: [RouterModule.forRoot()]})
        export class TestModule {}
    `);

       env.write('node_modules/router/index.d.ts', `
        import {ModuleWithProviders} from '@angular/core';

        export interface MyType extends ModuleWithProviders {}

        declare class RouterModule {
          static forRoot(): (MyType)&{ngModule:RouterModule};
        }
    `);

       env.driveMain();

       const jsContents = env.getContents('test.js');
       expect(jsContents).toContain('imports: [[RouterModule.forRoot()]]');

       const dtsContents = env.getContents('test.d.ts');
       expect(dtsContents).toContain(`import * as i1 from "router";`);
       expect(dtsContents)
           .toContain(
               'i0.ɵNgModuleDefWithMeta<TestModule, never, [typeof i1.RouterModule], never>');
     });

  it('should inject special types according to the metadata', () => {
    env.tsconfig();
    env.write(`test.ts`, `
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

    env.driveMain();
    const jsContents = env.getContents('test.js');
    expect(jsContents)
        .toContain(
            `factory: function FooCmp_Factory(t) { return new (t || FooCmp)(i0.ɵinjectAttribute("test"), i0.ɵdirectiveInject(ChangeDetectorRef), i0.ɵdirectiveInject(ElementRef), i0.ɵdirectiveInject(Injector), i0.ɵdirectiveInject(Renderer2), i0.ɵdirectiveInject(TemplateRef), i0.ɵdirectiveInject(ViewContainerRef)); }`);
  });

  it('should generate queries for components', () => {
    env.tsconfig();
    env.write(`test.ts`, `
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

    env.driveMain();
    const jsContents = env.getContents('test.js');
    expect(jsContents).toMatch(varRegExp('bar'));
    expect(jsContents).toMatch(varRegExp('test1'));
    expect(jsContents).toMatch(varRegExp('test2'));
    expect(jsContents).toMatch(varRegExp('accessor'));
    // match `i0.ɵcontentQuery(dirIndex, _c1, true, TemplateRef)`
    expect(jsContents).toMatch(contentQueryRegExp('\\w+', true, 'TemplateRef'));
    // match `i0.ɵviewQuery(_c2, true)`
    expect(jsContents).toMatch(viewQueryRegExp(true));
  });

  it('should handle queries that use forwardRef', () => {
    env.tsconfig();
    env.write(`test.ts`, `
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

    env.driveMain();
    const jsContents = env.getContents('test.js');
    // match `i0.ɵcontentQuery(dirIndex, TemplateRef, true)`
    expect(jsContents).toMatch(contentQueryRegExp('TemplateRef', true));
    // match `i0.ɵcontentQuery(dirIndex, ViewContainerRef, true)`
    expect(jsContents).toMatch(contentQueryRegExp('ViewContainerRef', true));
  });

  it('should generate host listeners for components', () => {
    env.tsconfig();
    env.write(`test.ts`, `
        import {Component, HostListener} from '@angular/core';

        @Component({
          selector: 'test',
          template: 'Test'
        })
        class FooCmp {
          @HostListener('click')
          onClick(event: any): void {}

          @HostListener('document:click', ['$event.target'])
          onDocumentClick(eventTarget: HTMLElement): void {}

          @HostListener('window:scroll')
          onWindowScroll(event: any): void {}
        }
    `);

    env.driveMain();
    const jsContents = env.getContents('test.js');
    const hostBindingsFn = `
      hostBindings: function FooCmp_HostBindings(rf, ctx, elIndex) {
        if (rf & 1) {
          i0.ɵlistener("click", function FooCmp_click_HostBindingHandler($event) { return ctx.onClick(); });
          i0.ɵlistener("click", function FooCmp_click_HostBindingHandler($event) { return ctx.onDocumentClick($event.target); }, false, i0.ɵresolveDocument);
          i0.ɵlistener("scroll", function FooCmp_scroll_HostBindingHandler($event) { return ctx.onWindowScroll(); }, false, i0.ɵresolveWindow);
        }
      }
    `;
    expect(trim(jsContents)).toContain(trim(hostBindingsFn));
  });

  it('should throw in case unknown global target is provided', () => {
    env.tsconfig();
    env.write(`test.ts`, `
        import {Component, HostListener} from '@angular/core';

        @Component({
          selector: 'test',
          template: 'Test'
        })
        class FooCmp {
          @HostListener('UnknownTarget:click')
          onClick(event: any): void {}
        }
    `);
    const errors = env.driveDiagnostics();
    expect(trim(errors[0].messageText as string))
        .toContain(
            `Unexpected global target 'UnknownTarget' defined for 'click' event. Supported list of global targets: window,document,body.`);
  });

  it('should throw in case pipes are used in host listeners', () => {
    env.tsconfig();
    env.write(`test.ts`, `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test',
          template: '...',
          host: {
            '(click)': 'doSmth() | myPipe'
          }
        })
        class FooCmp {}
    `);
    const errors = env.driveDiagnostics();
    expect(trim(errors[0].messageText as string))
        .toContain('Cannot have a pipe in an action expression');
  });

  it('should throw in case pipes are used in host listeners', () => {
    env.tsconfig();
    env.write(`test.ts`, `
        import {Component} from '@angular/core';

        @Component({
          selector: 'test',
          template: '...',
          host: {
            '[id]': 'id | myPipe'
          }
        })
        class FooCmp {}
    `);
    const errors = env.driveDiagnostics();
    expect(trim(errors[0].messageText as string))
        .toContain('Host binding expression cannot contain pipes');
  });

  it('should generate host bindings for directives', () => {
    env.tsconfig();
    env.write(`test.ts`, `
        import {Component, HostBinding, HostListener, TemplateRef} from '@angular/core';

        @Component({
          selector: 'test',
          template: 'Test',
          host: {
            '[attr.hello]': 'foo',
            '(click)': 'onClick($event)',
            '(body:click)': 'onBodyClick($event)',
            '[prop]': 'bar',
          },
        })
        class FooCmp {
          onClick(event: any): void {}

          @HostBinding('class.someclass')
          get someClass(): boolean { return false; }

          @HostListener('change', ['arg1', 'arg2', 'arg3'])
          onChange(event: any, arg: any): void {}
        }
    `);

    env.driveMain();
    const jsContents = env.getContents('test.js');
    const hostBindingsFn = `
      hostBindings: function FooCmp_HostBindings(rf, ctx, elIndex) {
        if (rf & 1) {
          i0.ɵallocHostVars(2);
          i0.ɵlistener("click", function FooCmp_click_HostBindingHandler($event) { return ctx.onClick($event); });
          i0.ɵlistener("click", function FooCmp_click_HostBindingHandler($event) { return ctx.onBodyClick($event); }, false, i0.ɵresolveBody);
          i0.ɵlistener("change", function FooCmp_change_HostBindingHandler($event) { return ctx.onChange(ctx.arg1, ctx.arg2, ctx.arg3); });
          i0.ɵelementStyling(_c0, null, null, ctx);
        }
        if (rf & 2) {
          i0.ɵelementAttribute(elIndex, "hello", i0.ɵbind(ctx.foo));
          i0.ɵelementProperty(elIndex, "prop", i0.ɵbind(ctx.bar), null, true);
          i0.ɵelementClassProp(elIndex, 0, ctx.someClass, ctx);
          i0.ɵelementStylingApply(elIndex, ctx);
        }
      }
    `;
    expect(trim(jsContents)).toContain(trim(hostBindingsFn));
  });

  it('should generate host listeners for directives within hostBindings section', () => {
    env.tsconfig();
    env.write(`test.ts`, `
        import {Directive, HostListener} from '@angular/core';

        @Directive({
          selector: '[test]',
        })
        class Dir {
          @HostListener('change', ['arg'])
          onChange(event: any, arg: any): void {}
        }
    `);

    env.driveMain();
    const jsContents = env.getContents('test.js');
    const hostBindingsFn = `
      hostBindings: function Dir_HostBindings(rf, ctx, elIndex) {
        if (rf & 1) {
          i0.ɵlistener("change", function Dir_change_HostBindingHandler($event) { return ctx.onChange(ctx.arg); });
        }
      }
    `;
    expect(trim(jsContents)).toContain(trim(hostBindingsFn));
  });

  it('should use proper default value for preserveWhitespaces config param', () => {
    env.tsconfig();  // default is `false`
    env.write(`test.ts`, `
      import {Component} from '@angular/core';
       @Component({
        selector: 'test',
        preserveWhitespaces: false,
        template: \`
          <div>
            Template with whitespaces
          </div>
        \`
      })
      class FooCmp {}
    `);
    env.driveMain();
    const jsContents = env.getContents('test.js');
    expect(jsContents).toContain('text(1, " Template with whitespaces ");');
  });

  it('should take preserveWhitespaces config option into account', () => {
    env.tsconfig({preserveWhitespaces: true});
    env.write(`test.ts`, `
      import {Component} from '@angular/core';
       @Component({
        selector: 'test',
        template: \`
          <div>
            Template with whitespaces
          </div>
        \`
      })
      class FooCmp {}
    `);
    env.driveMain();
    const jsContents = env.getContents('test.js');
    expect(jsContents)
        .toContain('text(2, "\\n            Template with whitespaces\\n          ");');
  });

  it('@Component\'s preserveWhitespaces should override the one defined in config', () => {
    env.tsconfig({preserveWhitespaces: true});
    env.write(`test.ts`, `
      import {Component} from '@angular/core';
       @Component({
        selector: 'test',
        preserveWhitespaces: false,
        template: \`
          <div>
            Template with whitespaces
          </div>
        \`
      })
      class FooCmp {}
    `);
    env.driveMain();
    const jsContents = env.getContents('test.js');
    expect(jsContents).toContain('text(1, " Template with whitespaces ");');
  });

  it('should use proper default value for i18nUseExternalIds config param', () => {
    env.tsconfig();  // default is `true`
    env.write(`test.ts`, `
      import {Component} from '@angular/core';
       @Component({
        selector: 'test',
        template: '<div i18n>Some text</div>'
      })
      class FooCmp {}
    `);
    env.driveMain();
    const jsContents = env.getContents('test.js');
    expect(jsContents).toContain('i18n(1, MSG_EXTERNAL_8321000940098097247$$TEST_TS_0);');
  });

  it('should take i18nUseExternalIds config option into account', () => {
    env.tsconfig({i18nUseExternalIds: false});
    env.write(`test.ts`, `
      import {Component} from '@angular/core';
       @Component({
        selector: 'test',
        template: '<div i18n>Some text</div>'
      })
      class FooCmp {}
    `);
    env.driveMain();
    const jsContents = env.getContents('test.js');
    expect(jsContents).toContain('i18n(1, MSG_TEST_TS_0);');
  });

  it('@Component\'s `interpolation` should override default interpolation config', () => {
    env.tsconfig();
    env.write(`test.ts`, `
      import {Component} from '@angular/core';
      @Component({
        selector: 'cmp-with-custom-interpolation-a',
        template: \`<div>{%text%}</div>\`,
        interpolation: ['{%', '%}']
      })
      class ComponentWithCustomInterpolationA {
        text = 'Custom Interpolation A';
      }
    `);

    env.driveMain();
    const jsContents = env.getContents('test.js');
    expect(jsContents).toContain('interpolation1("", ctx.text, "")');
  });

  it('should handle `encapsulation` field', () => {
    env.tsconfig();
    env.write(`test.ts`, `
      import {Component, ViewEncapsulation} from '@angular/core';
      @Component({
        selector: 'comp-a',
        template: '...',
        encapsulation: ViewEncapsulation.None
      })
      class CompA {}
    `);

    env.driveMain();
    const jsContents = env.getContents('test.js');
    expect(jsContents).toContain('encapsulation: 2');
  });

  it('should throw if `encapsulation` contains invalid value', () => {
    env.tsconfig();
    env.write('test.ts', `
      import {Component} from '@angular/core';
      @Component({
        selector: 'comp-a',
        template: '...',
        encapsulation: 'invalid-value'
      })
      class CompA {}
    `);
    const errors = env.driveDiagnostics();
    expect(errors[0].messageText)
        .toContain('encapsulation must be a member of ViewEncapsulation enum from @angular/core');
  });

  it('should handle `changeDetection` field', () => {
    env.tsconfig();
    env.write(`test.ts`, `
      import {Component, ChangeDetectionStrategy} from '@angular/core';
      @Component({
        selector: 'comp-a',
        template: '...',
        changeDetection: ChangeDetectionStrategy.OnPush
      })
      class CompA {}
    `);

    env.driveMain();
    const jsContents = env.getContents('test.js');
    expect(jsContents).toContain('changeDetection: 0');
  });

  it('should throw if `changeDetection` contains invalid value', () => {
    env.tsconfig();
    env.write('test.ts', `
      import {Component} from '@angular/core';
      @Component({
        selector: 'comp-a',
        template: '...',
        changeDetection: 'invalid-value'
      })
      class CompA {}
    `);
    const errors = env.driveDiagnostics();
    expect(errors[0].messageText)
        .toContain(
            'changeDetection must be a member of ChangeDetectionStrategy enum from @angular/core');
  });

  it('should ignore empty bindings', () => {
    env.tsconfig();
    env.write(`test.ts`, `
      import {Component} from '@angular/core';
       @Component({
        selector: 'test',
        template: '<div [someProp]></div>'
      })
      class FooCmp {}
    `);
    env.driveMain();
    const jsContents = env.getContents('test.js');
    expect(jsContents).not.toContain('i0.ɵelementProperty');
  });

  it('should correctly recognize local symbols', () => {
    env.tsconfig();
    env.write('module.ts', `
        import {NgModule} from '@angular/core';
        import {Dir, Comp} from './test';

        @NgModule({
          declarations: [Dir, Comp],
          exports: [Dir, Comp],
        })
        class Module {}
    `);
    env.write(`test.ts`, `
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

    env.driveMain();
    const jsContents = env.getContents('test.js');
    expect(jsContents).not.toMatch(/import \* as i[0-9] from ['"].\/test['"]/);
  });

  it('should generate exportAs declarations', () => {
    env.tsconfig();
    env.write('test.ts', `
        import {Component, Directive} from '@angular/core';

        @Directive({
          selector: '[test]',
          exportAs: 'foo',
        })
        class Dir {}
    `);

    env.driveMain();

    const jsContents = env.getContents('test.js');
    expect(jsContents).toContain(`exportAs: ["foo"]`);
  });

  it('should generate multiple exportAs declarations', () => {
    env.tsconfig();
    env.write('test.ts', `
        import {Component, Directive} from '@angular/core';

        @Directive({
          selector: '[test]',
          exportAs: 'foo, bar',
        })
        class Dir {}
    `);

    env.driveMain();

    const jsContents = env.getContents('test.js');
    expect(jsContents).toContain(`exportAs: ["foo", "bar"]`);
  });

  it('should generate correct factory stubs for a test module', () => {
    env.tsconfig({'allowEmptyCodegenFiles': true});

    env.write('test.ts', `
        import {Injectable, NgModule} from '@angular/core';

        @Injectable()
        export class NotAModule {}

        @NgModule({})
        export class TestModule {}
    `);

    env.write('empty.ts', `
        import {Injectable} from '@angular/core';

        @Injectable()
        export class NotAModule {}
    `);

    env.driveMain();

    const factoryContents = env.getContents('test.ngfactory.js');
    expect(factoryContents).toContain(`import * as i0 from '@angular/core';`);
    expect(factoryContents).toContain(`import { NotAModule, TestModule } from './test';`);
    expect(factoryContents)
        .toContain(`export var TestModuleNgFactory = new i0.ɵNgModuleFactory(TestModule);`);
    expect(factoryContents).not.toContain(`NotAModuleNgFactory`);
    expect(factoryContents).not.toContain('ɵNonEmptyModule');

    const emptyFactory = env.getContents('empty.ngfactory.js');
    expect(emptyFactory).toContain(`import * as i0 from '@angular/core';`);
    expect(emptyFactory).toContain(`export var ɵNonEmptyModule = true;`);
  });

  it('should generate correct imports in factory stubs when compiling @angular/core', () => {
    env.tsconfig({'allowEmptyCodegenFiles': true});

    env.write('test.ts', `
        import {NgModule} from '@angular/core';

        @NgModule({})
        export class TestModule {}
    `);

    // Trick the compiler into thinking it's compiling @angular/core.
    env.write('r3_symbols.ts', 'export const ITS_JUST_ANGULAR = true;');

    env.driveMain();

    const factoryContents = env.getContents('test.ngfactory.js');
    expect(normalize(factoryContents)).toBe(normalize(`
      import * as i0 from "./r3_symbols";
      import { TestModule } from './test';
      export var TestModuleNgFactory = new i0.NgModuleFactory(TestModule);
    `));
  });

  it('should generate a summary stub for decorated classes in the input file only', () => {
    env.tsconfig({'allowEmptyCodegenFiles': true});

    env.write('test.ts', `
        import {Injectable, NgModule} from '@angular/core';

        export class NotAModule {}

        @NgModule({})
        export class TestModule {}
    `);

    env.driveMain();

    const summaryContents = env.getContents('test.ngsummary.js');
    expect(summaryContents).toEqual(`export var TestModuleNgSummary = null;\n`);
  });

  it('it should generate empty export when there are no other summary symbols, to ensure the output is a valid ES module',
     () => {
       env.tsconfig({'allowEmptyCodegenFiles': true});
       env.write('empty.ts', `
        export class NotAModule {}
    `);

       env.driveMain();

       const emptySummary = env.getContents('empty.ngsummary.js');
       // The empty export ensures this js file is still an ES module.
       expect(emptySummary).toEqual(`export var ɵempty = null;\n`);
     });

  it('should compile a banana-in-a-box inside of a template', () => {
    env.tsconfig();
    env.write('test.ts', `
        import {Component} from '@angular/core';

        @Component({
          template: '<div *tmpl [(bananaInABox)]="prop"></div>',
          selector: 'test'
        })
        class TestCmp {}
    `);

    env.driveMain();
  });

  it('generates inherited factory definitions', () => {
    env.tsconfig();
    env.write(`test.ts`, `
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


    env.driveMain();
    const jsContents = env.getContents('test.js');

    expect(jsContents)
        .toContain('function Base_Factory(t) { return new (t || Base)(i0.inject(Dep)); }');
    expect(jsContents).toContain('var ɵChild_BaseFactory = i0.ɵgetInheritedFactory(Child)');
    expect(jsContents)
        .toContain('function Child_Factory(t) { return ɵChild_BaseFactory((t || Child)); }');
    expect(jsContents)
        .toContain('function GrandChild_Factory(t) { return new (t || GrandChild)(); }');
  });

  it('generates base factories for directives', () => {
    env.tsconfig();
    env.write(`test.ts`, `
        import {Directive} from '@angular/core';

        class Base {}

        @Directive({
          selector: '[test]',
        })
        class Dir extends Base {
        }
    `);


    env.driveMain();
    const jsContents = env.getContents('test.js');

    expect(jsContents).toContain('var ɵDir_BaseFactory = i0.ɵgetInheritedFactory(Dir)');
  });

  it('should wrap "directives" in component metadata in a closure when forward references are present',
     () => {
       env.tsconfig();
       env.write('test.ts', `
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

       env.driveMain();

       const jsContents = env.getContents('test.js');
       expect(jsContents).toContain('directives: function () { return [CmpB]; }');
     });

  it('should emit setClassMetadata calls for all types', () => {
    env.tsconfig();
    env.write('test.ts', `
      import {Component, Directive, Injectable, NgModule, Pipe} from '@angular/core';

      @Component({selector: 'cmp', template: 'I am a component!'}) class TestComponent {}
      @Directive({selector: 'dir'}) class TestDirective {}
      @Injectable() class TestInjectable {}
      @NgModule({declarations: [TestComponent, TestDirective]}) class TestNgModule {}
      @Pipe({name: 'pipe'}) class TestPipe {}
    `);

    env.driveMain();
    const jsContents = env.getContents('test.js');
    expect(jsContents).toContain('ɵsetClassMetadata(TestComponent, ');
    expect(jsContents).toContain('ɵsetClassMetadata(TestDirective, ');
    expect(jsContents).toContain('ɵsetClassMetadata(TestInjectable, ');
    expect(jsContents).toContain('ɵsetClassMetadata(TestNgModule, ');
    expect(jsContents).toContain('ɵsetClassMetadata(TestPipe, ');
  });

  it('should compile a template using multiple directives with the same selector', () => {
    env.tsconfig();
    env.write('test.ts', `
      import {Component, Directive, NgModule} from '@angular/core';

      @Directive({selector: '[test]'})
      class DirA {}

      @Directive({selector: '[test]'})
      class DirB {}

      @Component({
        template: '<div test></div>',
      })
      class Cmp {}

      @NgModule({
        declarations: [Cmp, DirA, DirB],
      })
      class Module {}
  `);

    env.driveMain();
    const jsContents = env.getContents('test.js');
    expect(jsContents).toMatch(/directives: \[DirA,\s+DirB\]/);
  });

  describe('cycle detection', () => {
    it('should detect a simple cycle and use remote component scoping', () => {
      env.tsconfig();
      env.write('test.ts', `
        import {Component, NgModule} from '@angular/core';
        import {NormalComponent} from './cyclic';

        @Component({
          selector: 'cyclic-component',
          template: 'Importing this causes a cycle',
        })
        export class CyclicComponent {}

        @NgModule({
          declarations: [NormalComponent, CyclicComponent],
        })
        export class Module {}
      `);

      env.write('cyclic.ts', `
        import {Component} from '@angular/core';

        @Component({
          selector: 'normal-component',
          template: '<cyclic-component></cyclic-component>',
        })
        export class NormalComponent {}
      `);

      env.driveMain();
      const jsContents = env.getContents('test.js');
      expect(jsContents)
          .toContain(
              'i0.ɵsetComponentScope(NormalComponent, [i1.NormalComponent, CyclicComponent], [])');
      expect(jsContents).not.toContain('/*__PURE__*/ i0.ɵsetComponentScope');
    });
  });

  describe('multiple local refs', () => {
    const getComponentScript = (template: string): string => `
      import {Component, Directive, NgModule} from '@angular/core';

      @Component({selector: 'my-cmp', template: \`${template}\`})
      class Cmp {}

      @NgModule({declarations: [Cmp]})
      class Module {}
    `;

    const cases = [
      `
        <div #ref></div>
        <div #ref></div>
      `,
      `
        <ng-container>
          <div #ref></div>
        </ng-container>
        <div #ref></div>
      `,
      `
        <ng-template>
          <div #ref></div>
        </ng-template>
        <div #ref></div>
      `,
      `
        <div *ngIf="visible" #ref></div>
        <div #ref></div>
      `,
      `
        <div *ngFor="let item of items" #ref></div>
        <div #ref></div>
      `
    ];

    cases.forEach(template => {
      it('should not throw', () => {
        env.tsconfig();
        env.write('test.ts', getComponentScript(template));
        const errors = env.driveDiagnostics();
        expect(errors.length).toBe(0);
      });
    });
  });

  it('should compile programs with typeRoots', () => {
    // Write out a custom tsconfig.json that includes 'typeRoots' and 'files'. 'files' is necessary
    // because otherwise TS picks up the testTypeRoot/test/index.d.ts file into the program
    // automatically. Shims are also turned on (via allowEmptyCodegenFiles) because the shim
    // ts.CompilerHost wrapper can break typeRoot functionality (which this test is meant to
    // detect).
    env.write('tsconfig.json', `{
      "extends": "./tsconfig-base.json",
      "angularCompilerOptions": {
        "allowEmptyCodegenFiles": true
      },
      "compilerOptions": {
        "typeRoots": ["./testTypeRoot"],
      },
      "files": ["./test.ts"]
    }`);
    env.write('test.ts', `
      import {Test} from 'ambient';
      console.log(Test);
    `);
    env.write('testTypeRoot/.exists', '');
    env.write('testTypeRoot/test/index.d.ts', `
      declare module 'ambient' {
        export const Test = 'This is a test';
      }
    `);

    env.driveMain();

    // Success is enough to indicate that this passes.
  });

  describe('when processing external directives', () => {
    it('should not emit multiple references to the same directive', () => {
      env.tsconfig();
      env.write('node_modules/external/index.d.ts', `
        import {ɵDirectiveDefWithMeta, ɵNgModuleDefWithMeta} from '@angular/core';

        export declare class ExternalDir {
          static ngDirectiveDef: ɵDirectiveDefWithMeta<ExternalDir, '[test]', never, never, never, never>;
        }

        export declare class ExternalModule {
          static ngModuleDef: ɵNgModuleDefWithMeta<ExternalModule, [typeof ExternalDir], never, [typeof ExternalDir]>;
        }
      `);
      env.write('test.ts', `
        import {Component, Directive, NgModule} from '@angular/core';
        import {ExternalModule} from 'external';

        @Component({
          template: '<div test></div>',
        })
        class Cmp {}

        @NgModule({
          declarations: [Cmp],
          // Multiple imports of the same module used to result in duplicate directive references
          // in the output.
          imports: [ExternalModule, ExternalModule],
        })
        class Module {}
      `);

      env.driveMain();
      const jsContents = env.getContents('test.js');
      expect(jsContents).toMatch(/directives: \[i1\.ExternalDir\]/);
    });

    it('should import directives by their external name', () => {
      env.tsconfig();
      env.write('node_modules/external/index.d.ts', `
        import {ɵDirectiveDefWithMeta, ɵNgModuleDefWithMeta} from '@angular/core';
        import {InternalDir} from './internal';

        export {InternalDir as ExternalDir} from './internal';

        export declare class ExternalModule {
          static ngModuleDef: ɵNgModuleDefWithMeta<ExternalModule, [typeof InternalDir], never, [typeof InternalDir]>;
        }
      `);
      env.write('node_modules/external/internal.d.ts', `

        export declare class InternalDir {
          static ngDirectiveDef: ɵDirectiveDefWithMeta<InternalDir, '[test]', never, never, never, never>;
        }
      `);
      env.write('test.ts', `
        import {Component, Directive, NgModule} from '@angular/core';
        import {ExternalModule} from 'external';

        @Component({
          template: '<div test></div>',
        })
        class Cmp {}

        @NgModule({
          declarations: [Cmp],
          imports: [ExternalModule],
        })
        class Module {}
      `);

      env.driveMain();
      const jsContents = env.getContents('test.js');
      expect(jsContents).toMatch(/directives: \[i1\.ExternalDir\]/);
    });
  });

  describe('flat module indices', () => {
    it('should generate a basic flat module index', () => {
      env.tsconfig({
        'flatModuleOutFile': 'flat.js',
      });
      env.write('test.ts', 'export const TEST = "this is a test";');

      env.driveMain();
      const jsContents = env.getContents('flat.js');
      expect(jsContents).toContain('export * from \'./test\';');
    });

    it('should generate a flat module with an id', () => {
      env.tsconfig({
        'flatModuleOutFile': 'flat.js',
        'flatModuleId': '@mymodule',
      });
      env.write('test.ts', 'export const TEST = "this is a test";');

      env.driveMain();
      const dtsContents = env.getContents('flat.d.ts');
      expect(dtsContents).toContain('/// <amd-module name="@mymodule" />');
    });

    it('should generate a proper flat module index file when nested', () => {
      env.tsconfig({
        'flatModuleOutFile': './public-api/index.js',
      });

      env.write('test.ts', `export const SOME_EXPORT = 'some-export'`);
      env.driveMain();

      expect(env.getContents('./public-api/index.js')).toContain(`export * from '../test';`);
    });

    it('should report an error when a flat module index is requested but no entrypoint can be determined',
       () => {
         env.tsconfig({'flatModuleOutFile': 'flat.js'});
         env.write('test.ts', 'export class Foo {}');
         env.write('test2.ts', 'export class Bar {}');

         const errors = env.driveDiagnostics();
         expect(errors.length).toBe(1);
         expect(errors[0].messageText)
             .toBe(
                 'Angular compiler option "flatModuleOutFile" requires one and only one .ts file in the "files" field.');
       });

    it('should report an error when a visible directive is not exported', () => {
      env.tsconfig({'flatModuleOutFile': 'flat.js'});
      env.write('test.ts', `
        import {Directive, NgModule} from '@angular/core';

        // The directive is not exported.
        @Directive({selector: 'test'})
        class Dir {}

        // The module is, which makes the directive visible.
        @NgModule({declarations: [Dir], exports: [Dir]})
        export class Module {}
      `);

      const errors = env.driveDiagnostics();
      expect(errors.length).toBe(1);
      expect(errors[0].messageText)
          .toBe(
              'Unsupported private class Dir. This class is visible ' +
              'to consumers via Module -> Dir, but is not exported from the top-level library ' +
              'entrypoint.');

      // Verify that the error is for the correct class.
      const id = expectTokenAtPosition(errors[0].file !, errors[0].start !, ts.isIdentifier);
      expect(id.text).toBe('Dir');
      expect(ts.isClassDeclaration(id.parent)).toBe(true);
    });

    it('should report an error when a deeply visible directive is not exported', () => {
      env.tsconfig({'flatModuleOutFile': 'flat.js'});
      env.write('test.ts', `
        import {Directive, NgModule} from '@angular/core';

        // The directive is not exported.
        @Directive({selector: 'test'})
        class Dir {}

        // Neither is the module which declares it - meaning the directive is not visible here.
        @NgModule({declarations: [Dir], exports: [Dir]})
        class DirModule {}

        // The module is, which makes the directive visible.
        @NgModule({exports: [DirModule]})
        export class Module {}
      `);

      const errors = env.driveDiagnostics();
      expect(errors.length).toBe(2);
      expect(errors[0].messageText)
          .toBe(
              'Unsupported private class DirModule. This class is ' +
              'visible to consumers via Module -> DirModule, but is not exported from the top-level ' +
              'library entrypoint.');
      expect(errors[1].messageText)
          .toBe(
              'Unsupported private class Dir. This class is visible ' +
              'to consumers via Module -> DirModule -> Dir, but is not exported from the top-level ' +
              'library entrypoint.');
    });

    it('should report an error when a deeply visible module is not exported', () => {
      env.tsconfig({'flatModuleOutFile': 'flat.js'});
      env.write('test.ts', `
        import {Directive, NgModule} from '@angular/core';

        // The directive is exported.
        @Directive({selector: 'test'})
        export class Dir {}

        // The module which declares it is not.
        @NgModule({declarations: [Dir], exports: [Dir]})
        class DirModule {}

        // The module is, which makes the module and directive visible.
        @NgModule({exports: [DirModule]})
        export class Module {}
      `);

      const errors = env.driveDiagnostics();
      expect(errors.length).toBe(1);
      expect(errors[0].messageText)
          .toBe(
              'Unsupported private class DirModule. This class is ' +
              'visible to consumers via Module -> DirModule, but is not exported from the top-level ' +
              'library entrypoint.');
    });

    it('should not report an error when a non-exported module is imported by a visible one', () => {
      env.tsconfig({'flatModuleOutFile': 'flat.js'});
      env.write('test.ts', `
        import {Directive, NgModule} from '@angular/core';

        // The directive is not exported.
        @Directive({selector: 'test'})
        class Dir {}

        // Neither is the module which declares it.
        @NgModule({declarations: [Dir], exports: [Dir]})
        class DirModule {}

        // This module is, but it doesn't re-export the module, so it doesn't make the module and
        // directive visible.
        @NgModule({imports: [DirModule]})
        export class Module {}
      `);

      const errors = env.driveDiagnostics();
      expect(errors.length).toBe(0);
    });

    it('should not report an error when re-exporting an external symbol', () => {
      env.tsconfig({'flatModuleOutFile': 'flat.js'});
      env.write('test.ts', `
        import {Directive, NgModule} from '@angular/core';
        import {ExternalModule} from 'external';

        // This module makes ExternalModule and ExternalDir visible.
        @NgModule({exports: [ExternalModule]})
        export class Module {}
      `);
      env.write('node_modules/external/index.d.ts', `
        import {ɵDirectiveDefWithMeta, ɵNgModuleDefWithMeta} from '@angular/core';

        export declare class ExternalDir {
          static ngDirectiveDef: ɵDirectiveDefWithMeta<ExternalDir, '[test]', never, never, never, never>;
        }

        export declare class ExternalModule {
          static ngModuleDef: ɵNgModuleDefWithMeta<ExternalModule, [typeof ExternalDir], never, [typeof ExternalDir]>;
        }
      `);

      const errors = env.driveDiagnostics();
      expect(errors.length).toBe(0);
    });
  });

  it('should execute custom transformers', () => {
    let beforeCount = 0;
    let afterCount = 0;

    env.tsconfig();
    env.write('test.ts', `
      import {NgModule} from '@angular/core';

      @NgModule({})
      class Module {}
    `);

    env.driveMain({
      beforeTs: [() => (sourceFile: ts.SourceFile) => {
        beforeCount++;
        return sourceFile;
      }],
      afterTs: [() => (sourceFile: ts.SourceFile) => {
        afterCount++;
        return sourceFile;
      }],
    });

    expect(beforeCount).toBe(1);
    expect(afterCount).toBe(1);
  });

  describe('sanitization', () => {
    it('should generate sanitizers for unsafe attributes in hostBindings fn in Directives', () => {
      env.tsconfig();
      env.write(`test.ts`, `
        import {Component, Directive, HostBinding} from '@angular/core';

        @Directive({
          selector: '[unsafeAttrs]'
        })
        class UnsafeAttrsDirective {
          @HostBinding('attr.href')
          attrHref: string;

          @HostBinding('attr.src')
          attrSrc: string;

          @HostBinding('attr.action')
          attrAction: string;

          @HostBinding('attr.profile')
          attrProfile: string;

          @HostBinding('attr.innerHTML')
          attrInnerHTML: string;

          @HostBinding('attr.title')
          attrSafeTitle: string;
        }

        @Component({
          selector: 'foo',
          template: '<a [unsafeAttrs]="ctxProp">Link Title</a>'
        })
        class FooCmp {}
      `);

      env.driveMain();
      const jsContents = env.getContents('test.js');
      const hostBindingsFn = `
        hostBindings: function UnsafeAttrsDirective_HostBindings(rf, ctx, elIndex) {
          if (rf & 1) {
            i0.ɵallocHostVars(6);
          }
          if (rf & 2) {
            i0.ɵelementAttribute(elIndex, "href", i0.ɵbind(ctx.attrHref), i0.ɵsanitizeUrlOrResourceUrl);
            i0.ɵelementAttribute(elIndex, "src", i0.ɵbind(ctx.attrSrc), i0.ɵsanitizeUrlOrResourceUrl);
            i0.ɵelementAttribute(elIndex, "action", i0.ɵbind(ctx.attrAction), i0.ɵsanitizeUrl);
            i0.ɵelementAttribute(elIndex, "profile", i0.ɵbind(ctx.attrProfile), i0.ɵsanitizeResourceUrl);
            i0.ɵelementAttribute(elIndex, "innerHTML", i0.ɵbind(ctx.attrInnerHTML), i0.ɵsanitizeHtml);
            i0.ɵelementAttribute(elIndex, "title", i0.ɵbind(ctx.attrSafeTitle));
          }
        }
      `;
      expect(trim(jsContents)).toContain(trim(hostBindingsFn));
    });

    it('should generate sanitizers for unsafe properties in hostBindings fn in Directives', () => {
      env.tsconfig();
      env.write(`test.ts`, `
        import {Component, Directive, HostBinding} from '@angular/core';

        @Directive({
          selector: '[unsafeProps]'
        })
        class UnsafePropsDirective {
          @HostBinding('href')
          propHref: string;

          @HostBinding('src')
          propSrc: string;

          @HostBinding('action')
          propAction: string;

          @HostBinding('profile')
          propProfile: string;

          @HostBinding('innerHTML')
          propInnerHTML: string;

          @HostBinding('title')
          propSafeTitle: string;
        }

        @Component({
          selector: 'foo',
          template: '<a [unsafeProps]="ctxProp">Link Title</a>'
        })
        class FooCmp {}
      `);

      env.driveMain();
      const jsContents = env.getContents('test.js');
      const hostBindingsFn = `
        hostBindings: function UnsafePropsDirective_HostBindings(rf, ctx, elIndex) {
          if (rf & 1) {
            i0.ɵallocHostVars(6);
          }
          if (rf & 2) {
            i0.ɵelementProperty(elIndex, "href", i0.ɵbind(ctx.propHref), i0.ɵsanitizeUrlOrResourceUrl, true);
            i0.ɵelementProperty(elIndex, "src", i0.ɵbind(ctx.propSrc), i0.ɵsanitizeUrlOrResourceUrl, true);
            i0.ɵelementProperty(elIndex, "action", i0.ɵbind(ctx.propAction), i0.ɵsanitizeUrl, true);
            i0.ɵelementProperty(elIndex, "profile", i0.ɵbind(ctx.propProfile), i0.ɵsanitizeResourceUrl, true);
            i0.ɵelementProperty(elIndex, "innerHTML", i0.ɵbind(ctx.propInnerHTML), i0.ɵsanitizeHtml, true);
            i0.ɵelementProperty(elIndex, "title", i0.ɵbind(ctx.propSafeTitle), null, true);
          }
        }
      `;
      expect(trim(jsContents)).toContain(trim(hostBindingsFn));
    });

    it('should not generate sanitizers for URL properties in hostBindings fn in Component', () => {
      env.tsconfig();
      env.write(`test.ts`, `
        import {Component} from '@angular/core';

        @Component({
          selector: 'foo',
          template: '<a href="example.com">Link Title</a>',
          host: {
            '[src]': 'srcProp',
            '[href]': 'hrefProp',
            '[title]': 'titleProp',
            '[attr.src]': 'srcAttr',
            '[attr.href]': 'hrefAttr',
            '[attr.title]': 'titleAttr',
          }
        })
        class FooCmp {}
      `);

      env.driveMain();
      const jsContents = env.getContents('test.js');
      const hostBindingsFn = `
        hostBindings: function FooCmp_HostBindings(rf, ctx, elIndex) {
          if (rf & 1) {
            i0.ɵallocHostVars(6);
          }
          if (rf & 2) {
            i0.ɵelementProperty(elIndex, "src", i0.ɵbind(ctx.srcProp), null, true);
            i0.ɵelementProperty(elIndex, "href", i0.ɵbind(ctx.hrefProp), null, true);
            i0.ɵelementProperty(elIndex, "title", i0.ɵbind(ctx.titleProp), null, true);
            i0.ɵelementAttribute(elIndex, "src", i0.ɵbind(ctx.srcAttr));
            i0.ɵelementAttribute(elIndex, "href", i0.ɵbind(ctx.hrefAttr));
            i0.ɵelementAttribute(elIndex, "title", i0.ɵbind(ctx.titleAttr));
          }
        }
      `;
      expect(trim(jsContents)).toContain(trim(hostBindingsFn));
    });
  });

  describe('listLazyRoutes()', () => {
    // clang-format off
    const lazyRouteMatching = (
        route: string, fromModulePath: RegExp, fromModuleName: string, toModulePath: RegExp,
        toModuleName: string) => {
      return {
        route,
        module: jasmine.objectContaining({
          name: fromModuleName,
          filePath: jasmine.stringMatching(fromModulePath),
        }),
        referencedModule: jasmine.objectContaining({
          name: toModuleName,
          filePath: jasmine.stringMatching(toModulePath),
        }),
      } as unknown as LazyRoute;
    };
    // clang-format on

    beforeEach(() => {
      env.tsconfig();
      env.write('node_modules/@angular/router/index.d.ts', `
        import {ModuleWithProviders} from '@angular/core';

        export declare var ROUTES;
        export declare class RouterModule {
          static forRoot(arg1: any, arg2: any): ModuleWithProviders<RouterModule>;
          static forChild(arg1: any): ModuleWithProviders<RouterModule>;
        }
      `);
    });

    describe('when called without arguments', () => {
      it('should list all routes', () => {
        env.write('test.ts', `
          import {NgModule} from '@angular/core';
          import {RouterModule} from '@angular/router';

          @NgModule({
            imports: [
              RouterModule.forRoot([
                {path: '1', loadChildren: './lazy/lazy-1#Lazy1Module'},
                {path: '2', loadChildren: './lazy/lazy-2#Lazy2Module'},
              ]),
            ],
          })
          export class TestModule {}
        `);
        env.write('lazy/lazy-1.ts', `
          import {NgModule} from '@angular/core';

          @NgModule({})
          export class Lazy1Module {}
        `);
        env.write('lazy/lazy-2.ts', `
          import {NgModule} from '@angular/core';
          import {RouterModule} from '@angular/router';

          @NgModule({
            imports: [
              RouterModule.forChild([
                {path: '3', loadChildren: './lazy-3#Lazy3Module'},
              ]),
            ],
          })
          export class Lazy2Module {}
        `);
        env.write('lazy/lazy-3.ts', `
          import {NgModule} from '@angular/core';

          @NgModule({})
          export class Lazy3Module {}
        `);

        const routes = env.driveRoutes();
        expect(routes).toEqual([
          lazyRouteMatching(
              './lazy-3#Lazy3Module', /\/lazy\/lazy-2\.ts$/, 'Lazy2Module', /\/lazy\/lazy-3\.ts$/,
              'Lazy3Module'),
          lazyRouteMatching(
              './lazy/lazy-1#Lazy1Module', /\/test\.ts$/, 'TestModule', /\/lazy\/lazy-1\.ts$/,
              'Lazy1Module'),
          lazyRouteMatching(
              './lazy/lazy-2#Lazy2Module', /\/test\.ts$/, 'TestModule', /\/lazy\/lazy-2\.ts$/,
              'Lazy2Module'),
        ]);
      });

      it('should detect lazy routes in simple children routes', () => {
        env.write('test.ts', `
          import {NgModule} from '@angular/core';
          import {RouterModule} from '@angular/router';

          @Component({
            selector: 'foo',
            template: '<div>Foo</div>'
          })
          class FooCmp {}

          @NgModule({
            imports: [
              RouterModule.forRoot([
                {path: '', children: [
                  {path: 'foo', component: FooCmp},
                  {path: 'lazy', loadChildren: './lazy#LazyModule'}
                ]},
              ]),
            ],
          })
          export class TestModule {}
        `);
        env.write('lazy.ts', `
          import {NgModule} from '@angular/core';
          import {RouterModule} from '@angular/router';

          @NgModule({})
          export class LazyModule {}
        `);

        const routes = env.driveRoutes();
        expect(routes).toEqual([
          lazyRouteMatching(
              './lazy#LazyModule', /\/test\.ts$/, 'TestModule', /\/lazy\.ts$/, 'LazyModule'),
        ]);
      });

      it('should detect lazy routes in all root directories', () => {
        env.tsconfig({}, ['./foo/other-root-dir', './bar/other-root-dir']);
        env.write('src/test.ts', `
          import {NgModule} from '@angular/core';
          import {RouterModule} from '@angular/router';

          @NgModule({
            imports: [
              RouterModule.forRoot([
                {path: '', loadChildren: './lazy-foo#LazyFooModule'},
              ]),
            ],
          })
          export class TestModule {}
        `);
        env.write('foo/other-root-dir/src/lazy-foo.ts', `
          import {NgModule} from '@angular/core';
          import {RouterModule} from '@angular/router';

          @NgModule({
            imports: [
              RouterModule.forChild([
                {path: '', loadChildren: './lazy-bar#LazyBarModule'},
              ]),
            ],
          })
          export class LazyFooModule {}
        `);
        env.write('bar/other-root-dir/src/lazy-bar.ts', `
          import {NgModule} from '@angular/core';
          import {RouterModule} from '@angular/router';

          @NgModule({
            imports: [
              RouterModule.forChild([
                {path: '', loadChildren: './lazier-bar#LazierBarModule'},
              ]),
            ],
          })
          export class LazyBarModule {}
        `);
        env.write('bar/other-root-dir/src/lazier-bar.ts', `
          import {NgModule} from '@angular/core';

          @NgModule({})
          export class LazierBarModule {}
        `);

        const routes = env.driveRoutes();

        expect(routes).toEqual([
          lazyRouteMatching(
              './lazy-foo#LazyFooModule', /\/test\.ts$/, 'TestModule',
              /\/foo\/other-root-dir\/src\/lazy-foo\.ts$/, 'LazyFooModule'),
          lazyRouteMatching(
              './lazy-bar#LazyBarModule', /\/foo\/other-root-dir\/src\/lazy-foo\.ts$/,
              'LazyFooModule', /\/bar\/other-root-dir\/src\/lazy-bar\.ts$/, 'LazyBarModule'),
          lazyRouteMatching(
              './lazier-bar#LazierBarModule', /\/bar\/other-root-dir\/src\/lazy-bar\.ts$/,
              'LazyBarModule', /\/bar\/other-root-dir\/src\/lazier-bar\.ts$/, 'LazierBarModule'),
        ]);
      });
    });

    describe('when called with entry module', () => {
      it('should throw if the entry module hasn\'t been analyzed', () => {
        env.write('test.ts', `
          import {NgModule} from '@angular/core';
          import {RouterModule} from '@angular/router';

          @NgModule({
            imports: [
              RouterModule.forChild([
                {path: '', loadChildren: './lazy#LazyModule'},
              ]),
            ],
          })
          export class TestModule {}
        `);

        const entryModule1 = path.join(env.basePath, 'test#TestModule');
        const entryModule2 = path.join(env.basePath, 'not-test#TestModule');
        const entryModule3 = path.join(env.basePath, 'test#NotTestModule');

        expect(() => env.driveRoutes(entryModule1)).not.toThrow();
        expect(() => env.driveRoutes(entryModule2))
            .toThrowError(`Failed to list lazy routes: Unknown module '${entryModule2}'.`);
        expect(() => env.driveRoutes(entryModule3))
            .toThrowError(`Failed to list lazy routes: Unknown module '${entryModule3}'.`);
      });

      it('should list all transitive lazy routes', () => {
        env.write('test.ts', `
          import {NgModule} from '@angular/core';
          import {RouterModule} from '@angular/router';
          import {Test1Module as Test1ModuleRenamed} from './test-1';
          import {Test2Module} from './test-2';

          @NgModule({
            exports: [
              Test1ModuleRenamed,
            ],
            imports: [
              Test2Module,
              RouterModule.forRoot([
                {path: '', loadChildren: './lazy/lazy#LazyModule'},
              ]),
            ],
          })
          export class TestModule {}
        `);
        env.write('test-1.ts', `
          import {NgModule} from '@angular/core';
          import {RouterModule} from '@angular/router';

          @NgModule({
            imports: [
              RouterModule.forChild([
                {path: 'one', loadChildren: './lazy-1/lazy-1#Lazy1Module'},
              ]),
            ],
          })
          export class Test1Module {}
        `);
        env.write('test-2.ts', `
          import {NgModule} from '@angular/core';
          import {RouterModule} from '@angular/router';

          @NgModule({
            exports: [
              RouterModule.forChild([
                {path: 'two', loadChildren: './lazy-2/lazy-2#Lazy2Module'},
              ]),
            ],
          })
          export class Test2Module {}
        `);
        env.write('lazy/lazy.ts', `
          import {NgModule} from '@angular/core';

          @NgModule({})
          export class LazyModule {}
        `);
        env.write('lazy-1/lazy-1.ts', `
          import {NgModule} from '@angular/core';

          @NgModule({})
          export class Lazy1Module {}
        `);
        env.write('lazy-2/lazy-2.ts', `
          import {NgModule} from '@angular/core';

          @NgModule({})
          export class Lazy2Module {}
        `);

        const routes = env.driveRoutes(path.join(env.basePath, 'test#TestModule'));

        expect(routes).toEqual([
          lazyRouteMatching(
              './lazy/lazy#LazyModule', /\/test\.ts$/, 'TestModule', /\/lazy\/lazy\.ts$/,
              'LazyModule'),
          lazyRouteMatching(
              './lazy-1/lazy-1#Lazy1Module', /\/test-1\.ts$/, 'Test1Module',
              /\/lazy-1\/lazy-1\.ts$/, 'Lazy1Module'),
          lazyRouteMatching(
              './lazy-2/lazy-2#Lazy2Module', /\/test-2\.ts$/, 'Test2Module',
              /\/lazy-2\/lazy-2\.ts$/, 'Lazy2Module'),
        ]);
      });

      it('should ignore exports that do not refer to an `NgModule`', () => {
        env.write('test-1.ts', `
          import {NgModule} from '@angular/core';
          import {RouterModule} from '@angular/router';
          import {Test2Component, Test2Module} from './test-2';

          @NgModule({
            exports: [
              Test2Component,
              Test2Module,
            ],
            imports: [
              RouterModule.forRoot([
                {path: '', loadChildren: './lazy-1/lazy-1#Lazy1Module'},
              ]),
            ],
          })
          export class Test1Module {}
        `);
        env.write('test-2.ts', `
          import {Component, NgModule} from '@angular/core';
          import {RouterModule} from '@angular/router';

          @Component({
            selector: 'test-2',
            template: '',
          })
          export class Test2Component {}

          @NgModule({
            declarations: [
              Test2Component,
            ],
            exports: [
              Test2Component,
              RouterModule.forChild([
                {path: 'two', loadChildren: './lazy-2/lazy-2#Lazy2Module'},
              ]),
            ],
          })
          export class Test2Module {}
        `);
        env.write('lazy-1/lazy-1.ts', `
          import {NgModule} from '@angular/core';

          @NgModule({})
          export class Lazy1Module {}
        `);
        env.write('lazy-2/lazy-2.ts', `
          import {NgModule} from '@angular/core';

          @NgModule({})
          export class Lazy2Module {}
        `);

        const routes = env.driveRoutes(path.join(env.basePath, 'test-1#Test1Module'));

        expect(routes).toEqual([
          lazyRouteMatching(
              './lazy-1/lazy-1#Lazy1Module', /\/test-1\.ts$/, 'Test1Module',
              /\/lazy-1\/lazy-1\.ts$/, 'Lazy1Module'),
          lazyRouteMatching(
              './lazy-2/lazy-2#Lazy2Module', /\/test-2\.ts$/, 'Test2Module',
              /\/lazy-2\/lazy-2\.ts$/, 'Lazy2Module'),
        ]);
      });

      it('should support `ModuleWithProviders`', () => {
        env.write('test.ts', `
          import {ModuleWithProviders, NgModule} from '@angular/core';
          import {RouterModule} from '@angular/router';

          @NgModule({
            imports: [
              RouterModule.forChild([
                {path: '', loadChildren: './lazy-2/lazy-2#Lazy2Module'},
              ]),
            ],
          })
          export class TestRoutingModule {
            static forRoot(): ModuleWithProviders<TestRoutingModule> {
              return {
                ngModule: TestRoutingModule,
                providers: [],
              };
            }
          }

          @NgModule({
            imports: [
              TestRoutingModule.forRoot(),
              RouterModule.forRoot([
                {path: '', loadChildren: './lazy-1/lazy-1#Lazy1Module'},
              ]),
            ],
          })
          export class TestModule {}
        `);
        env.write('lazy-1/lazy-1.ts', `
          import {NgModule} from '@angular/core';

          @NgModule({})
          export class Lazy1Module {}
        `);
        env.write('lazy-2/lazy-2.ts', `
          import {NgModule} from '@angular/core';

          @NgModule({})
          export class Lazy2Module {}
        `);

        const routes = env.driveRoutes(path.join(env.basePath, 'test#TestModule'));

        expect(routes).toEqual([
          lazyRouteMatching(
              './lazy-1/lazy-1#Lazy1Module', /\/test\.ts$/, 'TestModule', /\/lazy-1\/lazy-1\.ts$/,
              'Lazy1Module'),
          lazyRouteMatching(
              './lazy-2/lazy-2#Lazy2Module', /\/test\.ts$/, 'TestRoutingModule',
              /\/lazy-2\/lazy-2\.ts$/, 'Lazy2Module'),
        ]);
      });

      it('should only process each module once', () => {
        env.write('test.ts', `
          import {NgModule} from '@angular/core';
          import {RouterModule} from '@angular/router';

          @NgModule({
            imports: [
              RouterModule.forChild([
                {path: '', loadChildren: './lazy/lazy#LazyModule'},
              ]),
            ],
          })
          export class SharedModule {}

          @NgModule({
            imports: [
              SharedModule,
              RouterModule.forRoot([
                {path: '', loadChildren: './lazy/lazy#LazyModule'},
              ]),
            ],
          })
          export class TestModule {}
        `);
        env.write('lazy/lazy.ts', `
          import {NgModule} from '@angular/core';
          import {RouterModule} from '@angular/router';

          @NgModule({
            imports: [
              RouterModule.forChild([
                {path: '', loadChildren: '../lazier/lazier#LazierModule'},
              ]),
            ],
          })
          export class LazyModule {}
        `);
        env.write('lazier/lazier.ts', `
          import {NgModule} from '@angular/core';

          @NgModule({})
          export class LazierModule {}
        `);

        const routes = env.driveRoutes(path.join(env.basePath, 'test#TestModule'));

        // `LazyModule` is referenced in both `SharedModule` and `TestModule`,
        // but it is only processed once (hence one `LazierModule` entry).
        expect(routes).toEqual([
          lazyRouteMatching(
              './lazy/lazy#LazyModule', /\/test\.ts$/, 'TestModule', /\/lazy\/lazy\.ts$/,
              'LazyModule'),
          lazyRouteMatching(
              './lazy/lazy#LazyModule', /\/test\.ts$/, 'SharedModule', /\/lazy\/lazy\.ts$/,
              'LazyModule'),
          lazyRouteMatching(
              '../lazier/lazier#LazierModule', /\/lazy\/lazy\.ts$/, 'LazyModule',
              /\/lazier\/lazier\.ts$/, 'LazierModule'),
        ]);
      });

      it('should detect lazy routes in all root directories', () => {
        env.tsconfig({}, ['./foo/other-root-dir', './bar/other-root-dir']);
        env.write('src/test.ts', `
          import {NgModule} from '@angular/core';
          import {RouterModule} from '@angular/router';

          @NgModule({
            imports: [
              RouterModule.forRoot([
                {path: '', loadChildren: './lazy-foo#LazyFooModule'},
              ]),
            ],
          })
          export class TestModule {}
        `);
        env.write('foo/other-root-dir/src/lazy-foo.ts', `
          import {NgModule} from '@angular/core';
          import {RouterModule} from '@angular/router';

          @NgModule({
            imports: [
              RouterModule.forChild([
                {path: '', loadChildren: './lazy-bar#LazyBarModule'},
              ]),
            ],
          })
          export class LazyFooModule {}
        `);
        env.write('bar/other-root-dir/src/lazy-bar.ts', `
          import {NgModule} from '@angular/core';
          import {RouterModule} from '@angular/router';

          @NgModule({
            imports: [
              RouterModule.forChild([
                {path: '', loadChildren: './lazier-bar#LazierBarModule'},
              ]),
            ],
          })
          export class LazyBarModule {}
        `);
        env.write('bar/other-root-dir/src/lazier-bar.ts', `
          import {NgModule} from '@angular/core';

          @NgModule({})
          export class LazierBarModule {}
        `);

        const routes = env.driveRoutes(path.join(env.basePath, 'src/test#TestModule'));

        expect(routes).toEqual([
          lazyRouteMatching(
              './lazy-foo#LazyFooModule', /\/test\.ts$/, 'TestModule',
              /\/foo\/other-root-dir\/src\/lazy-foo\.ts$/, 'LazyFooModule'),
          lazyRouteMatching(
              './lazy-bar#LazyBarModule', /\/foo\/other-root-dir\/src\/lazy-foo\.ts$/,
              'LazyFooModule', /\/bar\/other-root-dir\/src\/lazy-bar\.ts$/, 'LazyBarModule'),
          lazyRouteMatching(
              './lazier-bar#LazierBarModule', /\/bar\/other-root-dir\/src\/lazy-bar\.ts$/,
              'LazyBarModule', /\/bar\/other-root-dir\/src\/lazier-bar\.ts$/, 'LazierBarModule'),
        ]);
      });

      it('should ignore modules not (transitively) referenced by the entry module', () => {
        env.write('test.ts', `
          import {NgModule} from '@angular/core';
          import {RouterModule} from '@angular/router';

          @NgModule({
            imports: [
              RouterModule.forRoot([
                {path: '', loadChildren: './lazy/lazy#Lazy1Module'},
              ]),
            ],
          })
          export class Test1Module {}

          @NgModule({
            imports: [
              RouterModule.forRoot([
                {path: '', loadChildren: './lazy/lazy#Lazy2Module'},
              ]),
            ],
          })
          export class Test2Module {}
        `);
        env.write('lazy/lazy.ts', `
          import {NgModule} from '@angular/core';

          @NgModule({})
          export class Lazy1Module {}

          @NgModule({})
          export class Lazy2Module {}
        `);

        const routes = env.driveRoutes(path.join(env.basePath, 'test#Test1Module'));

        expect(routes).toEqual([
          lazyRouteMatching(
              './lazy/lazy#Lazy1Module', /\/test\.ts$/, 'Test1Module', /\/lazy\/lazy\.ts$/,
              'Lazy1Module'),
        ]);
      });

      it('should ignore routes to unknown modules', () => {
        env.write('test.ts', `
          import {NgModule} from '@angular/core';
          import {RouterModule} from '@angular/router';

          @NgModule({
            imports: [
              RouterModule.forRoot([
                {path: '', loadChildren: './unknown/unknown#UnknownModule'},
                {path: '', loadChildren: './lazy/lazy#LazyModule'},
              ]),
            ],
          })
          export class TestModule {}
        `);
        env.write('lazy/lazy.ts', `
          import {NgModule} from '@angular/core';

          @NgModule({})
          export class LazyModule {}
        `);

        const routes = env.driveRoutes(path.join(env.basePath, 'test#TestModule'));

        expect(routes).toEqual([
          lazyRouteMatching(
              './lazy/lazy#LazyModule', /\/test\.ts$/, 'TestModule', /\/lazy\/lazy\.ts$/,
              'LazyModule'),
        ]);
      });
    });
  });
});

function expectTokenAtPosition<T extends ts.Node>(
    sf: ts.SourceFile, pos: number, guard: (node: ts.Node) => node is T): T {
  // getTokenAtPosition is part of TypeScript's private API.
  const node = (ts as any).getTokenAtPosition(sf, pos) as ts.Node;
  expect(guard(node)).toBe(true);
  return node as T;
}

function normalize(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}
