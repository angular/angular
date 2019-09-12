/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ComponentFactory, ComponentFactoryResolver, EventEmitter, Injector, Input, NgModule, NgModuleRef, Output, RendererFactory2, Sanitizer, Type, ViewEncapsulation} from '@angular/core';
import {injectComponentFactoryResolver} from '@angular/core/src/render3';
import {domRendererFactory3} from '@angular/core/src/render3/interfaces/renderer';
import {TestBed} from '@angular/core/testing';
import {beforeEach} from '@angular/core/testing/src/testing_internal';
import {expect} from '@angular/platform-browser/testing/src/matchers';
import {ivyEnabled, onlyInIvy} from '@angular/private/testing';

describe('ComponentFactory', () => {

  describe('constructor()', () => {

    /**
     * Ivy tests don't need this,
     * but VE tests need the component to be in an NgModule
     * to be used with `ComponentFactoryResolver`
     * @param componentType The component to add to the TestingModule
     */
    function setupModuleForViewEngineTest<T>(componentType: Type<T>) {
      @NgModule({entryComponents: [componentType], declarations: [componentType]})
      class TestModule {
      }

      TestBed.configureTestingModule({imports: [TestModule]});
    }

    it('should correctly populate default properties', () => {
      @Component({selector: 'test[foo],bar', template: ''})
      class TestComponent {
      }

      if (!ivyEnabled) {
        setupModuleForViewEngineTest(TestComponent);
      }

      const cfr = TestBed.inject(ComponentFactoryResolver);
      const cf = cfr.resolveComponentFactory(TestComponent);

      expect(cf.selector).toBe('test[foo],bar');
      expect(cf.componentType).toBe(TestComponent);
      expect(cf.ngContentSelectors).toEqual([]);
      expect(cf.inputs).toEqual([]);
      expect(cf.outputs).toEqual([]);
    });

    it('should correctly populate defined properties', () => {
      @Component({
        selector: 'test',
        template:
            '<ng-content select="*"></ng-content><ng-content select="a"></ng-content><ng-content select="b"></ng-content>',
        encapsulation: ViewEncapsulation.None
      })
      class TestComponent {
        @Input() in1 = '';
        @Input('input-attr-2') in2 = '';
        @Output() out1 = new EventEmitter();
        @Output('output-attr-2') out2 = new EventEmitter();
      }

      if (!ivyEnabled) {
        setupModuleForViewEngineTest(TestComponent);
      }

      const cfr = TestBed.inject(ComponentFactoryResolver);
      const cf = cfr.resolveComponentFactory(TestComponent);

      expect(cf.componentType).toBe(TestComponent);
      expect(cf.ngContentSelectors).toEqual(['*', 'a', 'b']);
      expect(cf.selector).toBe('test');

      expect(cf.inputs).toEqual([
        {propName: 'in1', templateName: 'in1'}, {propName: 'in2', templateName: 'input-attr-2'}
      ]);
      expect(cf.outputs).toEqual([
        {propName: 'out1', templateName: 'out1'},
        {propName: 'out2', templateName: 'output-attr-2'}
      ]);
    });
  });

  onlyInIvy('renderer3 is available only in Ivy').describe('create()', () => {

    let createRenderer2Spy: jasmine.Spy;
    let createRenderer3Spy: jasmine.Spy;
    let cf: ComponentFactory<any>;

    beforeEach(() => {
      createRenderer2Spy =
          jasmine.createSpy('RendererFactory2#createRenderer').and.returnValue(document);
      createRenderer3Spy = spyOn(domRendererFactory3, 'createRenderer').and.callThrough();

      @Component({selector: 'test', template: ''})
      class TestComponent {
      }

      const cfr = injectComponentFactoryResolver();
      cf = cfr.resolveComponentFactory(TestComponent);
    });

    describe('(when `ngModuleRef` is not provided)', () => {

      it('should retrieve `RendererFactory2` from the specified injector', () => {
        const injector = Injector.create({
          providers:
              [{provide: RendererFactory2, useValue: {createRenderer: createRenderer2Spy}}]
        });

        cf.create(injector);

        expect(createRenderer2Spy).toHaveBeenCalled();
        expect(createRenderer3Spy).not.toHaveBeenCalled();
      });

      it('should fall back to `domRendererFactory3` if `RendererFactory2` is not provided', () => {
        const injector = Injector.create({providers: []});

        cf.create(injector);

        expect(createRenderer2Spy).not.toHaveBeenCalled();
        expect(createRenderer3Spy).toHaveBeenCalled();
      });

      it('should retrieve `Sanitizer` from the specified injector', () => {
        const sanitizerFactorySpy = jasmine.createSpy('sanitizerFactory').and.returnValue({});
        const injector = Injector.create(
            {providers: [{provide: Sanitizer, useFactory: sanitizerFactorySpy, deps: []}]});

        cf.create(injector);

        expect(sanitizerFactorySpy).toHaveBeenCalled();
      });
    });

    describe('(when `ngModuleRef` is provided)', () => {
      it('should retrieve `RendererFactory2` from the specified injector first', () => {
        const injector = Injector.create({
          providers:
              [{provide: RendererFactory2, useValue: {createRenderer: createRenderer2Spy}}]
        });
        const mInjector = Injector.create({
          providers:
              [{provide: RendererFactory2, useValue: {createRenderer: createRenderer3Spy}}]
        });

        cf.create(injector, undefined, undefined, { injector: mInjector } as NgModuleRef<any>);

        expect(createRenderer2Spy).toHaveBeenCalled();
        expect(createRenderer3Spy).not.toHaveBeenCalled();
      });

      it('should retrieve `RendererFactory2` from the `ngModuleRef` if not provided by the injector',
         () => {
           const injector = Injector.create({providers: []});
           const mInjector = Injector.create({
             providers:
                 [{provide: RendererFactory2, useValue: {createRenderer: createRenderer2Spy}}]
           });

           cf.create(injector, undefined, undefined, { injector: mInjector } as NgModuleRef<any>);

           expect(createRenderer2Spy).toHaveBeenCalled();
           expect(createRenderer3Spy).not.toHaveBeenCalled();
         });

      it('should fall back to `domRendererFactory3` if `RendererFactory2` is not provided', () => {
        const injector = Injector.create({providers: []});
        const mInjector = Injector.create({providers: []});

        cf.create(injector, undefined, undefined, { injector: mInjector } as NgModuleRef<any>);

        expect(createRenderer2Spy).not.toHaveBeenCalled();
        expect(createRenderer3Spy).toHaveBeenCalled();
      });

      it('should retrieve `Sanitizer` from the specified injector first', () => {
        const iSanitizerFactorySpy =
            jasmine.createSpy('Injector#sanitizerFactory').and.returnValue({});
        const injector = Injector.create(
            {providers: [{provide: Sanitizer, useFactory: iSanitizerFactorySpy, deps: []}]});

        const mSanitizerFactorySpy =
            jasmine.createSpy('NgModuleRef#sanitizerFactory').and.returnValue({});
        const mInjector = Injector.create(
            {providers: [{provide: Sanitizer, useFactory: mSanitizerFactorySpy, deps: []}]});

        cf.create(injector, undefined, undefined, { injector: mInjector } as NgModuleRef<any>);

        expect(iSanitizerFactorySpy).toHaveBeenCalled();
        expect(mSanitizerFactorySpy).not.toHaveBeenCalled();
      });

      it('should retrieve `Sanitizer` from the `ngModuleRef` if not provided by the injector',
         () => {
           const injector = Injector.create({providers: []});

           const mSanitizerFactorySpy =
               jasmine.createSpy('NgModuleRef#sanitizerFactory').and.returnValue({});
           const mInjector = Injector.create(
               {providers: [{provide: Sanitizer, useFactory: mSanitizerFactorySpy, deps: []}]});

           cf.create(injector, undefined, undefined, { injector: mInjector } as NgModuleRef<any>);

           expect(mSanitizerFactorySpy).toHaveBeenCalled();
         });
    });

    describe('(when the factory is bound to a `ngModuleRef`)', () => {
      it('should retrieve `RendererFactory2` from the specified injector first', () => {
        const injector = Injector.create({
          providers:
              [{provide: RendererFactory2, useValue: {createRenderer: createRenderer2Spy}}]
        });
        (cf as any).ngModule = {
          injector: Injector.create({
            providers:
                [{provide: RendererFactory2, useValue: {createRenderer: createRenderer3Spy}}]
          })
        };

        cf.create(injector);

        expect(createRenderer2Spy).toHaveBeenCalled();
        expect(createRenderer3Spy).not.toHaveBeenCalled();
      });

      it('should retrieve `RendererFactory2` from the `ngModuleRef` if not provided by the injector',
         () => {
           const injector = Injector.create({providers: []});
           (cf as any).ngModule = {
             injector: Injector.create({
               providers:
                   [{provide: RendererFactory2, useValue: {createRenderer: createRenderer2Spy}}]
             })
           };

           cf.create(injector);

           expect(createRenderer2Spy).toHaveBeenCalled();
           expect(createRenderer3Spy).not.toHaveBeenCalled();
         });

      it('should fall back to `domRendererFactory3` if `RendererFactory2` is not provided', () => {
        const injector = Injector.create({providers: []});
        (cf as any).ngModule = {injector: Injector.create({providers: []})};

        cf.create(injector);

        expect(createRenderer2Spy).not.toHaveBeenCalled();
        expect(createRenderer3Spy).toHaveBeenCalled();
      });

      it('should retrieve `Sanitizer` from the specified injector first', () => {
        const iSanitizerFactorySpy =
            jasmine.createSpy('Injector#sanitizerFactory').and.returnValue({});
        const injector = Injector.create(
            {providers: [{provide: Sanitizer, useFactory: iSanitizerFactorySpy, deps: []}]});

        const mSanitizerFactorySpy =
            jasmine.createSpy('NgModuleRef#sanitizerFactory').and.returnValue({});
        (cf as any).ngModule = {
          injector: Injector.create(
              {providers: [{provide: Sanitizer, useFactory: mSanitizerFactorySpy, deps: []}]})
        };

        cf.create(injector);

        expect(iSanitizerFactorySpy).toHaveBeenCalled();
        expect(mSanitizerFactorySpy).not.toHaveBeenCalled();
      });

      it('should retrieve `Sanitizer` from the `ngModuleRef` if not provided by the injector',
         () => {
           const injector = Injector.create({providers: []});

           const mSanitizerFactorySpy =
               jasmine.createSpy('NgModuleRef#sanitizerFactory').and.returnValue({});
           (cf as any).ngModule = {
             injector: Injector.create(
                 {providers: [{provide: Sanitizer, useFactory: mSanitizerFactorySpy, deps: []}]})
           };

           cf.create(injector);

           expect(mSanitizerFactorySpy).toHaveBeenCalled();
         });
    });
  });

});
