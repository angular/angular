/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ComponentFactoryResolver, ComponentRef, ElementRef, InjectionToken, Injector, Input, NgModule, OnDestroy, Renderer2, Type, ViewChild, ViewContainerRef, ViewEncapsulation} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';


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
        ngOnDestroy() { destroyCalls++; }
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
      @ViewChild('vc', {read: ViewContainerRef, static: true}) vcref !: ViewContainerRef;

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
          `<leaf ${match[0].replace('_nghost', '_ngcontent')}="" ${match[1]}=""><span ${match[1].replace('_nghost', '_ngcontent')}="">bar</span></leaf></div>`);
    });
  });

  describe('view destruction', () => {
    it('should invoke onDestroy when directly destroying a root view', () => {
      let wasOnDestroyCalled = false;

      @Component({selector: 'comp-with-destroy', template: ``})
      class ComponentWithOnDestroy implements OnDestroy {
        ngOnDestroy() { wasOnDestroyCalled = true; }
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
      @ViewChild(Child, {static: false}) childInstance !: Child;
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
      ngDoCheck() { log.push('CompA:ngDoCheck'); }
    }

    @Component({
      selector: 'comp-b',
      template: '<div>{{ b }}</div>',
    })
    class CompB {
      @Input() b: string = '';
      ngDoCheck() { log.push('CompB:ngDoCheck'); }
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

});
