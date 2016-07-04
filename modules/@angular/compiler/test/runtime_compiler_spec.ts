import {beforeEach, ddescribe, xdescribe, describe, expect, iit, inject, beforeEachProviders, it, xit,} from '@angular/core/testing/testing_internal';
import {Injectable, Component, Input, ViewMetadata, Compiler, ComponentFactory, Injector, AppModule, AppModuleMetadata, AppModuleFactory} from '@angular/core';
import {ConcreteType, stringify} from '../src/facade/lang';
import {fakeAsync, tick, TestComponentBuilder, ComponentFixture, configureCompiler} from '@angular/core/testing';
import {XHR, ViewResolver} from '@angular/compiler';
import {MockViewResolver} from '@angular/compiler/testing';

import {SpyXHR} from './spies';

@Component({selector: 'child-cmp', template: 'childComp'})
class ChildComp {
}

@Component({selector: 'some-cmp', template: 'someComp'})
class SomeComp {
}

@Component({selector: 'some-cmp', templateUrl: './someTpl'})
class SomeCompWithUrlTemplate {
}

@AppModule({})
class SomeModule {
}

export function main() {
  describe('RuntimeCompiler', () => {
    let compiler: Compiler;
    let xhr: SpyXHR;
    let tcb: TestComponentBuilder;
    let viewResolver: MockViewResolver;
    let injector: Injector;

    beforeEach(() => { configureCompiler({providers: [{provide: XHR, useClass: SpyXHR}]}); });

    beforeEach(inject(
        [Compiler, TestComponentBuilder, XHR, ViewResolver, Injector],
        (_compiler: Compiler, _tcb: TestComponentBuilder, _xhr: SpyXHR,
         _viewResolver: MockViewResolver, _injector: Injector) => {
          compiler = _compiler;
          tcb = _tcb;
          xhr = _xhr;
          viewResolver = _viewResolver;
          injector = _injector;
        }));

    describe('clearCacheFor', () => {
      it('should support changing the content of a template referenced via templateUrl',
         fakeAsync(() => {
           xhr.spy('get').andCallFake(() => Promise.resolve('init'));
           let compFixture =
               tcb.overrideView(SomeComp, new ViewMetadata({templateUrl: '/myComp.html'}))
                   .createFakeAsync(SomeComp);
           expect(compFixture.nativeElement).toHaveText('init');

           xhr.spy('get').andCallFake(() => Promise.resolve('new content'));
           // Note: overrideView is calling .clearCacheFor...
           compFixture = tcb.overrideView(SomeComp, new ViewMetadata({templateUrl: '/myComp.html'}))
                             .createFakeAsync(SomeComp);
           expect(compFixture.nativeElement).toHaveText('new content');
         }));

      it('should support overwriting inline templates', () => {
        let componentFixture = tcb.createSync(SomeComp);
        expect(componentFixture.nativeElement).toHaveText('someComp');

        componentFixture = tcb.overrideTemplate(SomeComp, 'test').createSync(SomeComp);
        expect(componentFixture.nativeElement).toHaveText('test');
      });

      it('should not update existing compilation results', () => {
        viewResolver.setView(
            SomeComp,
            new ViewMetadata({template: '<child-cmp></child-cmp>', directives: [ChildComp]}));
        viewResolver.setInlineTemplate(ChildComp, 'oldChild');
        let compFactory = compiler.compileComponentSync(SomeComp);
        viewResolver.setInlineTemplate(ChildComp, 'newChild');
        compiler.compileComponentSync(SomeComp);
        let compRef = compFactory.create(injector);
        expect(compRef.location.nativeElement).toHaveText('oldChild');
      });
    });

    describe('compileComponentSync', () => {
      it('should throw when using a templateUrl that has not been compiled before', () => {
        xhr.spy('get').andCallFake(() => Promise.resolve(''));
        expect(() => tcb.createSync(SomeCompWithUrlTemplate))
            .toThrowError(
                `Can't compile synchronously as ${stringify(SomeCompWithUrlTemplate)} is still being loaded!`);
      });

      it('should throw when using a templateUrl in a nested component that has not been compiled before',
         () => {
           xhr.spy('get').andCallFake(() => Promise.resolve(''));
           let localTcb =
               tcb.overrideView(SomeComp, new ViewMetadata({template: '', directives: [ChildComp]}))
                   .overrideView(ChildComp, new ViewMetadata({templateUrl: '/someTpl.html'}));
           expect(() => localTcb.createSync(SomeComp))
               .toThrowError(
                   `Can't compile synchronously as ${stringify(ChildComp)} is still being loaded!`);
         });

      it('should allow to use templateUrl components that have been loaded before',
         fakeAsync(() => {
           xhr.spy('get').andCallFake(() => Promise.resolve('hello'));
           tcb.createFakeAsync(SomeCompWithUrlTemplate);
           let compFixture = tcb.createSync(SomeCompWithUrlTemplate);
           expect(compFixture.nativeElement).toHaveText('hello');
         }));
    });

    describe('compileAppModuleAsync', () => {
      it('should allow to use templateUrl components', fakeAsync(() => {
           xhr.spy('get').andCallFake(() => Promise.resolve('hello'));
           let appModuleFactory: AppModuleFactory<any>;
           compiler
               .compileAppModuleAsync(
                   SomeModule, new AppModuleMetadata({precompile: [SomeCompWithUrlTemplate]}))
               .then((f) => appModuleFactory = f);
           tick();
           expect(appModuleFactory.moduleType).toBe(SomeModule);
         }));
    });

    describe('compileAppModuleSync', () => {
      it('should throw when using a templateUrl that has not been compiled before', () => {
        xhr.spy('get').andCallFake(() => Promise.resolve(''));
        expect(
            () => compiler.compileAppModuleSync(
                SomeModule, new AppModuleMetadata({precompile: [SomeCompWithUrlTemplate]})))
            .toThrowError(
                `Can't compile synchronously as ${stringify(SomeCompWithUrlTemplate)} is still being loaded!`);
      });

      it('should throw when using a templateUrl in a nested component that has not been compiled before',
         () => {
           xhr.spy('get').andCallFake(() => Promise.resolve(''));
           viewResolver.setView(
               SomeComp, new ViewMetadata({template: '', directives: [ChildComp]}));
           viewResolver.setView(ChildComp, new ViewMetadata({templateUrl: '/someTpl.html'}));
           expect(
               () => compiler.compileAppModuleSync(
                   SomeModule, new AppModuleMetadata({precompile: [SomeComp]})))
               .toThrowError(
                   `Can't compile synchronously as ${stringify(ChildComp)} is still being loaded!`);
         });

      it('should allow to use templateUrl components that have been loaded before',
         fakeAsync(() => {
           xhr.spy('get').andCallFake(() => Promise.resolve('hello'));
           tcb.createFakeAsync(SomeCompWithUrlTemplate);
           let appModuleFactory = compiler.compileAppModuleSync(
               SomeModule, new AppModuleMetadata({precompile: [SomeCompWithUrlTemplate]}));
           expect(appModuleFactory).toBeTruthy();
         }));
    });
  });
}