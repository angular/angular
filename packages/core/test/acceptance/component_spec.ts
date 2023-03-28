/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT} from '@angular/common';
import {ApplicationRef, Component, ComponentRef, createComponent, createEnvironmentInjector, Directive, ElementRef, EmbeddedViewRef, EnvironmentInjector, inject, Injectable, InjectionToken, Injector, Input, NgModule, OnDestroy, reflectComponentType, Renderer2, Type, ViewChild, ViewContainerRef, ViewEncapsulation, ɵsetDocument} from '@angular/core';
import {stringifyForError} from '@angular/core/src/render3/util/stringify_utils';
import {TestBed} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';

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

  it('should be able to dynamically insert a component into a view container at the root of a component',
     () => {
       @Component({template: 'hello'})
       class HelloComponent {
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
       }

       TestBed.configureTestingModule({declarations: [App, Wrapper, HelloComponent]});
       const fixture = TestBed.createComponent(App);
       fixture.detectChanges();

       const instance = fixture.componentInstance;
       instance.viewContainerRef.createComponent(HelloComponent);

       expect(fixture.nativeElement.textContent.trim()).toBe('hello');
     });

  it('should not throw when calling `detectChanges` on the ChangeDetectorRef of a destroyed view',
     () => {
       @Component({template: 'hello'})
       class HelloComponent {
       }

       @Component({template: `<div #insertionPoint></div>`})
       class App {
         @ViewChild('insertionPoint', {read: ViewContainerRef}) viewContainerRef!: ViewContainerRef;
       }

       TestBed.configureTestingModule({declarations: [App, HelloComponent]});
       const fixture = TestBed.createComponent(App);
       fixture.detectChanges();

       const componentRef =
           fixture.componentInstance.viewContainerRef.createComponent(HelloComponent);
       fixture.detectChanges();

       expect(() => {
         componentRef.destroy();
         componentRef.changeDetectorRef.detectChanges();
       }).not.toThrow();
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
             private injector: EnvironmentInjector, private appRef: ApplicationRef,
             private elementRef: ElementRef) {}

         create() {
           // Component to be bootstrapped into an element with the `app-root` id.
           this.componentRef = createComponent(DynamicComponent, {
             environmentInjector: this.injector,
             hostElement: this.elementRef.nativeElement.querySelector('#app-root')!
           });
           this.appRef.attachView(this.componentRef.hostView);
         }

         destroy() {
           this.componentRef.destroy();
         }
       }

       TestBed.configureTestingModule({declarations: [App, DynamicComponent]});
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

           @Component({
             selector: 'button',
             template: '<div id="app-root" #anchor></div>',
           })
           class App {
             @ViewChild('anchor', {read: ViewContainerRef}) anchor!: ViewContainerRef;

             constructor(private vcr: ViewContainerRef, private injector: Injector) {}

             create() {
               const componentRef =
                   this.vcr.createComponent(DynamicComponent, {injector: this.injector});
               componentRef.onDestroy(() => {
                 wasOnDestroyCalled = true;
               });
               this.anchor.insert(componentRef.hostView);
             }

             clear() {
               this.anchor.clear();
             }
           }

           TestBed.configureTestingModule({declarations: [App, DynamicComponent]});
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
      expect(() => TestBed.createComponent(App))
          .toThrowError(
              /"ng-container" tags cannot be used as component hosts. Please use a different tag to activate the Comp component/);
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
      expect(() => TestBed.createComponent(App))
          .toThrowError(
              /"ng-template" tags cannot be used as component hosts. Please use a different tag to activate the Comp component/);
    });

    it('should throw when multiple components match the same element', () => {
      @Component({
        selector: 'comp',
        template: '...',
      })
      class CompA {
      }

      @Component({
        selector: 'comp',
        template: '...',
      })
      class CompB {
      }

      @Component({
        template: '<comp></comp>',
      })
      class App {
      }

      TestBed.configureTestingModule({declarations: [App, CompA, CompB]});
      expect(() => TestBed.createComponent(App))
          .toThrowError(
              /NG0300: Multiple components match node with tagname comp: CompA and CompB/);
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
      constructor(private _injector: EnvironmentInjector) {}

      createComponent() {
        return createComponent(
            CompA,
            {environmentInjector: this._injector, hostElement: document.createElement('div')});
      }
    }

    @Component({template: `<span></span>`})
    class MyCompB {
      constructor(private envInjector: EnvironmentInjector) {}

      createComponent() {
        return createComponent(
            CompB,
            {environmentInjector: this.envInjector, hostElement: document.createElement('div')});
      }
    }

    @NgModule({declarations: [CompA]})
    class MyModuleA {
    }

    @NgModule({declarations: [CompB]})
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

    const selector = reflectComponentType(AttSelectorCmp)?.selector;

    expect(selector).toBe('[foo]');
  });

  it('should preserve complex component selector in a component factory', () => {
    @Component({selector: '[foo],div:not(.bar)', template: ''})
    class ComplexSelectorCmp {
    }

    const selector = reflectComponentType(ComplexSelectorCmp)?.selector;

    expect(selector).toBe('[foo],div:not(.bar)');
  });

  it('should clear host element if provided in ComponentFactory.create', () => {
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
      constructor(public injector: EnvironmentInjector) {}

      createDynamicComponent(target: any) {
        createComponent(
            DynamicComponent, {hostElement: target, environmentInjector: this.injector});
      }
    }

    function _document(): any {
      // Tell Ivy about the global document
      ɵsetDocument(document);
      return document;
    }

    TestBed.configureTestingModule({
      declarations: [App, DynamicComponent],
      providers: [
        {provide: DOCUMENT, useFactory: _document, deps: []},
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
  });

  describe('createComponent', () => {
    it('should create an instance of a standalone component', () => {
      @Component({
        standalone: true,
        template: 'Hello {{ name }}!',
      })
      class StandaloneComponent {
        name = 'Angular';
      }

      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const componentRef = createComponent(StandaloneComponent, {hostElement, environmentInjector});

      componentRef.changeDetectorRef.detectChanges();
      expect(hostElement.textContent).toBe('Hello Angular!');

      // Verify basic change detection works.
      componentRef.instance.name = 'ZoneJS';
      componentRef.changeDetectorRef.detectChanges();
      expect(hostElement.textContent).toBe('Hello ZoneJS!');
    });

    it('should create an instance of an NgModule-based component', () => {
      @Component({
        template: 'Hello {{ name }}!',
      })
      class NgModuleBasedComponent {
        name = 'Angular';
      }

      @NgModule({
        declarations: [NgModuleBasedComponent],
      })
      class AppModule {
      }

      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const componentRef =
          createComponent(NgModuleBasedComponent, {hostElement, environmentInjector});

      componentRef.changeDetectorRef.detectChanges();
      expect(hostElement.textContent).toBe('Hello Angular!');

      // Verify basic change detection works.
      componentRef.instance.name = 'ZoneJS';
      componentRef.changeDetectorRef.detectChanges();
      expect(hostElement.textContent).toBe('Hello ZoneJS!');
    });

    it('should render projected content', () => {
      @Component({
        standalone: true,
        template: `
          <ng-content></ng-content>|
          <ng-content></ng-content>|
          <ng-content></ng-content>
        `,
      })
      class StandaloneComponent {
      }

      // Helper method to create a `<p>` element
      const p = (content: string): Element => {
        const element = document.createElement('p');
        element.innerHTML = content;
        return element;
      };
      const hostElement = document.createElement('div');
      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const projectableNodes = [[p('1')], [p('2')], [p('3')]];
      const componentRef = createComponent(
          StandaloneComponent, {hostElement, environmentInjector, projectableNodes});

      componentRef.changeDetectorRef.detectChanges();
      expect(hostElement.innerHTML.replace(/\s*/g, '')).toBe('<p>1</p>|<p>2</p>|<p>3</p>');
    });

    it('should be able to inject tokens from EnvironmentInjector', () => {
      const A = new InjectionToken('A');
      @Component({
        standalone: true,
        template: 'Token: {{ a }}',
      })
      class StandaloneComponent {
        a = inject(A);
      }

      const hostElement = document.createElement('div');
      const parentInjector = TestBed.inject(EnvironmentInjector);
      const providers = [{provide: A, useValue: 'EnvironmentInjector(A)'}];
      const environmentInjector = createEnvironmentInjector(providers, parentInjector);
      const componentRef = createComponent(StandaloneComponent, {hostElement, environmentInjector});
      componentRef.changeDetectorRef.detectChanges();

      expect(hostElement.textContent).toBe('Token: EnvironmentInjector(A)');
    });

    it('should be able to use NodeInjector from the node hierarchy', () => {
      const A = new InjectionToken('A');
      const B = new InjectionToken('B');
      @Component({
        standalone: true,
        template: '{{ a }} and {{ b }}',
      })
      class ChildStandaloneComponent {
        a = inject(A);
        b = inject(B);
      }

      @Component({
        standalone: true,
        template: 'Tokens: <div #target></div>',
        providers: [{provide: A, useValue: 'ElementInjector(A)'}]
      })
      class RootStandaloneComponent {
        @ViewChild('target', {read: ElementRef}) target!: ElementRef;
        constructor(private injector: Injector) {}

        createChildComponent() {
          const hostElement = this.target.nativeElement;
          const parentInjector = this.injector.get(EnvironmentInjector);
          const providers = [
            {provide: A, useValue: 'EnvironmentInjector(A)'},
            {provide: B, useValue: 'EnvironmentInjector(B)'}
          ];
          const environmentInjector = createEnvironmentInjector(providers, parentInjector);
          const childComponentRef = createComponent(
              ChildStandaloneComponent,
              {hostElement, elementInjector: this.injector, environmentInjector});
          childComponentRef.changeDetectorRef.detectChanges();
        }
      }

      const fixture = TestBed.createComponent(RootStandaloneComponent);
      fixture.detectChanges();

      fixture.componentInstance.createChildComponent();

      const rootEl = fixture.nativeElement;

      // Token A is coming from the Element Injector, token B - from the Environment Injector.
      expect(rootEl.textContent).toBe('Tokens: ElementInjector(A) and EnvironmentInjector(B)');
    });

    it('should create a host element if none provided', () => {
      const selector = 'standalone-comp';
      @Component({
        selector,
        standalone: true,
        template: 'Hello {{ name }}!',
      })
      class StandaloneComponent {
        name = 'Angular';
      }

      const environmentInjector = TestBed.inject(EnvironmentInjector);
      const componentRef = createComponent(StandaloneComponent, {environmentInjector});
      componentRef.changeDetectorRef.detectChanges();

      const hostElement =
          (componentRef.hostView as EmbeddedViewRef<StandaloneComponent>).rootNodes[0];

      // A host element that matches component's selector.
      expect(hostElement.tagName.toLowerCase()).toBe(selector);

      expect(hostElement.textContent).toBe('Hello Angular!');
    });

    it('should fall-back to use a `div` as a host element if none provided ' +
           'and element selector does not have a tag name',
       () => {
         @Component({
           selector: '.some-class',
           standalone: true,
           template: 'Hello {{ name }}!',
         })
         class StandaloneComponent {
           name = 'Angular';
         }

         const environmentInjector = TestBed.inject(EnvironmentInjector);
         const componentRef = createComponent(StandaloneComponent, {environmentInjector});
         componentRef.changeDetectorRef.detectChanges();

         const hostElement =
             (componentRef.hostView as EmbeddedViewRef<StandaloneComponent>).rootNodes[0];

         // A host element has the `div` tag name, since component's selector doesn't contain
         // tag name information (only a class name).
         expect(hostElement.tagName.toLowerCase()).toBe('div');

         expect(hostElement.textContent).toBe('Hello Angular!');
       });

    describe('error checking', () => {
      it('should throw when provided class is not a component', () => {
        class NotAComponent {}

        @Directive()
        class ADirective {
        }

        @Injectable()
        class AnInjectiable {
        }

        const errorFor = (type: Type<unknown>): string =>
            `NG0906: The ${stringifyForError(type)} is not an Angular component, ` +
            `make sure it has the \`@Component\` decorator.`;
        const hostElement = document.createElement('div');
        const environmentInjector = TestBed.inject(EnvironmentInjector);

        expect(() => createComponent(NotAComponent, {hostElement, environmentInjector}))
            .toThrowError(errorFor(NotAComponent));

        expect(() => createComponent(ADirective, {hostElement, environmentInjector}))
            .toThrowError(errorFor(ADirective));

        expect(() => createComponent(AnInjectiable, {hostElement, environmentInjector}))
            .toThrowError(errorFor(AnInjectiable));
      });
    });
  });

  describe('reflectComponentType', () => {
    it('should create an ComponentMirror for a standalone component', () => {
      @Component({
        selector: 'standalone-component',
        standalone: true,
        template: `
          <ng-content></ng-content>
          <ng-content select="content-selector-a"></ng-content>
          <ng-content select="content-selector-b"></ng-content>
          <ng-content></ng-content>
        `,
        inputs: ['input-a', 'input-b:input-alias-b'],
        outputs: ['output-a', 'output-b:output-alias-b'],
      })
      class StandaloneComponent {
      }

      const mirror = reflectComponentType(StandaloneComponent)!;

      expect(mirror.selector).toBe('standalone-component');
      expect(mirror.type).toBe(StandaloneComponent);
      expect(mirror.isStandalone).toEqual(true);
      expect(mirror.inputs).toEqual([
        {propName: 'input-a', templateName: 'input-a'},
        {propName: 'input-b', templateName: 'input-alias-b'}
      ]);
      expect(mirror.outputs).toEqual([
        {propName: 'output-a', templateName: 'output-a'},
        {propName: 'output-b', templateName: 'output-alias-b'}
      ]);
      expect(mirror.ngContentSelectors).toEqual([
        '*', 'content-selector-a', 'content-selector-b', '*'
      ]);
    });

    it('should create an ComponentMirror for a non-standalone component', () => {
      @Component({
        selector: 'non-standalone-component',
        template: `
          <ng-content></ng-content>
          <ng-content select="content-selector-a"></ng-content>
          <ng-content select="content-selector-b"></ng-content>
          <ng-content></ng-content>
        `,
        inputs: ['input-a', 'input-b:input-alias-b'],
        outputs: ['output-a', 'output-b:output-alias-b'],
      })
      class NonStandaloneComponent {
      }

      const mirror = reflectComponentType(NonStandaloneComponent)!;

      expect(mirror.selector).toBe('non-standalone-component');
      expect(mirror.type).toBe(NonStandaloneComponent);
      expect(mirror.isStandalone).toEqual(false);
      expect(mirror.inputs).toEqual([
        {propName: 'input-a', templateName: 'input-a'},
        {propName: 'input-b', templateName: 'input-alias-b'}
      ]);
      expect(mirror.outputs).toEqual([
        {propName: 'output-a', templateName: 'output-a'},
        {propName: 'output-b', templateName: 'output-alias-b'}
      ]);
      expect(mirror.ngContentSelectors).toEqual([
        '*', 'content-selector-a', 'content-selector-b', '*'
      ]);
    });

    describe('error checking', () => {
      it('should throw when provided class is not a component', () => {
        class NotAnnotated {}

        @Directive()
        class ADirective {
        }

        @Injectable()
        class AnInjectiable {
        }

        expect(reflectComponentType(NotAnnotated)).toBe(null);
        expect(reflectComponentType(ADirective)).toBe(null);
        expect(reflectComponentType(AnInjectiable)).toBe(null);
      });
    });
  });
});
