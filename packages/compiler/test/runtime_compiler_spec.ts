/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DirectiveResolver, ResourceLoader} from '@angular/compiler';
import {Compiler, Component, Injector, NgModule, NgModuleFactory, ɵstringify as stringify} from '@angular/core';
import {fakeAsync, inject, TestBed, tick, waitForAsync} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';

import {MockDirectiveResolver} from '../testing';

@Component({selector: 'child-cmp'})
class ChildComp {
}

@Component({selector: 'some-cmp', template: 'someComp'})
class SomeComp {
}

@Component({selector: 'some-cmp', templateUrl: './someTpl'})
class SomeCompWithUrlTemplate {
}

{
  describe('RuntimeCompiler', () => {
    describe('compilerComponentSync', () => {
      describe('never resolving loader', () => {
        class StubResourceLoader {
          get(url: string) {
            return new Promise(() => {});
          }
        }

        beforeEach(() => {
          TestBed.configureCompiler(
              {providers: [{provide: ResourceLoader, useClass: StubResourceLoader, deps: []}]});
        });

        it('should throw when using a templateUrl that has not been compiled before',
           waitForAsync(() => {
             TestBed.configureTestingModule({declarations: [SomeCompWithUrlTemplate]});
             TestBed.compileComponents().then(() => {
               expect(() => TestBed.createComponent(SomeCompWithUrlTemplate))
                   .toThrowError(`Can't compile synchronously as ${
                       stringify(SomeCompWithUrlTemplate)} is still being loaded!`);
             });
           }));

        it('should throw when using a templateUrl in a nested component that has not been compiled before',
           () => {
             TestBed.configureTestingModule({declarations: [SomeComp, ChildComp]});
             TestBed.overrideComponent(ChildComp, {set: {templateUrl: '/someTpl.html'}});
             TestBed.overrideComponent(SomeComp, {set: {template: '<child-cmp></child-cmp>'}});
             TestBed.compileComponents().then(() => {
               expect(() => TestBed.createComponent(SomeComp))
                   .toThrowError(`Can't compile synchronously as ${
                       stringify(ChildComp)} is still being loaded!`);
             });
           });
      });

      describe('resolving loader', () => {
        class StubResourceLoader {
          get(url: string) {
            return Promise.resolve('hello');
          }
        }

        beforeEach(() => {
          TestBed.configureCompiler(
              {providers: [{provide: ResourceLoader, useClass: StubResourceLoader, deps: []}]});
        });

        it('should allow to use templateUrl components that have been loaded before',
           waitForAsync(() => {
             TestBed.configureTestingModule({declarations: [SomeCompWithUrlTemplate]});
             TestBed.compileComponents().then(() => {
               const fixture = TestBed.createComponent(SomeCompWithUrlTemplate);
               expect(fixture.nativeElement).toHaveText('hello');
             });
           }));
      });
    });
  });

  describe('RuntimeCompiler', () => {
    let compiler: Compiler;
    let resourceLoader: {get: jasmine.Spy};
    let dirResolver: MockDirectiveResolver;

    beforeEach(() => {
      resourceLoader = jasmine.createSpyObj('ResourceLoader', ['get']);
      TestBed.configureCompiler({providers: [{provide: ResourceLoader, useValue: resourceLoader}]});
    });

    beforeEach(fakeAsync(inject(
        [Compiler, ResourceLoader, DirectiveResolver, Injector],
        (_compiler: Compiler, _resourceLoader: any, _dirResolver: MockDirectiveResolver) => {
          compiler = _compiler;
          resourceLoader = _resourceLoader;
          dirResolver = _dirResolver;
        })));

    describe('compileModuleAsync', () => {
      it('should allow to use templateUrl components', fakeAsync(() => {
           @NgModule({
             declarations: [SomeCompWithUrlTemplate],
             entryComponents: [SomeCompWithUrlTemplate]
           })
           class SomeModule {
           }

           resourceLoader.get.and.callFake(() => Promise.resolve('hello'));
           let ngModuleFactory: NgModuleFactory<any> = undefined!;
           compiler.compileModuleAsync(SomeModule).then((f) => ngModuleFactory = f);
           tick();
           expect(ngModuleFactory.moduleType).toBe(SomeModule);
         }));
    });

    describe('compileModuleSync', () => {
      it('should throw when using a templateUrl that has not been compiled before', () => {
        @NgModule(
            {declarations: [SomeCompWithUrlTemplate], entryComponents: [SomeCompWithUrlTemplate]})
        class SomeModule {
        }

        resourceLoader.get.and.callFake(() => Promise.resolve(''));
        expect(() => compiler.compileModuleSync(SomeModule))
            .toThrowError(`Can't compile synchronously as ${
                stringify(SomeCompWithUrlTemplate)} is still being loaded!`);
      });

      it('should throw when using a templateUrl in a nested component that has not been compiled before',
         () => {
           @NgModule({declarations: [SomeComp, ChildComp], entryComponents: [SomeComp]})
           class SomeModule {
           }

           resourceLoader.get.and.callFake(() => Promise.resolve(''));
           dirResolver.setDirective(SomeComp, new Component({selector: 'some-cmp', template: ''}));
           dirResolver.setDirective(
               ChildComp, new Component({selector: 'child-cmp', templateUrl: '/someTpl.html'}));
           expect(() => compiler.compileModuleSync(SomeModule))
               .toThrowError(
                   `Can't compile synchronously as ${stringify(ChildComp)} is still being loaded!`);
         });

      it('should allow to use templateUrl components that have been loaded before',
         fakeAsync(() => {
           @NgModule({
             declarations: [SomeCompWithUrlTemplate],
             entryComponents: [SomeCompWithUrlTemplate]
           })
           class SomeModule {
           }

           resourceLoader.get.and.callFake(() => Promise.resolve('hello'));
           compiler.compileModuleAsync(SomeModule);
           tick();

           const ngModuleFactory = compiler.compileModuleSync(SomeModule);
           expect(ngModuleFactory).toBeTruthy();
         }));
    });
  });
}
