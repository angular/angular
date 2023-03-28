/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Attribute, ChangeDetectionStrategy, ChangeDetectorRef, Component, createComponent as coreCreateComponent, createEnvironmentInjector, DebugElement, Directive, ElementRef, EmbeddedViewRef, EnvironmentInjector, Host, Inject, InjectionToken, Injector, Input, NgModule, Optional, Pipe, PipeTransform, Provider, Self, SkipSelf, TemplateRef, Type, ViewContainerRef} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';

@Directive({selector: '[simpleDirective]'})
class SimpleDirective {
  @Input('simpleDirective') value: any = null;
}

@Component({selector: '[simpleComponent]', template: ''})
class SimpleComponent {
}

@Directive({selector: '[someOtherDirective]'})
class SomeOtherDirective {
}

@Directive({selector: '[cycleDirective]'})
class CycleDirective {
  constructor(self: CycleDirective) {}
}

@Directive({selector: '[needsDirectiveFromSelf]'})
class NeedsDirectiveFromSelf {
  dependency: SimpleDirective;
  constructor(@Self() dependency: SimpleDirective) {
    this.dependency = dependency;
  }
}

@Directive({selector: '[optionallyNeedsDirective]'})
class OptionallyNeedsDirective {
  dependency: SimpleDirective;
  constructor(@Self() @Optional() dependency: SimpleDirective) {
    this.dependency = dependency;
  }
}

@Directive({selector: '[needsComponentFromHost]'})
class NeedsComponentFromHost {
  dependency: SimpleComponent;
  constructor(@Host() dependency: SimpleComponent) {
    this.dependency = dependency;
  }
}

@Directive({selector: '[needsDirectiveFromHost]'})
class NeedsDirectiveFromHost {
  dependency: SimpleDirective;
  constructor(@Host() dependency: SimpleDirective) {
    this.dependency = dependency;
  }
}

@Directive({selector: '[needsDirective]'})
class NeedsDirective {
  dependency: SimpleDirective;
  constructor(dependency: SimpleDirective) {
    this.dependency = dependency;
  }
}

@Directive({selector: '[needsService]'})
class NeedsService {
  service: any;
  constructor(@Inject('service') service: any) {
    this.service = service;
  }
}

@Directive({selector: '[needsAppService]'})
class NeedsAppService {
  service: any;
  constructor(@Inject('appService') service: any) {
    this.service = service;
  }
}

@Component({selector: '[needsHostAppService]', template: ''})
class NeedsHostAppService {
  service: any;
  constructor(@Host() @Inject('appService') service: any) {
    this.service = service;
  }
}

@Component({selector: '[needsServiceComponent]', template: ''})
class NeedsServiceComponent {
  service: any;
  constructor(@Inject('service') service: any) {
    this.service = service;
  }
}

@Directive({selector: '[needsServiceFromHost]'})
class NeedsServiceFromHost {
  service: any;
  constructor(@Host() @Inject('service') service: any) {
    this.service = service;
  }
}

@Directive({selector: '[needsAttribute]'})
class NeedsAttribute {
  typeAttribute: any;
  titleAttribute: any;
  fooAttribute: any;
  constructor(
      @Attribute('type') typeAttribute: String, @Attribute('title') titleAttribute: String,
      @Attribute('foo') fooAttribute: String) {
    this.typeAttribute = typeAttribute;
    this.titleAttribute = titleAttribute;
    this.fooAttribute = fooAttribute;
  }
}

@Directive({selector: '[needsAttributeNoType]'})
class NeedsAttributeNoType {
  constructor(@Attribute('foo') public fooAttribute: any) {}
}

@Directive({selector: '[needsElementRef]'})
class NeedsElementRef {
  constructor(public elementRef: ElementRef) {}
}

@Directive({selector: '[needsViewContainerRef]'})
class NeedsViewContainerRef {
  constructor(public viewContainer: ViewContainerRef) {}
}

@Directive({selector: '[needsTemplateRef]'})
class NeedsTemplateRef {
  constructor(public templateRef: TemplateRef<Object>) {}
}

@Directive({selector: '[optionallyNeedsTemplateRef]'})
class OptionallyNeedsTemplateRef {
  constructor(@Optional() public templateRef: TemplateRef<Object>) {}
}

@Directive({selector: '[directiveNeedsChangeDetectorRef]'})
class DirectiveNeedsChangeDetectorRef {
  constructor(public changeDetectorRef: ChangeDetectorRef) {}
}

@Component({
  selector: '[componentNeedsChangeDetectorRef]',
  template: '{{counter}}',
  changeDetection: ChangeDetectionStrategy.OnPush
})
class PushComponentNeedsChangeDetectorRef {
  counter: number = 0;
  constructor(public changeDetectorRef: ChangeDetectorRef) {}
}

@Pipe({name: 'purePipe', pure: true})
class PurePipe implements PipeTransform {
  constructor() {}
  transform(value: any): any {
    return this;
  }
}

@Pipe({name: 'impurePipe', pure: false})
class ImpurePipe implements PipeTransform {
  constructor() {}
  transform(value: any): any {
    return this;
  }
}

@Pipe({name: 'pipeNeedsChangeDetectorRef'})
class PipeNeedsChangeDetectorRef {
  constructor(public changeDetectorRef: ChangeDetectorRef) {}
  transform(value: any): any {
    return this;
  }
}

@Pipe({name: 'pipeNeedsService'})
export class PipeNeedsService implements PipeTransform {
  service: any;
  constructor(@Inject('service') service: any) {
    this.service = service;
  }
  transform(value: any): any {
    return this;
  }
}

@Pipe({name: 'duplicatePipe'})
export class DuplicatePipe1 implements PipeTransform {
  transform(value: any): any {
    return this;
  }
}

@Pipe({name: 'duplicatePipe'})
export class DuplicatePipe2 implements PipeTransform {
  transform(value: any): any {
    return this;
  }
}

@Component({selector: 'root', template: ''})
class TestComp {
}

function createComponentFixture<T>(
    template: string, providers?: Provider[]|null, comp?: Type<T>): ComponentFixture<T> {
  if (!comp) {
    comp = <any>TestComp;
  }
  TestBed.overrideComponent(comp!, {set: {template}});
  if (providers && providers.length) {
    TestBed.overrideComponent(comp!, {add: {providers: providers}});
  }
  return TestBed.createComponent(comp!);
}

function createComponent(template: string, providers?: Provider[], comp?: Type<any>): DebugElement {
  const fixture = createComponentFixture(template, providers, comp);
  fixture.detectChanges();
  return fixture.debugElement;
}

describe('View injector', () => {
  const TOKEN = new InjectionToken<string>('token');

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComp],
      providers: [
        {provide: TOKEN, useValue: 'appService'},
        {provide: 'appService', useFactory: (v: string) => v, deps: [TOKEN]},
      ],
    });
  });

  describe('injection', () => {
    it('should instantiate directives that have no dependencies', () => {
      TestBed.configureTestingModule({declarations: [SimpleDirective]});
      const el = createComponent('<div simpleDirective>');
      expect(el.children[0].injector.get(SimpleDirective)).toBeAnInstanceOf(SimpleDirective);
    });

    it('should instantiate directives that depend on another directive', () => {
      TestBed.configureTestingModule({declarations: [SimpleDirective, NeedsDirective]});
      const el = createComponent('<div simpleDirective needsDirective>');

      const d = el.children[0].injector.get(NeedsDirective);

      expect(d).toBeAnInstanceOf(NeedsDirective);
      expect(d.dependency).toBeAnInstanceOf(SimpleDirective);
    });

    it('should support useValue with different values', () => {
      const el = createComponent('', [
        {provide: 'numLiteral', useValue: 0},
        {provide: 'boolLiteral', useValue: true},
        {provide: 'strLiteral', useValue: 'a'},
        {provide: 'null', useValue: null},
        {provide: 'array', useValue: [1]},
        {provide: 'map', useValue: {'a': 1}},
        {provide: 'instance', useValue: new TestValue('a')},
        {provide: 'nested', useValue: [{'a': [1]}, new TestValue('b')]},
      ]);
      expect(el.injector.get('numLiteral')).toBe(0);
      expect(el.injector.get('boolLiteral')).toBe(true);
      expect(el.injector.get('strLiteral')).toBe('a');
      expect(el.injector.get('null')).toBe(null);
      expect(el.injector.get('array')).toEqual([1]);
      expect(el.injector.get('map')).toEqual({'a': 1});
      expect(el.injector.get('instance')).toEqual(new TestValue('a'));
      expect(el.injector.get('nested')).toEqual([{'a': [1]}, new TestValue('b')]);
    });

    it('should instantiate providers that have dependencies with SkipSelf', () => {
      TestBed.configureTestingModule({declarations: [SimpleDirective, SomeOtherDirective]});
      TestBed.overrideDirective(
          SimpleDirective, {add: {providers: [{provide: 'injectable1', useValue: 'injectable1'}]}});
      TestBed.overrideDirective(SomeOtherDirective, {
        add: {
          providers: [
            {provide: 'injectable1', useValue: 'new-injectable1'}, {
              provide: 'injectable2',
              useFactory: (val: any) => `${val}-injectable2`,
              deps: [[new Inject('injectable1'), new SkipSelf()]]
            }
          ]
        }
      });
      const el = createComponent('<div simpleDirective><span someOtherDirective></span></div>');
      expect(el.children[0].children[0].injector.get('injectable2'))
          .toEqual('injectable1-injectable2');
    });

    it('should instantiate providers that have dependencies', () => {
      TestBed.configureTestingModule({declarations: [SimpleDirective]});
      const providers = [
        {provide: 'injectable1', useValue: 'injectable1'}, {
          provide: 'injectable2',
          useFactory: (val: any) => `${val}-injectable2`,
          deps: ['injectable1']
        }
      ];
      TestBed.overrideDirective(SimpleDirective, {add: {providers}});
      const el = createComponent('<div simpleDirective></div>');
      expect(el.children[0].injector.get('injectable2')).toEqual('injectable1-injectable2');
    });

    it('should instantiate viewProviders that have dependencies', () => {
      TestBed.configureTestingModule({declarations: [SimpleComponent]});
      const viewProviders = [
        {provide: 'injectable1', useValue: 'injectable1'}, {
          provide: 'injectable2',
          useFactory: (val: any) => `${val}-injectable2`,
          deps: ['injectable1']
        }
      ];
      TestBed.overrideComponent(SimpleComponent, {set: {viewProviders}});
      const el = createComponent('<div simpleComponent></div>');
      expect(el.children[0].injector.get('injectable2')).toEqual('injectable1-injectable2');
    });

    it('should instantiate components that depend on viewProviders providers', () => {
      TestBed.configureTestingModule({declarations: [NeedsServiceComponent]});
      TestBed.overrideComponent(
          NeedsServiceComponent, {set: {providers: [{provide: 'service', useValue: 'service'}]}});
      const el = createComponent('<div needsServiceComponent></div>');
      expect(el.children[0].injector.get(NeedsServiceComponent).service).toEqual('service');
    });

    it('should instantiate multi providers', () => {
      TestBed.configureTestingModule({declarations: [SimpleDirective]});
      const providers = [
        {provide: 'injectable1', useValue: 'injectable11', multi: true},
        {provide: 'injectable1', useValue: 'injectable12', multi: true}
      ];
      TestBed.overrideDirective(SimpleDirective, {set: {providers}});
      const el = createComponent('<div simpleDirective></div>');
      expect(el.children[0].injector.get('injectable1')).toEqual(['injectable11', 'injectable12']);
    });

    it('should instantiate providers lazily', () => {
      TestBed.configureTestingModule({declarations: [SimpleDirective]});

      let created = false;
      TestBed.overrideDirective(
          SimpleDirective,
          {set: {providers: [{provide: 'service', useFactory: () => created = true}]}});
      const el = createComponent('<div simpleDirective></div>');

      expect(created).toBe(false);

      el.children[0].injector.get('service');

      expect(created).toBe(true);
    });

    it('should provide undefined', () => {
      let factoryCounter = 0;

      const el = createComponent('', [{
                                   provide: 'token',
                                   useFactory: () => {
                                     factoryCounter++;
                                     return undefined;
                                   }
                                 }]);

      expect(el.injector.get('token')).toBeUndefined();
      expect(el.injector.get('token')).toBeUndefined();
      expect(factoryCounter).toBe(1);
    });

    describe('injecting lazy providers into an eager provider via Injector.get', () => {
      it('should inject providers that were declared before it', () => {
        @Component({
          template: '',
          providers: [
            {provide: 'lazy', useFactory: () => 'lazyValue'},
            {
              provide: 'eager',
              useFactory: (i: Injector) => `eagerValue: ${i.get('lazy')}`,
              deps: [Injector]
            },
          ]
        })
        class MyComp {
          // Component is eager, which makes all of its deps eager
          constructor(@Inject('eager') eager: any) {}
        }

        const ctx =
            TestBed.configureTestingModule({declarations: [MyComp]}).createComponent(MyComp);
        expect(ctx.debugElement.injector.get('eager')).toBe('eagerValue: lazyValue');
      });

      it('should inject providers that were declared after it', () => {
        @Component({
          template: '',
          providers: [
            {
              provide: 'eager',
              useFactory: (i: Injector) => `eagerValue: ${i.get('lazy')}`,
              deps: [Injector]
            },
            {provide: 'lazy', useFactory: () => 'lazyValue'},
          ]
        })
        class MyComp {
          // Component is eager, which makes all of its deps eager
          constructor(@Inject('eager') eager: any) {}
        }

        const ctx =
            TestBed.configureTestingModule({declarations: [MyComp]}).createComponent(MyComp);
        expect(ctx.debugElement.injector.get('eager')).toBe('eagerValue: lazyValue');
      });
    });

    describe('injecting eager providers into an eager provider via Injector.get', () => {
      it('should inject providers that were declared before it', () => {
        @Component({
          template: '',
          providers: [
            {provide: 'eager1', useFactory: () => 'v1'},
            {
              provide: 'eager2',
              useFactory: (i: Injector) => `v2: ${i.get('eager1')}`,
              deps: [Injector]
            },
          ]
        })
        class MyComp {
          // Component is eager, which makes all of its deps eager
          constructor(@Inject('eager1') eager1: any, @Inject('eager2') eager2: any) {}
        }

        const ctx =
            TestBed.configureTestingModule({declarations: [MyComp]}).createComponent(MyComp);
        expect(ctx.debugElement.injector.get('eager2')).toBe('v2: v1');
      });

      it('should inject providers that were declared after it', () => {
        @Component({
          template: '',
          providers: [
            {
              provide: 'eager1',
              useFactory: (i: Injector) => `v1: ${i.get('eager2')}`,
              deps: [Injector]
            },
            {provide: 'eager2', useFactory: () => 'v2'},
          ]
        })
        class MyComp {
          // Component is eager, which makes all of its deps eager
          constructor(@Inject('eager1') eager1: any, @Inject('eager2') eager2: any) {}
        }

        const ctx =
            TestBed.configureTestingModule({declarations: [MyComp]}).createComponent(MyComp);
        expect(ctx.debugElement.injector.get('eager1')).toBe('v1: v2');
      });
    });

    it('should allow injecting lazy providers via Injector.get from an eager provider that is declared earlier',
       () => {
         @Component({providers: [{provide: 'a', useFactory: () => 'aValue'}], template: ''})
         class SomeComponent {
           public a: string;
           constructor(injector: Injector) {
             this.a = injector.get('a');
           }
         }

         const comp = TestBed.configureTestingModule({declarations: [SomeComponent]})
                          .createComponent(SomeComponent);
         expect(comp.componentInstance.a).toBe('aValue');
       });

    it('should support ngOnDestroy for lazy providers', () => {
      let created = false;
      let destroyed = false;

      class SomeInjectable {
        constructor() {
          created = true;
        }
        ngOnDestroy() {
          destroyed = true;
        }
      }

      @Component({providers: [SomeInjectable], template: ''})
      class SomeComp {
      }

      TestBed.configureTestingModule({declarations: [SomeComp]});


      let compRef = TestBed.createComponent(SomeComp).componentRef;
      expect(created).toBe(false);
      expect(destroyed).toBe(false);

      // no error if the provider was not yet created
      compRef.destroy();
      expect(created).toBe(false);
      expect(destroyed).toBe(false);

      compRef = TestBed.createComponent(SomeComp).componentRef;
      compRef.injector.get(SomeInjectable);
      expect(created).toBe(true);
      compRef.destroy();
      expect(destroyed).toBe(true);
    });

    it('should instantiate view providers lazily', () => {
      let created = false;
      TestBed.configureTestingModule({declarations: [SimpleComponent]});
      TestBed.overrideComponent(
          SimpleComponent,
          {set: {viewProviders: [{provide: 'service', useFactory: () => created = true}]}});
      const el = createComponent('<div simpleComponent></div>');

      expect(created).toBe(false);

      el.children[0].injector.get('service');

      expect(created).toBe(true);
    });

    it('should not instantiate other directives that depend on viewProviders providers (same element)',
       () => {
         TestBed.configureTestingModule({declarations: [SimpleComponent, NeedsService]});
         TestBed.overrideComponent(
             SimpleComponent, {set: {viewProviders: [{provide: 'service', useValue: 'service'}]}});
         expect(() => createComponent('<div simpleComponent needsService></div>'))
             .toThrowError(/No provider for service!/);
       });

    it('should not instantiate other directives that depend on viewProviders providers (child element)',
       () => {
         TestBed.configureTestingModule({declarations: [SimpleComponent, NeedsService]});
         TestBed.overrideComponent(
             SimpleComponent, {set: {viewProviders: [{provide: 'service', useValue: 'service'}]}});
         expect(() => createComponent('<div simpleComponent><div needsService></div></div>'))
             .toThrowError(/No provider for service!/);
       });

    it('should instantiate directives that depend on providers of other directives', () => {
      TestBed.configureTestingModule({declarations: [SimpleDirective, NeedsService]});
      TestBed.overrideDirective(
          SimpleDirective, {set: {providers: [{provide: 'service', useValue: 'parentService'}]}});

      const el = createComponent('<div simpleDirective><div needsService></div></div>');
      expect(el.children[0].children[0].injector.get(NeedsService).service)
          .toEqual('parentService');
    });

    it('should instantiate directives that depend on providers in a parent view', () => {
      TestBed.configureTestingModule({declarations: [SimpleDirective, NeedsService]});
      TestBed.overrideDirective(
          SimpleDirective, {set: {providers: [{provide: 'service', useValue: 'parentService'}]}});
      const el = createComponent(
          '<div simpleDirective><ng-container *ngIf="true"><div *ngIf="true" needsService></div></ng-container></div>');
      expect(el.children[0].children[0].injector.get(NeedsService).service)
          .toEqual('parentService');
    });

    it('should instantiate directives that depend on providers of a component', () => {
      TestBed.configureTestingModule({declarations: [SimpleComponent, NeedsService]});
      TestBed.overrideComponent(
          SimpleComponent, {set: {providers: [{provide: 'service', useValue: 'hostService'}]}});
      TestBed.overrideComponent(SimpleComponent, {set: {template: '<div needsService></div>'}});
      const el = createComponent('<div simpleComponent></div>');
      expect(el.children[0].children[0].injector.get(NeedsService).service).toEqual('hostService');
    });

    it('should instantiate directives that depend on view providers of a component', () => {
      TestBed.configureTestingModule({declarations: [SimpleComponent, NeedsService]});
      TestBed.overrideComponent(
          SimpleComponent, {set: {providers: [{provide: 'service', useValue: 'hostService'}]}});
      TestBed.overrideComponent(SimpleComponent, {set: {template: '<div needsService></div>'}});
      const el = createComponent('<div simpleComponent></div>');
      expect(el.children[0].children[0].injector.get(NeedsService).service).toEqual('hostService');
    });

    it('should instantiate directives in a root embedded view that depend on view providers of a component',
       () => {
         TestBed.configureTestingModule({declarations: [SimpleComponent, NeedsService]});
         TestBed.overrideComponent(
             SimpleComponent, {set: {providers: [{provide: 'service', useValue: 'hostService'}]}});
         TestBed.overrideComponent(
             SimpleComponent, {set: {template: '<div *ngIf="true" needsService></div>'}});
         const el = createComponent('<div simpleComponent></div>');
         expect(el.children[0].children[0].injector.get(NeedsService).service)
             .toEqual('hostService');
       });

    it('should instantiate directives that depend on instances in the app injector', () => {
      TestBed.configureTestingModule({declarations: [NeedsAppService]});
      const el = createComponent('<div needsAppService></div>');
      expect(el.children[0].injector.get(NeedsAppService).service).toEqual('appService');
    });

    it('should not instantiate a directive with cyclic dependencies', () => {
      TestBed.configureTestingModule({declarations: [CycleDirective]});
      expect(() => createComponent('<div cycleDirective></div>'))
          .toThrowError(
              'NG0200: Circular dependency in DI detected for CycleDirective. Find more at https://angular.io/errors/NG0200');
    });

    it('should not instantiate a directive in a view that has a host dependency on providers' +
           ' of the component',
       () => {
         TestBed.configureTestingModule({declarations: [SimpleComponent, NeedsServiceFromHost]});
         TestBed.overrideComponent(
             SimpleComponent, {set: {providers: [{provide: 'service', useValue: 'hostService'}]}});
         TestBed.overrideComponent(
             SimpleComponent, {set: {template: '<div needsServiceFromHost><div>'}});

         expect(() => createComponent('<div simpleComponent></div>'))
             .toThrowError(
                 'NG0201: No provider for service found in NodeInjector. Find more at https://angular.io/errors/NG0201');
       });

    it('should not instantiate a directive in a view that has a host dependency on providers' +
           ' of a decorator directive',
       () => {
         TestBed.configureTestingModule(
             {declarations: [SimpleComponent, SomeOtherDirective, NeedsServiceFromHost]});
         TestBed.overrideComponent(
             SimpleComponent, {set: {providers: [{provide: 'service', useValue: 'hostService'}]}});
         TestBed.overrideComponent(
             SimpleComponent, {set: {template: '<div needsServiceFromHost><div>'}});

         expect(() => createComponent('<div simpleComponent someOtherDirective></div>'))
             .toThrowError(
                 'NG0201: No provider for service found in NodeInjector. Find more at https://angular.io/errors/NG0201');
       });

    it('should not instantiate a directive in a view that has a self dependency on a parent directive',
       () => {
         TestBed.configureTestingModule({declarations: [SimpleDirective, NeedsDirectiveFromSelf]});
         expect(
             () => createComponent('<div simpleDirective><div needsDirectiveFromSelf></div></div>'))
             .toThrowError(
                 'NG0201: No provider for SimpleDirective found in NodeInjector. Find more at https://angular.io/errors/NG0201');
       });

    it('should instantiate directives that depend on other directives', fakeAsync(() => {
         TestBed.configureTestingModule({declarations: [SimpleDirective, NeedsDirective]});
         const el = createComponent('<div simpleDirective><div needsDirective></div></div>');
         const d = el.children[0].children[0].injector.get(NeedsDirective);

         expect(d).toBeAnInstanceOf(NeedsDirective);
         expect(d.dependency).toBeAnInstanceOf(SimpleDirective);
       }));

    it('should throw when a dependency cannot be resolved', fakeAsync(() => {
         TestBed.configureTestingModule({declarations: [NeedsService]});

         expect(() => createComponent('<div needsService></div>'))
             .toThrowError(/No provider for service!/);
       }));

    it('should inject null when an optional dependency cannot be resolved', () => {
      TestBed.configureTestingModule({declarations: [OptionallyNeedsDirective]});
      const el = createComponent('<div optionallyNeedsDirective></div>');
      const d = el.children[0].injector.get(OptionallyNeedsDirective);
      expect(d.dependency).toBeNull();
    });

    it('should instantiate directives that depends on the host component', () => {
      TestBed.configureTestingModule({declarations: [SimpleComponent, NeedsComponentFromHost]});
      TestBed.overrideComponent(
          SimpleComponent, {set: {template: '<div needsComponentFromHost></div>'}});
      const el = createComponent('<div simpleComponent></div>');
      const d = el.children[0].children[0].injector.get(NeedsComponentFromHost);
      expect(d.dependency).toBeAnInstanceOf(SimpleComponent);
    });

    it('should not instantiate directives that depend on other directives on the host element', () => {
      TestBed.configureTestingModule(
          {declarations: [SimpleComponent, SimpleDirective, NeedsDirectiveFromHost]});
      TestBed.overrideComponent(
          SimpleComponent, {set: {template: '<div needsDirectiveFromHost></div>'}});
      expect(() => createComponent('<div simpleComponent simpleDirective></div>'))
          .toThrowError(
              'NG0201: No provider for SimpleDirective found in NodeInjector. Find more at https://angular.io/errors/NG0201');
    });

    it('should allow to use the NgModule injector from a root ViewContainerRef.parentInjector',
       () => {
         @Component({template: ''})
         class MyComp {
           constructor(public vc: ViewContainerRef) {}
         }

         const compFixture = TestBed
                                 .configureTestingModule({
                                   declarations: [MyComp],
                                   providers: [{provide: 'someToken', useValue: 'someValue'}]
                                 })
                                 .createComponent(MyComp);

         expect(compFixture.componentInstance.vc.parentInjector.get('someToken')).toBe('someValue');
       });
  });

  describe('static attributes', () => {
    it('should be injectable', () => {
      TestBed.configureTestingModule({declarations: [NeedsAttribute]});
      const el = createComponent('<div needsAttribute type="text" title></div>');
      const needsAttribute = el.children[0].injector.get(NeedsAttribute);

      expect(needsAttribute.typeAttribute).toEqual('text');
      expect(needsAttribute.titleAttribute).toEqual('');
      expect(needsAttribute.fooAttribute).toEqual(null);
    });

    it('should be injectable without type annotation', () => {
      TestBed.configureTestingModule({declarations: [NeedsAttributeNoType]});
      const el = createComponent('<div needsAttributeNoType foo="bar"></div>');
      const needsAttribute = el.children[0].injector.get(NeedsAttributeNoType);

      expect(needsAttribute.fooAttribute).toEqual('bar');
    });
  });

  describe('refs', () => {
    it('should inject ElementRef', () => {
      TestBed.configureTestingModule({declarations: [NeedsElementRef]});
      const el = createComponent('<div needsElementRef></div>');
      expect(el.children[0].injector.get(NeedsElementRef).elementRef.nativeElement)
          .toBe(el.children[0].nativeElement);
    });

    it('should inject ChangeDetectorRef of the component\'s view into the component', () => {
      TestBed.configureTestingModule({declarations: [PushComponentNeedsChangeDetectorRef]});
      const cf = createComponentFixture('<div componentNeedsChangeDetectorRef></div>');
      cf.detectChanges();
      const compEl = cf.debugElement.children[0];
      const comp = compEl.injector.get(PushComponentNeedsChangeDetectorRef);
      comp.counter = 1;
      cf.detectChanges();
      expect(compEl.nativeElement).toHaveText('0');
      comp.changeDetectorRef.markForCheck();
      cf.detectChanges();
      expect(compEl.nativeElement).toHaveText('1');
    });

    it('should inject ChangeDetectorRef of the containing component into directives', () => {
      TestBed.configureTestingModule(
          {declarations: [PushComponentNeedsChangeDetectorRef, DirectiveNeedsChangeDetectorRef]});
      TestBed.overrideComponent(PushComponentNeedsChangeDetectorRef, {
        set: {
          template:
              '{{counter}}<div directiveNeedsChangeDetectorRef></div><div *ngIf="true" directiveNeedsChangeDetectorRef></div>'
        }
      });
      const cf = createComponentFixture('<div componentNeedsChangeDetectorRef></div>');
      cf.detectChanges();
      const compEl = cf.debugElement.children[0];
      const comp: PushComponentNeedsChangeDetectorRef =
          compEl.injector.get(PushComponentNeedsChangeDetectorRef);
      comp.counter = 1;
      cf.detectChanges();
      expect(compEl.nativeElement).toHaveText('0');

      /**
       * Compares two `ChangeDetectorRef` instances. The logic depends on the engine, as the
       * implementation details of `ViewRef` vary.
       */
      function _compareChangeDetectorRefs(a: ChangeDetectorRef, b: ChangeDetectorRef) {
        expect((a as any)._lView).toEqual((b as any)._lView);
        expect((a as any).context).toEqual((b as any).context);
      }

      _compareChangeDetectorRefs(
          compEl.children[0].injector.get(DirectiveNeedsChangeDetectorRef).changeDetectorRef,
          comp.changeDetectorRef);
      _compareChangeDetectorRefs(
          compEl.children[1].injector.get(DirectiveNeedsChangeDetectorRef).changeDetectorRef,
          comp.changeDetectorRef);

      comp.changeDetectorRef.markForCheck();
      cf.detectChanges();
      expect(compEl.nativeElement).toHaveText('1');
    });

    it('should inject ChangeDetectorRef of a same element component into a directive', () => {
      TestBed.configureTestingModule(
          {declarations: [PushComponentNeedsChangeDetectorRef, DirectiveNeedsChangeDetectorRef]});
      const cf = createComponentFixture(
          '<div componentNeedsChangeDetectorRef directiveNeedsChangeDetectorRef></div>');
      cf.detectChanges();
      const compEl = cf.debugElement.children[0];
      const comp = compEl.injector.get(PushComponentNeedsChangeDetectorRef);
      const dir = compEl.injector.get(DirectiveNeedsChangeDetectorRef);
      comp.counter = 1;
      cf.detectChanges();
      expect(compEl.nativeElement).toHaveText('0');
      dir.changeDetectorRef.markForCheck();
      cf.detectChanges();
      expect(compEl.nativeElement).toHaveText('1');
    });

    it(`should not inject ChangeDetectorRef of a parent element's component into a directive`, () => {
      TestBed
          .configureTestingModule({
            declarations: [PushComponentNeedsChangeDetectorRef, DirectiveNeedsChangeDetectorRef]
          })
          .overrideComponent(
              PushComponentNeedsChangeDetectorRef,
              {set: {template: '<ng-content></ng-content>{{counter}}'}});
      const cf = createComponentFixture(
          '<div componentNeedsChangeDetectorRef><div directiveNeedsChangeDetectorRef></div></div>');
      cf.detectChanges();
      const compEl = cf.debugElement.children[0];
      const comp = compEl.injector.get(PushComponentNeedsChangeDetectorRef);
      const dirEl = compEl.children[0];
      const dir = dirEl.injector.get(DirectiveNeedsChangeDetectorRef);
      comp.counter = 1;
      cf.detectChanges();
      expect(compEl.nativeElement).toHaveText('0');
      dir.changeDetectorRef.markForCheck();
      cf.detectChanges();
      expect(compEl.nativeElement).toHaveText('0');
    });

    it('should inject ViewContainerRef', () => {
      TestBed.configureTestingModule({declarations: [NeedsViewContainerRef]});
      const el = createComponent('<div needsViewContainerRef></div>');
      expect(el.children[0].injector.get(NeedsViewContainerRef).viewContainer.element.nativeElement)
          .toBe(el.children[0].nativeElement);
    });

    it('should inject ViewContainerRef', () => {
      @Component({template: ''})
      class TestComp {
        constructor(public vcr: ViewContainerRef) {}
      }

      TestBed.configureTestingModule({declarations: [TestComp]});
      const environmentInjector = createEnvironmentInjector(
          [{provide: 'someToken', useValue: 'someNewValue'}], TestBed.inject(EnvironmentInjector));

      const component = coreCreateComponent(TestComp, {environmentInjector});
      expect(component.instance.vcr.parentInjector.get('someToken')).toBe('someNewValue');
    });

    it('should inject TemplateRef', () => {
      TestBed.configureTestingModule({declarations: [NeedsViewContainerRef, NeedsTemplateRef]});
      const el =
          createComponent('<ng-template needsViewContainerRef needsTemplateRef></ng-template>');
      expect(el.childNodes[0].injector.get(NeedsTemplateRef).templateRef.elementRef)
          .toEqual(el.childNodes[0].injector.get(NeedsViewContainerRef).viewContainer.element);
    });

    it('should throw if there is no TemplateRef', () => {
      TestBed.configureTestingModule({declarations: [NeedsTemplateRef]});
      expect(() => createComponent('<div needsTemplateRef></div>'))
          .toThrowError(/No provider for TemplateRef/);
    });

    it('should inject null if there is no TemplateRef when the dependency is optional', () => {
      TestBed.configureTestingModule({declarations: [OptionallyNeedsTemplateRef]});
      const el = createComponent('<div optionallyNeedsTemplateRef></div>');
      const instance = el.children[0].injector.get(OptionallyNeedsTemplateRef);
      expect(instance.templateRef).toBeNull();
    });
  });

  describe('pipes', () => {
    it('should instantiate pipes that have dependencies', () => {
      TestBed.configureTestingModule({declarations: [SimpleDirective, PipeNeedsService]});

      const el = createComponent(
          '<div [simpleDirective]="true | pipeNeedsService"></div>',
          [{provide: 'service', useValue: 'pipeService'}]);
      expect(el.children[0].injector.get(SimpleDirective).value.service).toEqual('pipeService');
    });

    it('should overwrite pipes with later entry in the pipes array', () => {
      TestBed.configureTestingModule(
          {declarations: [SimpleDirective, DuplicatePipe1, DuplicatePipe2]});
      const el = createComponent('<div [simpleDirective]="true | duplicatePipe"></div>');
      expect(el.children[0].injector.get(SimpleDirective).value).toBeAnInstanceOf(DuplicatePipe2);
    });

    it('should inject ChangeDetectorRef into pipes', () => {
      TestBed.configureTestingModule({
        declarations: [SimpleDirective, PipeNeedsChangeDetectorRef, DirectiveNeedsChangeDetectorRef]
      });
      const el = createComponent(
          '<div [simpleDirective]="true | pipeNeedsChangeDetectorRef" directiveNeedsChangeDetectorRef></div>');
      const cdRef = el.children[0].injector.get(DirectiveNeedsChangeDetectorRef).changeDetectorRef;
      expect(el.children[0].injector.get(SimpleDirective).value.changeDetectorRef).toEqual(cdRef);
    });

    it('should not cache impure pipes', () => {
      TestBed.configureTestingModule({declarations: [SimpleDirective, ImpurePipe]});
      const el = createComponent(
          '<div [simpleDirective]="true | impurePipe"></div><div [simpleDirective]="true | impurePipe"></div>' +
          '<div *ngFor="let x of [1,2]" [simpleDirective]="true | impurePipe"></div>');
      const impurePipe1 = el.children[0].injector.get(SimpleDirective).value;
      const impurePipe2 = el.children[1].injector.get(SimpleDirective).value;
      const impurePipe3 = el.children[2].injector.get(SimpleDirective).value;
      const impurePipe4 = el.children[3].injector.get(SimpleDirective).value;
      expect(impurePipe1).toBeAnInstanceOf(ImpurePipe);
      expect(impurePipe2).toBeAnInstanceOf(ImpurePipe);
      expect(impurePipe2).not.toBe(impurePipe1);
      expect(impurePipe3).toBeAnInstanceOf(ImpurePipe);
      expect(impurePipe3).not.toBe(impurePipe1);
      expect(impurePipe4).toBeAnInstanceOf(ImpurePipe);
      expect(impurePipe4).not.toBe(impurePipe1);
    });
  });

  describe('view destruction', () => {
    @Component({selector: 'some-component', template: ''})
    class SomeComponent {
    }

    @Component({selector: 'listener-and-on-destroy', template: ''})
    class ComponentThatLoadsAnotherComponentThenMovesIt {
      constructor(private viewContainerRef: ViewContainerRef) {}

      ngOnInit() {
        // Dynamically load some component.
        const componentRef = this.viewContainerRef.createComponent(
            SomeComponent, {index: this.viewContainerRef.length});

        // Manually move the loaded component to some arbitrary DOM node.
        const componentRootNode =
            (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
        document.createElement('div').appendChild(componentRootNode);

        // Destroy the component we just moved to ensure that it does not error during
        // destruction.
        componentRef.destroy();
      }
    }

    it('should not error when destroying a component that has been moved in the DOM', () => {
      TestBed.configureTestingModule({
        declarations: [ComponentThatLoadsAnotherComponentThenMovesIt, SomeComponent],
      });
      const fixture = createComponentFixture(`<listener-and-on-destroy></listener-and-on-destroy>`);
      fixture.detectChanges();

      // This test will fail if the ngOnInit of ComponentThatLoadsAnotherComponentThenMovesIt
      // throws an error.
    });
  });
});

class TestValue {
  constructor(public value: string) {}
}
