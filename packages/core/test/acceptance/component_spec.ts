/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT} from '@angular/common';
import {ApplicationRef, Component, ComponentFactoryResolver, ComponentRef, ElementRef, InjectionToken, Injector, Input, NgModule, OnDestroy, Renderer2, RendererFactory2, Type, ViewChild, ViewContainerRef, ViewEncapsulation, ɵsetDocument} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {ɵDomRendererFactory2 as DomRendererFactory2} from '@angular/platform-browser';
import {expect} from '@angular/platform-browser/testing/src/matchers';
import {ivyEnabled, onlyInIvy} from '@angular/private/testing';

import {domRendererFactory3} from '../../src/render3/interfaces/renderer';
import {global} from '../../src/util/global';


describe('component', () => {
  describe('view destruction', () => {
    it('should invoke onDestroy only once when a component is registered as a provider', () => {
      const testToken = new InjectionToken<ParentWithOnDestroy>('testToken');
      let destroyCalls = 0;

      @Component({
        selector: 'comp-with-on-destroy',
        template: '',
        providers: [{provide: testToken, useExisting: ParentWithOnDestroy}]
      })
      class ParentWithOnDestroy {
        ngOnDestroy() {
          destroyCalls++;
        }
      }

      @Component({selector: 'child', template: ''})
      class ChildComponent {
        // We need to inject the parent so the provider is instantiated.
        constructor(_parent: ParentWithOnDestroy) {}
      }

      @Component({
        template: `
          <comp-with-on-destroy>
            <child></child>
          </comp-with-on-destroy>
        `
      })
      class App {
      }

      TestBed.configureTestingModule({declarations: [App, ParentWithOnDestroy, ChildComponent]});
      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();
      fixture.destroy();

      expect(destroyCalls).toBe(1, 'Expected `ngOnDestroy` to only be called once.');
    });
  });

  it('should support entry components from another module', () => {
    @Component({selector: 'other-component', template: `bar`})
    class OtherComponent {
    }

    @NgModule({
      declarations: [OtherComponent],
      exports: [OtherComponent],
      entryComponents: [OtherComponent]
    })
    class OtherModule {
    }

    @Component({
      selector: 'test_component',
      template: `foo|<ng-template #vc></ng-template>`,
      entryComponents: [OtherComponent]
    })
    class TestComponent {
      @ViewChild('vc', {read: ViewContainerRef, static: true}) vcref!: ViewContainerRef;

      constructor(private _cfr: ComponentFactoryResolver) {}

      createComponentView<T>(cmptType: Type<T>): ComponentRef<T> {
        const cf = this._cfr.resolveComponentFactory(cmptType);
        return this.vcref.createComponent(cf);
      }
    }

    TestBed.configureTestingModule({declarations: [TestComponent], imports: [OtherModule]});
    const fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();

    fixture.componentInstance.createComponentView(OtherComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement).toHaveText('foo|bar');
  });

  it('should be able to dynamically insert a component into a view container at the root of a component',
     () => {
       @Component({template: 'hello'})
       class HelloComponent {
       }

       // TODO: This module is only used to declare the `entryComponets` since
       //  `configureTestingModule` doesn't support it. The module can be removed
       // once ViewEngine is removed.
       @NgModule({
         declarations: [HelloComponent],
         exports: [HelloComponent],
         entryComponents: [HelloComponent]
       })
       class HelloModule {
       }

       @Component({selector: 'wrapper', template: '<ng-content></ng-content>'})
       class Wrapper {
       }

       @Component({
         template: `
            <wrapper>
              <div #insertionPoint></div>
            </wrapper>
          `
       })
       class App {
         @ViewChild('insertionPoint', {read: ViewContainerRef}) viewContainerRef!: ViewContainerRef;
         constructor(public componentFactoryResolver: ComponentFactoryResolver) {}
       }

       TestBed.configureTestingModule({declarations: [App, Wrapper], imports: [HelloModule]});
       const fixture = TestBed.createComponent(App);
       fixture.detectChanges();

       const instance = fixture.componentInstance;
       const factory = instance.componentFactoryResolver.resolveComponentFactory(HelloComponent);
       instance.viewContainerRef.createComponent(factory);

       expect(fixture.nativeElement.textContent.trim()).toBe('hello');
     });

  // TODO: add tests with Native once tests run in real browser (domino doesn't support shadow root)
  describe('encapsulation', () => {
    @Component({
      selector: 'wrapper',
      encapsulation: ViewEncapsulation.None,
      template: `<encapsulated></encapsulated>`
    })
    class WrapperComponent {
    }

    @Component({
      selector: 'encapsulated',
      encapsulation: ViewEncapsulation.Emulated,
      // styles array must contain a value (even empty) to trigger `ViewEncapsulation.Emulated`
      styles: [``],
      template: `foo<leaf></leaf>`
    })
    class EncapsulatedComponent {
    }

    @Component(
        {selector: 'leaf', encapsulation: ViewEncapsulation.None, template: `<span>bar</span>`})
    class LeafComponent {
    }

    beforeEach(() => {
      TestBed.configureTestingModule(
          {declarations: [WrapperComponent, EncapsulatedComponent, LeafComponent]});
    });

    it('should encapsulate children, but not host nor grand children', () => {
      const fixture = TestBed.createComponent(WrapperComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML)
          .toMatch(
              /<encapsulated _nghost-[a-z\-]+(\d+)="">foo<leaf _ngcontent-[a-z\-]+\1=""><span>bar<\/span><\/leaf><\/encapsulated>/);
    });

    it('should encapsulate host', () => {
      const fixture = TestBed.createComponent(EncapsulatedComponent);
      fixture.detectChanges();
      const html = fixture.nativeElement.outerHTML;
      const match = html.match(/_nghost-([a-z\-]+\d+)/);
      expect(match).toBeDefined();
      expect(html).toMatch(new RegExp(`<leaf _ngcontent-${match[1]}=""><span>bar</span></leaf>`));
    });

    it('should encapsulate host and children with different attributes', () => {
      // styles array must contain a value (even empty) to trigger `ViewEncapsulation.Emulated`
      TestBed.overrideComponent(
          LeafComponent, {set: {encapsulation: ViewEncapsulation.Emulated, styles: [``]}});
      const fixture = TestBed.createComponent(EncapsulatedComponent);
      fixture.detectChanges();
      const html = fixture.nativeElement.outerHTML;
      const match = html.match(/_nghost-([a-z\-]+\d+)/g);
      expect(match).toBeDefined();
      expect(match.length).toEqual(2);
      expect(html).toMatch(
          `<leaf ${match[0].replace('_nghost', '_ngcontent')}="" ${match[1]}=""><span ${
              match[1].replace('_nghost', '_ngcontent')}="">bar</span></leaf></div>`);
    });
  });

  describe('view destruction', () => {
    it('should invoke onDestroy when directly destroying a root view', () => {
      let wasOnDestroyCalled = false;

      @Component({selector: 'comp-with-destroy', template: ``})
      class ComponentWithOnDestroy implements OnDestroy {
        ngOnDestroy() {
          wasOnDestroyCalled = true;
        }
      }

      // This test asserts that the view tree is set up correctly based on the knowledge that this
      // tree is used during view destruction. If the child view is not correctly attached as a
      // child of the root view, then the onDestroy hook on the child view will never be called
      // when the view tree is torn down following the destruction of that root view.
      @Component({selector: `test-app`, template: `<comp-with-destroy></comp-with-destroy>`})
      class TestApp {
      }

      TestBed.configureTestingModule({declarations: [ComponentWithOnDestroy, TestApp]});
      const fixture = TestBed.createComponent(TestApp);
      fixture.detectChanges();
      fixture.destroy();
      expect(wasOnDestroyCalled)
          .toBe(
              true,
              'Expected component onDestroy method to be called when its parent view is destroyed');
    });
  });

  it('should clear the contents of dynamically created component when it\'s attached to ApplicationRef',
     () => {
       let wasOnDestroyCalled = false;
       @Component({
         selector: '[comp]',
         template: 'comp content',
       })
       class DynamicComponent {
         ngOnDestroy() {
           wasOnDestroyCalled = true;
         }
       }

       @NgModule({
         declarations: [DynamicComponent],
         entryComponents: [DynamicComponent],  // needed only for ViewEngine
       })
       class TestModule {
       }

       @Component({
         selector: 'button',
         template: `
           <div class="wrapper"></div>
           <div id="app-root"></div>
           <div class="wrapper"></div>
         `,
       })
       class App {
         componentRef!: ComponentRef<DynamicComponent>;

         constructor(
             private cfr: ComponentFactoryResolver, private injector: Injector,
             private appRef: ApplicationRef) {}

         create() {
           const factory = this.cfr.resolveComponentFactory(DynamicComponent);
           // Component to be bootstrapped into an element with the `app-root` id.
           this.componentRef = factory.create(this.injector, undefined, '#app-root');
           this.appRef.attachView(this.componentRef.hostView);
         }

         destroy() {
           this.componentRef.destroy();
         }
       }

       TestBed.configureTestingModule({imports: [TestModule], declarations: [App]});
       const fixture = TestBed.createComponent(App);
       fixture.detectChanges();

       let appRootEl = fixture.nativeElement.querySelector('#app-root');
       expect(appRootEl).toBeDefined();
       expect(appRootEl.innerHTML).toBe('');  // app container content is empty

       fixture.componentInstance.create();

       appRootEl = fixture.nativeElement.querySelector('#app-root');
       expect(appRootEl).toBeDefined();
       expect(appRootEl.innerHTML).toBe('comp content');

       fixture.componentInstance.destroy();
       fixture.detectChanges();

       appRootEl = fixture.nativeElement.querySelector('#app-root');
       expect(appRootEl).toBeFalsy();  // host element is removed
       const wrapperEls = fixture.nativeElement.querySelectorAll('.wrapper');
       expect(wrapperEls.length).toBe(2);  // other elements are preserved
     });

  describe('with ngDevMode', () => {
    const _global: {ngDevMode: any} = global;
    let saveNgDevMode!: typeof ngDevMode;
    beforeEach(() => saveNgDevMode = ngDevMode);
    afterEach(() => _global.ngDevMode = saveNgDevMode);
    // In dev mode we have some additional logic to freeze `TView.cleanup` array
    // (see `storeCleanupWithContext` function).
    // The tests below verify that this action doesn't trigger any change in behaviour
    // for prod mode. See https://github.com/angular/angular/issues/40105.
    ['ngDevMode off', 'ngDevMode on'].forEach((mode) => {
      it('should invoke `onDestroy` callbacks of dynamically created component with ' + mode,
         () => {
           if (mode === 'ngDevMode off') {
             _global.ngDevMode = false;
           }
           let wasOnDestroyCalled = false;
           @Component({
             selector: '[comp]',
             template: 'comp content',
           })
           class DynamicComponent {
           }

           @NgModule({
             declarations: [DynamicComponent],
             entryComponents: [DynamicComponent],  // needed only for ViewEngine
           })
           class TestModule {
           }

           @Component({
             selector: 'button',
             template: '<div id="app-root" #anchor></div>',
           })
           class App {
             @ViewChild('anchor', {read: ViewContainerRef}) anchor!: ViewContainerRef;

             constructor(private cfr: ComponentFactoryResolver, private injector: Injector) {}

             create() {
               const factory = this.cfr.resolveComponentFactory(DynamicComponent);
               const componentRef = factory.create(this.injector);
               componentRef.onDestroy(() => {
                 wasOnDestroyCalled = true;
               });
               this.anchor.insert(componentRef.hostView);
             }

             clear() {
               this.anchor.clear();
             }
           }

           TestBed.configureTestingModule({imports: [TestModule], declarations: [App]});
           const fixture = TestBed.createComponent(App);
           fixture.detectChanges();

           // Add ComponentRef to ViewContainerRef instance.
           fixture.componentInstance.create();
           // Clear ViewContainerRef to invoke `onDestroy` callbacks on ComponentRef.
           fixture.componentInstance.clear();

           expect(wasOnDestroyCalled).toBeTrue();
         });
    });
  });

  describe('invalid host element', () => {
    it('should throw when <ng-container> is used as a host element for a Component', () => {
      @Component({
        selector: 'ng-container',
        template: '...',
      })
      class Comp {
      }

      @Component({
        selector: 'root',
        template: '<ng-container></ng-container>',
      })
      class App {
      }

      TestBed.configureTestingModule({declarations: [App, Comp]});
      if (ivyEnabled) {
        expect(() => TestBed.createComponent(App))
            .toThrowError(
                /"ng-container" tags cannot be used as component hosts. Please use a different tag to activate the Comp component/);
      } else {
        // In VE there is no special check for the case when `<ng-container>` is used as a host
        // element for a Component. VE tries to attach Component's content to a Comment node that
        // represents the `<ng-container>` location and this call fails with a
        // browser/environment-specific error message, so we just verify that this scenario is
        // triggering an error in VE.
        expect(() => TestBed.createComponent(App)).toThrow();
      }
    });

    it('should throw when <ng-template> is used as a host element for a Component', () => {
      @Component({
        selector: 'ng-template',
        template: '...',
      })
      class Comp {
      }

      @Component({
        selector: 'root',
        template: '<ng-template></ng-template>',
      })
      class App {
      }

      TestBed.configureTestingModule({declarations: [App, Comp]});
      if (ivyEnabled) {
        expect(() => TestBed.createComponent(App))
            .toThrowError(
                /"ng-template" tags cannot be used as component hosts. Please use a different tag to activate the Comp component/);
      } else {
        expect(() => TestBed.createComponent(App))
            .toThrowError(
                /Components on an embedded template: Comp \("\[ERROR ->\]<ng-template><\/ng-template>"\)/);
      }
    });
  });

  it('should use a new ngcontent attribute for child elements created w/ Renderer2', () => {
    @Component({
      selector: 'app-root',
      template: '<parent-comp></parent-comp>',
      styles: [':host { color: red; }'],  // `styles` must exist for encapsulation to apply.
      encapsulation: ViewEncapsulation.Emulated,
    })
    class AppRoot {
    }

    @Component({
      selector: 'parent-comp',
      template: '',
      styles: [':host { color: orange; }'],  // `styles` must exist for encapsulation to apply.
      encapsulation: ViewEncapsulation.Emulated,
    })
    class ParentComponent {
      constructor(elementRef: ElementRef, renderer: Renderer2) {
        const elementFromRenderer = renderer.createElement('p');
        renderer.appendChild(elementRef.nativeElement, elementFromRenderer);
      }
    }

    TestBed.configureTestingModule({declarations: [AppRoot, ParentComponent]});
    const fixture = TestBed.createComponent(AppRoot);
    fixture.detectChanges();

    const secondParentEl: HTMLElement = fixture.nativeElement.querySelector('parent-comp');
    const elementFromRenderer: HTMLElement = fixture.nativeElement.querySelector('p');
    const getNgContentAttr = (element: HTMLElement) => {
      return Array.from(element.attributes).map(a => a.name).find(a => /ngcontent/.test(a));
    };

    const hostNgContentAttr = getNgContentAttr(secondParentEl);
    const viewNgContentAttr = getNgContentAttr(elementFromRenderer);

    expect(hostNgContentAttr)
        .not.toBe(
            viewNgContentAttr,
            'Expected child manually created via Renderer2 to have a different view encapsulation' +
                'attribute than its host element');
  });

  it('should create a new Renderer2 for each component', () => {
    @Component({
      selector: 'child',
      template: '',
      styles: [':host { color: red; }'],
      encapsulation: ViewEncapsulation.Emulated,
    })
    class Child {
      constructor(public renderer: Renderer2) {}
    }

    @Component({
      template: '<child></child>',
      styles: [':host { color: orange; }'],
      encapsulation: ViewEncapsulation.Emulated,
    })
    class Parent {
      @ViewChild(Child) childInstance!: Child;
      constructor(public renderer: Renderer2) {}
    }

    TestBed.configureTestingModule({declarations: [Parent, Child]});
    const fixture = TestBed.createComponent(Parent);
    const componentInstance = fixture.componentInstance;
    fixture.detectChanges();

    // Assert like this, rather than `.not.toBe` so we get a better failure message.
    expect(componentInstance.renderer !== componentInstance.childInstance.renderer)
        .toBe(true, 'Expected renderers to be different.');
  });

  it('components should not share the same context when creating with a root element', () => {
    const log: string[] = [];
    @Component({
      selector: 'comp-a',
      template: '<div>{{ a }}</div>',
    })
    class CompA {
      @Input() a: string = '';
      ngDoCheck() {
        log.push('CompA:ngDoCheck');
      }
    }

    @Component({
      selector: 'comp-b',
      template: '<div>{{ b }}</div>',
    })
    class CompB {
      @Input() b: string = '';
      ngDoCheck() {
        log.push('CompB:ngDoCheck');
      }
    }

    @Component({template: `<span></span>`})
    class MyCompA {
      constructor(
          private _componentFactoryResolver: ComponentFactoryResolver,
          private _injector: Injector) {}

      createComponent() {
        const componentFactoryA = this._componentFactoryResolver.resolveComponentFactory(CompA);
        const compRefA =
            componentFactoryA.create(this._injector, [], document.createElement('div'));
        return compRefA;
      }
    }

    @Component({template: `<span></span>`})
    class MyCompB {
      constructor(private cfr: ComponentFactoryResolver, private injector: Injector) {}

      createComponent() {
        const componentFactoryB = this.cfr.resolveComponentFactory(CompB);
        const compRefB = componentFactoryB.create(this.injector, [], document.createElement('div'));
        return compRefB;
      }
    }

    @NgModule({
      declarations: [CompA],
      entryComponents: [CompA],
    })
    class MyModuleA {
    }

    @NgModule({
      declarations: [CompB],
      entryComponents: [CompB],
    })
    class MyModuleB {
    }

    TestBed.configureTestingModule({
      declarations: [MyCompA, MyCompB],
      imports: [MyModuleA, MyModuleB],
    });
    const fixtureA = TestBed.createComponent(MyCompA);
    fixtureA.detectChanges();
    const compA = fixtureA.componentInstance.createComponent();
    compA.instance.a = 'a';
    compA.changeDetectorRef.detectChanges();

    expect(log).toEqual(['CompA:ngDoCheck']);

    log.length = 0;  // reset the log

    const fixtureB = TestBed.createComponent(MyCompB);
    fixtureB.detectChanges();
    const compB = fixtureB.componentInstance.createComponent();
    compB.instance.b = 'b';
    compB.changeDetectorRef.detectChanges();

    expect(log).toEqual(['CompB:ngDoCheck']);
  });

  it('should preserve simple component selector in a component factory', () => {
    @Component({selector: '[foo]', template: ''})
    class AttSelectorCmp {
    }

    @NgModule({
      declarations: [AttSelectorCmp],
      entryComponents: [AttSelectorCmp],
    })
    class AppModule {
    }

    TestBed.configureTestingModule({imports: [AppModule]});
    const cmpFactoryResolver = TestBed.inject(ComponentFactoryResolver);
    const cmpFactory = cmpFactoryResolver.resolveComponentFactory(AttSelectorCmp);

    expect(cmpFactory.selector).toBe('[foo]');
  });

  it('should preserve complex component selector in a component factory', () => {
    @Component({selector: '[foo],div:not(.bar)', template: ''})
    class ComplexSelectorCmp {
    }

    @NgModule({
      declarations: [ComplexSelectorCmp],
      entryComponents: [ComplexSelectorCmp],
    })
    class AppModule {
    }

    TestBed.configureTestingModule({imports: [AppModule]});
    const cmpFactoryResolver = TestBed.inject(ComponentFactoryResolver);
    const cmpFactory = cmpFactoryResolver.resolveComponentFactory(ComplexSelectorCmp);

    expect(cmpFactory.selector).toBe('[foo],div:not(.bar)');
  });

  describe('should clear host element if provided in ComponentFactory.create', () => {
    function runTestWithRenderer(rendererProviders: any[]) {
      @Component({
        selector: 'dynamic-comp',
        template: 'DynamicComponent Content',
      })
      class DynamicComponent {
      }

      @Component({
        selector: 'app',
        template: `
          <div id="dynamic-comp-root-a">
            Existing content in slot A, which <b><i>includes</i> some HTML elements</b>.
          </div>
          <div id="dynamic-comp-root-b">
            <p>
              Existing content in slot B, which includes some HTML elements.
            </p>
          </div>
        `,
      })
      class App {
        constructor(public injector: Injector, public cfr: ComponentFactoryResolver) {}

        createDynamicComponent(target: any) {
          const dynamicCompFactory = this.cfr.resolveComponentFactory(DynamicComponent);
          dynamicCompFactory.create(this.injector, [], target);
        }
      }

      // View Engine requires DynamicComponent to be in entryComponents.
      @NgModule({
        declarations: [App, DynamicComponent],
        entryComponents: [App, DynamicComponent],
      })
      class AppModule {
      }

      function _document(): any {
        // Tell Ivy about the global document
        ɵsetDocument(document);
        return document;
      }

      TestBed.configureTestingModule({
        imports: [AppModule],
        providers: [
          {provide: DOCUMENT, useFactory: _document, deps: []},
          rendererProviders,
        ],
      });

      const fixture = TestBed.createComponent(App);
      fixture.detectChanges();

      // Create an instance of DynamicComponent and provide host element *reference*
      let targetEl = document.getElementById('dynamic-comp-root-a')!;
      fixture.componentInstance.createDynamicComponent(targetEl);
      fixture.detectChanges();
      expect(targetEl.innerHTML).not.toContain('Existing content in slot A');
      expect(targetEl.innerHTML).toContain('DynamicComponent Content');

      // Create an instance of DynamicComponent and provide host element *selector*
      targetEl = document.getElementById('dynamic-comp-root-b')!;
      fixture.componentInstance.createDynamicComponent('#dynamic-comp-root-b');
      fixture.detectChanges();
      expect(targetEl.innerHTML).not.toContain('Existing content in slot B');
      expect(targetEl.innerHTML).toContain('DynamicComponent Content');
    }

    it('with Renderer2',
       () => runTestWithRenderer([{provide: RendererFactory2, useClass: DomRendererFactory2}]));

    onlyInIvy('Renderer3 is supported only in Ivy')
        .it('with Renderer3',
            () =>
                runTestWithRenderer([{provide: RendererFactory2, useValue: domRendererFactory3}]));
  });
});
