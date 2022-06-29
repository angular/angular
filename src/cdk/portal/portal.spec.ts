import {CommonModule} from '@angular/common';
import {
  ApplicationRef,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  Injector,
  Optional,
  QueryList,
  TemplateRef,
  Type,
  ViewChild,
  ViewChildren,
  ViewContainerRef,
  Directive,
  AfterViewInit,
} from '@angular/core';
import {ComponentFixture, inject, TestBed} from '@angular/core/testing';
import {DomPortalOutlet} from './dom-portal-outlet';
import {ComponentPortal, DomPortal, Portal, TemplatePortal} from './portal';
import {CdkPortal, CdkPortalOutlet, PortalModule} from './portal-directives';

describe('Portals', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PortalModule, CommonModule],
      declarations: [
        PortalTestApp,
        UnboundPortalTestApp,
        ArbitraryViewContainerRefComponent,
        PizzaMsg,
        SaveParentNodeOnInit,
      ],
    }).compileComponents();
  });

  describe('CdkPortalOutlet', () => {
    let fixture: ComponentFixture<PortalTestApp>;
    let componentFactoryResolver: ComponentFactoryResolver;

    beforeEach(() => {
      fixture = TestBed.createComponent(PortalTestApp);
      fixture.detectChanges();

      inject([ComponentFactoryResolver], (cfr: ComponentFactoryResolver) => {
        componentFactoryResolver = cfr;
      })();
    });

    it('should load a component into the portal', () => {
      // Set the selectedHost to be a ComponentPortal.
      let testAppComponent = fixture.componentInstance;
      let componentPortal = new ComponentPortal(PizzaMsg);
      let hostContainer = fixture.nativeElement.querySelector('.portal-container');

      testAppComponent.selectedPortal = componentPortal;
      fixture.detectChanges();

      // Expect that the content of the attached portal is present.
      expect(hostContainer.textContent).toContain('Pizza');
      expect(testAppComponent.portalOutlet.portal).toBe(componentPortal);
      expect(testAppComponent.portalOutlet.attachedRef instanceof ComponentRef).toBe(true);
      expect(testAppComponent.attachedSpy).toHaveBeenCalledWith(
        testAppComponent.portalOutlet.attachedRef,
      );
    });

    it('should load a template into the portal outlet', () => {
      let testAppComponent = fixture.componentInstance;
      let hostContainer = fixture.nativeElement.querySelector('.portal-container');
      let templatePortal = new TemplatePortal(testAppComponent.templateRef, null!);

      testAppComponent.selectedPortal = templatePortal;
      fixture.detectChanges();

      // Expect that the content of the attached portal is present and no context is projected
      expect(hostContainer.textContent).toContain('Banana');
      expect(hostContainer.textContent).toContain('Pizza');
      expect(hostContainer.textContent).not.toContain('Chocolate');
      expect(testAppComponent.portalOutlet.portal).toBe(templatePortal);

      // We can't test whether it's an instance of an `EmbeddedViewRef` so
      // we verify that it's defined and that it's not a ComponentRef.
      expect(testAppComponent.portalOutlet.attachedRef instanceof ComponentRef).toBe(false);
      expect(testAppComponent.portalOutlet.attachedRef).toBeTruthy();
      expect(testAppComponent.attachedSpy).toHaveBeenCalledWith(
        testAppComponent.portalOutlet.attachedRef,
      );
    });

    it('should load a template with a custom injector into the portal outlet', () => {
      const testAppComponent = fixture.componentInstance;
      const hostContainer = fixture.nativeElement.querySelector('.portal-container');
      const templatePortal = new TemplatePortal(
        testAppComponent.templateRef,
        null!,
        undefined,
        new ChocolateInjector(fixture.componentInstance.injector),
      );

      testAppComponent.selectedPortal = templatePortal;
      fixture.detectChanges();

      // Expect that the content of the attached portal is present and no context is projected
      expect(hostContainer.textContent).toContain('Banana');
      expect(hostContainer.textContent).toContain('Pizza');
      expect(hostContainer.textContent).toContain('Chocolate');
      expect(testAppComponent.portalOutlet.portal).toBe(templatePortal);

      // We can't test whether it's an instance of an `EmbeddedViewRef` so
      // we verify that it's defined and that it's not a ComponentRef.
      expect(testAppComponent.portalOutlet.attachedRef instanceof ComponentRef).toBe(false);
      expect(testAppComponent.portalOutlet.attachedRef).toBeTruthy();
      expect(testAppComponent.attachedSpy).toHaveBeenCalledWith(
        testAppComponent.portalOutlet.attachedRef,
      );
    });

    it('should load a DOM portal', () => {
      const testAppComponent = fixture.componentInstance;
      const hostContainer = fixture.nativeElement.querySelector('.portal-container');
      const innerContent = fixture.nativeElement.querySelector('.dom-portal-inner-content');
      const domPortal = new DomPortal(testAppComponent.domPortalContent);
      const initialParent = domPortal.element.parentNode!;

      expect(innerContent).withContext('Expected portal content to be rendered.').toBeTruthy();
      expect(domPortal.element.contains(innerContent))
        .withContext('Expected content to be inside portal on init.')
        .toBe(true);
      expect(hostContainer.contains(innerContent))
        .withContext('Expected content to be outside of portal outlet.')
        .toBe(false);

      testAppComponent.selectedPortal = domPortal;
      fixture.detectChanges();

      expect(domPortal.element.parentNode).not.toBe(
        initialParent,
        'Expected portal to be out of the initial parent on attach.',
      );
      expect(hostContainer.contains(innerContent))
        .withContext('Expected content to be inside the outlet on attach.')
        .toBe(true);
      expect(testAppComponent.portalOutlet.hasAttached()).toBe(true);

      testAppComponent.selectedPortal = undefined;
      fixture.detectChanges();

      expect(domPortal.element.parentNode)
        .withContext('Expected portal to be back inside initial parent on detach.')
        .toBe(initialParent);
      expect(hostContainer.contains(innerContent))
        .withContext('Expected content to be removed from outlet on detach.')
        .toBe(false);
      expect(testAppComponent.portalOutlet.hasAttached()).toBe(false);
    });

    it('should throw when trying to load an element without a parent into a DOM portal', () => {
      const testAppComponent = fixture.componentInstance;
      const element = document.createElement('div');
      const domPortal = new DomPortal(element);

      expect(() => {
        testAppComponent.selectedPortal = domPortal;
        fixture.detectChanges();
      }).toThrowError('DOM portal content must be attached to a parent node.');
    });

    it('should not throw when restoring if the outlet element was cleared', () => {
      const testAppComponent = fixture.componentInstance;
      const parent = fixture.nativeElement.querySelector('.dom-portal-parent');
      const domPortal = new DomPortal(testAppComponent.domPortalContent);

      testAppComponent.selectedPortal = domPortal;
      fixture.detectChanges();

      parent.innerHTML = '';

      expect(() => {
        testAppComponent.selectedPortal = undefined;
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should project template context bindings in the portal', () => {
      let testAppComponent = fixture.componentInstance;
      let hostContainer = fixture.nativeElement.querySelector('.portal-container');

      // TemplatePortal without context:
      let templatePortal = new TemplatePortal(testAppComponent.templateRef, null!);
      testAppComponent.selectedPortal = templatePortal;
      fixture.detectChanges();
      // Expect that the content of the attached portal is present and NO context is projected
      expect(hostContainer.textContent).toContain('Banana - !');

      // using TemplatePortal.attach method to set context
      testAppComponent.selectedPortal = undefined;
      fixture.detectChanges();
      templatePortal.attach(testAppComponent.portalOutlet, {$implicit: {status: 'rotten'}});
      fixture.detectChanges();
      // Expect that the content of the attached portal is present and context given via the
      // attach method is projected
      expect(hostContainer.textContent).toContain('Banana - rotten!');

      // using TemplatePortal constructor to set the context
      templatePortal = new TemplatePortal(testAppComponent.templateRef, null!, {
        $implicit: {status: 'fresh'},
      });
      testAppComponent.selectedPortal = templatePortal;
      fixture.detectChanges();
      // Expect that the content of the attached portal is present and context given via the
      // constructor is projected
      expect(hostContainer.textContent).toContain('Banana - fresh!');

      // using TemplatePortal constructor to set the context but also calling attach method with
      // context, the latter should take precedence:
      testAppComponent.selectedPortal = undefined;
      fixture.detectChanges();
      templatePortal.attach(testAppComponent.portalOutlet, {$implicit: {status: 'rotten'}});
      fixture.detectChanges();
      // Expect that the content of the attached portal is present and and context given via the
      // attach method is projected and get precedence over constructor context
      expect(hostContainer.textContent).toContain('Banana - rotten!');
    });

    it('should dispose the host when destroyed', () => {
      // Set the selectedHost to be a ComponentPortal.
      let testAppComponent = fixture.componentInstance;
      testAppComponent.selectedPortal = new ComponentPortal(PizzaMsg);

      fixture.detectChanges();
      expect(testAppComponent.selectedPortal.isAttached).toBe(true);

      fixture.destroy();
      expect(testAppComponent.selectedPortal.isAttached).toBe(false);
    });

    it('should load a component into the portal with a given injector', () => {
      // Create a custom injector for the component.
      let chocolateInjector = new ChocolateInjector(fixture.componentInstance.injector);

      // Set the selectedHost to be a ComponentPortal.
      let testAppComponent = fixture.componentInstance;
      testAppComponent.selectedPortal = new ComponentPortal(PizzaMsg, undefined, chocolateInjector);
      fixture.detectChanges();

      // Expect that the content of the attached portal is present.
      let hostContainer = fixture.nativeElement.querySelector('.portal-container');
      expect(hostContainer.textContent).toContain('Pizza');
      expect(hostContainer.textContent).toContain('Chocolate');
    });

    it('should load a <ng-template> portal', () => {
      let testAppComponent = fixture.componentInstance;

      // Detect changes initially so that the component's ViewChildren are resolved.
      fixture.detectChanges();

      // Set the selectedHost to be a TemplatePortal.
      testAppComponent.selectedPortal = testAppComponent.cakePortal;
      fixture.detectChanges();

      // Expect that the content of the attached portal is present.
      let hostContainer = fixture.nativeElement.querySelector('.portal-container');
      expect(hostContainer.textContent).toContain('Cake');
    });

    it('should load a <ng-template> portal with the `*` sugar', () => {
      let testAppComponent = fixture.componentInstance;

      // Detect changes initially so that the component's ViewChildren are resolved.
      fixture.detectChanges();

      // Set the selectedHost to be a TemplatePortal (with the `*` syntax).
      testAppComponent.selectedPortal = testAppComponent.piePortal;
      fixture.detectChanges();

      // Expect that the content of the attached portal is present.
      let hostContainer = fixture.nativeElement.querySelector('.portal-container');
      expect(hostContainer.textContent).toContain('Pie');
    });

    it('should load a <ng-template> portal with a binding', () => {
      let testAppComponent = fixture.componentInstance;

      // Detect changes initially so that the component's ViewChildren are resolved.
      fixture.detectChanges();

      // Set the selectedHost to be a TemplatePortal.
      testAppComponent.selectedPortal = testAppComponent.portalWithBinding;
      fixture.detectChanges();

      // Expect that the content of the attached portal is present.
      let hostContainer = fixture.nativeElement.querySelector('.portal-container');
      expect(hostContainer.textContent).toContain('Banana');
      expect(hostContainer.textContent).toContain('Pizza');
      expect(hostContainer.textContent).not.toContain('Chocolate');

      // When updating the binding value.
      testAppComponent.fruit = 'Mango';
      fixture.detectChanges();

      // Expect the new value to be reflected in the rendered output.
      expect(hostContainer.textContent).toContain('Mango');
    });

    it('should load a <ng-template> portal with an inner template', () => {
      let testAppComponent = fixture.componentInstance;

      // Detect changes initially so that the component's ViewChildren are resolved.
      fixture.detectChanges();

      // Set the selectedHost to be a TemplatePortal.
      testAppComponent.selectedPortal = testAppComponent.portalWithTemplate;
      fixture.detectChanges();

      // Expect that the content of the attached portal is present.
      let hostContainer = fixture.nativeElement.querySelector('.portal-container');
      expect(hostContainer.textContent).toContain('Pineapple');

      // When updating the binding value.
      testAppComponent.fruits = ['Mangosteen'];
      fixture.detectChanges();

      // Expect the new value to be reflected in the rendered output.
      expect(hostContainer.textContent).toContain('Mangosteen');
    });

    it('should change the attached portal', () => {
      let testAppComponent = fixture.componentInstance;

      // Detect changes initially so that the component's ViewChildren are resolved.
      fixture.detectChanges();

      // Set the selectedHost to be a ComponentPortal.
      testAppComponent.selectedPortal = testAppComponent.piePortal;
      fixture.detectChanges();

      // Expect that the content of the attached portal is present.
      let hostContainer = fixture.nativeElement.querySelector('.portal-container');
      expect(hostContainer.textContent).toContain('Pie');

      testAppComponent.selectedPortal = new ComponentPortal(PizzaMsg);
      fixture.detectChanges();

      expect(hostContainer.textContent).toContain('Pizza');
    });

    it('should detach the portal when it is set to null', () => {
      let testAppComponent = fixture.componentInstance;
      testAppComponent.selectedPortal = new ComponentPortal(PizzaMsg);

      fixture.detectChanges();
      expect(testAppComponent.portalOutlet.hasAttached()).toBe(true);
      expect(testAppComponent.portalOutlet.portal).toBe(testAppComponent.selectedPortal);

      testAppComponent.selectedPortal = null!;
      fixture.detectChanges();

      expect(testAppComponent.portalOutlet.hasAttached()).toBe(false);
      expect(testAppComponent.portalOutlet.portal).toBeNull();
    });

    it('should set the `portal` when attaching a component portal programmatically', () => {
      let testAppComponent = fixture.componentInstance;
      let portal = new ComponentPortal(PizzaMsg);

      testAppComponent.portalOutlet.attachComponentPortal(portal);

      expect(testAppComponent.portalOutlet.portal).toBe(portal);
    });

    it('should set the `portal` when attaching a template portal programmatically', () => {
      let testAppComponent = fixture.componentInstance;
      fixture.detectChanges();

      testAppComponent.portalOutlet.attachTemplatePortal(testAppComponent.cakePortal);

      expect(testAppComponent.portalOutlet.portal).toBe(testAppComponent.cakePortal);
    });

    it('should clear the portal reference on destroy', () => {
      let testAppComponent = fixture.componentInstance;

      testAppComponent.selectedPortal = new ComponentPortal(PizzaMsg);
      fixture.detectChanges();

      expect(testAppComponent.portalOutlet.portal).toBeTruthy();

      fixture.destroy();

      expect(testAppComponent.portalOutlet.portal).toBeNull();
    });

    it('should not clear programmatically-attached portals on init', () => {
      fixture.destroy();

      const unboundFixture = TestBed.createComponent(UnboundPortalTestApp);
      unboundFixture.detectChanges();

      // Note: calling `detectChanges` here will cause a false positive.
      // What we're testing is attaching before the first CD cycle.
      unboundFixture.componentInstance.portalOutlet.attach(new ComponentPortal(PizzaMsg));
      unboundFixture.detectChanges();

      expect(unboundFixture.nativeElement.querySelector('.portal-container').textContent).toContain(
        'Pizza',
      );
    });

    it('should be considered attached when attaching using `attach`', () => {
      expect(fixture.componentInstance.portalOutlet.hasAttached()).toBe(false);
      fixture.componentInstance.portalOutlet.attach(new ComponentPortal(PizzaMsg));
      expect(fixture.componentInstance.portalOutlet.hasAttached()).toBe(true);
    });

    it('should be considered attached when attaching using `attachComponentPortal`', () => {
      expect(fixture.componentInstance.portalOutlet.hasAttached()).toBe(false);
      fixture.componentInstance.portalOutlet.attachComponentPortal(new ComponentPortal(PizzaMsg));
      expect(fixture.componentInstance.portalOutlet.hasAttached()).toBe(true);
    });

    it('should be considered attached when attaching using `attachTemplatePortal`', () => {
      const instance = fixture.componentInstance;
      expect(instance.portalOutlet.hasAttached()).toBe(false);
      instance.portalOutlet.attachTemplatePortal(new TemplatePortal(instance.templateRef, null!));
      expect(instance.portalOutlet.hasAttached()).toBe(true);
    });

    it('should use the `ComponentFactoryResolver` from the portal, if available', () => {
      const spy = jasmine.createSpy('resolveComponentFactorySpy');
      const portal = new ComponentPortal(PizzaMsg, undefined, undefined, {
        resolveComponentFactory: <T>(...args: [Type<T>]) => {
          spy();
          return componentFactoryResolver.resolveComponentFactory(...args);
        },
      });

      fixture.componentInstance.portalOutlet.attachComponentPortal(portal);
      expect(spy).toHaveBeenCalled();
    });

    it('should render inside outlet when component portal specifies view container ref', () => {
      const hostContainer = fixture.nativeElement.querySelector('.portal-container');
      const portal = new ComponentPortal(PizzaMsg, fixture.componentInstance.alternateContainer);

      fixture.componentInstance.selectedPortal = portal;
      fixture.detectChanges();

      expect(hostContainer.textContent).toContain('Pizza');
    });

    it('should be able to pass projectable nodes to portal', () => {
      // Set the selectedHost to be a ComponentPortal.
      const testAppComponent = fixture.componentInstance;
      const componentPortal = new ComponentPortal(PizzaMsg, undefined, undefined, undefined, [
        [document.createTextNode('Projectable node')],
      ]);

      testAppComponent.selectedPortal = componentPortal;
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Projectable node');
    });
  });

  describe('DomPortalOutlet', () => {
    let componentFactoryResolver: ComponentFactoryResolver;
    let someViewContainerRef: ViewContainerRef;
    let someInjector: Injector;
    let someFixture: ComponentFixture<ArbitraryViewContainerRefComponent>;
    let someDomElement: HTMLElement;
    let host: DomPortalOutlet;
    let injector: Injector;
    let appRef: ApplicationRef;
    let deps = [ComponentFactoryResolver, Injector, ApplicationRef];

    beforeEach(inject(deps, (cfr: ComponentFactoryResolver, i: Injector, ar: ApplicationRef) => {
      componentFactoryResolver = cfr;
      injector = i;
      appRef = ar;
    }));

    beforeEach(() => {
      someDomElement = document.createElement('div');
      host = new DomPortalOutlet(
        someDomElement,
        componentFactoryResolver,
        appRef,
        injector,
        document,
      );

      someFixture = TestBed.createComponent(ArbitraryViewContainerRefComponent);
      someViewContainerRef = someFixture.componentInstance.viewContainerRef;
      someInjector = someFixture.componentInstance.injector;
    });

    it('should attach and detach a component portal', () => {
      let portal = new ComponentPortal(PizzaMsg, someViewContainerRef);

      let componentInstance: PizzaMsg = portal.attach(host).instance;

      expect(componentInstance instanceof PizzaMsg).toBe(true);
      expect(someDomElement.textContent).toContain('Pizza');

      host.detach();

      expect(someDomElement.innerHTML).toBe('');
    });

    it('should move the DOM nodes before running change detection', () => {
      someFixture.detectChanges();
      let portal = new TemplatePortal(someFixture.componentInstance.template, someViewContainerRef);

      host.attachTemplatePortal(portal);
      someFixture.detectChanges();

      expect(someFixture.componentInstance.saveParentNodeOnInit.parentOnViewInit).toBe(
        someDomElement,
      );

      host.dispose();
    });

    it('should attach and detach a component portal with a given injector', () => {
      let fixture = TestBed.createComponent(ArbitraryViewContainerRefComponent);
      someViewContainerRef = fixture.componentInstance.viewContainerRef;
      someInjector = fixture.componentInstance.injector;

      let chocolateInjector = new ChocolateInjector(someInjector);
      let portal = new ComponentPortal(PizzaMsg, someViewContainerRef, chocolateInjector);

      let componentInstance: PizzaMsg = portal.attach(host).instance;
      fixture.detectChanges();

      expect(componentInstance instanceof PizzaMsg).toBe(true);
      expect(someDomElement.textContent).toContain('Pizza');
      expect(someDomElement.textContent).toContain('Chocolate');

      host.detach();

      expect(someDomElement.innerHTML).toBe('');
    });

    it('should attach and detach a template portal', () => {
      let fixture = TestBed.createComponent(PortalTestApp);
      fixture.detectChanges();

      fixture.componentInstance.cakePortal.attach(host);

      expect(someDomElement.textContent).toContain('Cake');
    });

    it('should render a template portal with an inner template', () => {
      let fixture = TestBed.createComponent(PortalTestApp);
      fixture.detectChanges();

      fixture.componentInstance.portalWithTemplate.attach(host);

      expect(someDomElement.textContent).toContain('Durian');
    });

    it('should attach and detach a template portal with a binding', () => {
      let fixture = TestBed.createComponent(PortalTestApp);

      let testAppComponent = fixture.componentInstance;

      // Detect changes initially so that the component's ViewChildren are resolved.
      fixture.detectChanges();

      // Attach the TemplatePortal.
      testAppComponent.portalWithBinding.attach(host, {$implicit: {status: 'fresh'}});
      fixture.detectChanges();

      // Now that the portal is attached, change detection has to happen again in order
      // for the bindings to update.
      fixture.detectChanges();

      // Expect that the content of the attached portal is present.
      expect(someDomElement.textContent).toContain('Banana - fresh');

      // When updating the binding value.
      testAppComponent.fruit = 'Mango';
      fixture.detectChanges();

      // Expect the new value to be reflected in the rendered output.
      expect(someDomElement.textContent).toContain('Mango');

      host.detach();
      expect(someDomElement.innerHTML).toBe('');
    });

    it('should change the attached portal', () => {
      let fixture = TestBed.createComponent(ArbitraryViewContainerRefComponent);
      someViewContainerRef = fixture.componentInstance.viewContainerRef;

      let appFixture = TestBed.createComponent(PortalTestApp);
      appFixture.detectChanges();

      appFixture.componentInstance.piePortal.attach(host);

      expect(someDomElement.textContent).toContain('Pie');

      host.detach();
      host.attach(new ComponentPortal(PizzaMsg, someViewContainerRef));

      expect(someDomElement.textContent).toContain('Pizza');
    });

    it('should attach and detach a component portal without a ViewContainerRef', () => {
      let portal = new ComponentPortal(PizzaMsg);

      let componentInstance: PizzaMsg = portal.attach(host).instance;

      expect(componentInstance instanceof PizzaMsg)
        .withContext('Expected a PizzaMsg component to be created')
        .toBe(true);
      expect(someDomElement.textContent)
        .withContext('Expected the static string "Pizza" in the DomPortalOutlet.')
        .toContain('Pizza');

      componentInstance.snack = new Chocolate();
      someFixture.detectChanges();
      expect(someDomElement.textContent)
        .withContext('Expected the bound string "Chocolate" in the DomPortalOutlet')
        .toContain('Chocolate');

      host.detach();

      expect(someDomElement.innerHTML)
        .withContext('Expected the DomPortalOutlet to be empty after detach')
        .toBe('');
    });

    it('should call the dispose function even if the host has no attached content', () => {
      let spy = jasmine.createSpy('host dispose spy');

      expect(host.hasAttached())
        .withContext('Expected host not to have attached content.')
        .toBe(false);

      host.setDisposeFn(spy);
      host.dispose();

      expect(spy).toHaveBeenCalled();
    });

    it('should use the `ComponentFactoryResolver` from the portal, if available', () => {
      const spy = jasmine.createSpy('resolveComponentFactorySpy');
      const portal = new ComponentPortal(PizzaMsg, undefined, undefined, {
        resolveComponentFactory: <T>(...args: [Type<T>]) => {
          spy();
          return componentFactoryResolver.resolveComponentFactory(...args);
        },
      });

      host.attachComponentPortal(portal);
      expect(spy).toHaveBeenCalled();
    });

    it('should attach and detach a DOM portal', () => {
      const fixture = TestBed.createComponent(PortalTestApp);
      fixture.detectChanges();
      const portal = new DomPortal(fixture.componentInstance.domPortalContent);

      portal.attach(host);

      expect(someDomElement.textContent).toContain('Hello there');

      host.detach();

      expect(someDomElement.textContent!.trim()).toBe('');
    });

    it('should throw when trying to load an element without a parent into a DOM portal', () => {
      const fixture = TestBed.createComponent(PortalTestApp);
      fixture.detectChanges();
      const element = document.createElement('div');
      const portal = new DomPortal(element);

      expect(() => {
        portal.attach(host);
        fixture.detectChanges();
      }).toThrowError('DOM portal content must be attached to a parent node.');
    });

    it('should not throw when restoring if the outlet element was cleared', () => {
      const fixture = TestBed.createComponent(PortalTestApp);
      fixture.detectChanges();
      const portal = new DomPortal(fixture.componentInstance.domPortalContent);

      portal.attach(host);
      host.outletElement.innerHTML = '';

      expect(() => host.detach()).not.toThrow();
    });

    it('should set hasAttached when the various portal types are attached', () => {
      const fixture = TestBed.createComponent(PortalTestApp);
      fixture.detectChanges();
      const viewContainerRef = fixture.componentInstance.viewContainerRef;

      expect(host.hasAttached()).toBe(false);

      host.attachComponentPortal(new ComponentPortal(PizzaMsg, viewContainerRef));
      expect(host.hasAttached()).toBe(true);

      host.detach();
      expect(host.hasAttached()).toBe(false);

      host.attachTemplatePortal(
        new TemplatePortal(fixture.componentInstance.templateRef, viewContainerRef),
      );
      expect(host.hasAttached()).toBe(true);

      host.detach();
      expect(host.hasAttached()).toBe(false);

      host.attachDomPortal(new DomPortal(fixture.componentInstance.domPortalContent));
      expect(host.hasAttached()).toBe(true);
    });
  });
});

class Chocolate {
  toString() {
    return 'Chocolate';
  }
}

class ChocolateInjector {
  constructor(public parentInjector: Injector) {}

  get(token: any) {
    return token === Chocolate ? new Chocolate() : this.parentInjector.get<any>(token);
  }
}

/** Simple component for testing ComponentPortal. */
@Component({
  selector: 'pizza-msg',
  template: '<p>Pizza</p><p>{{snack}}</p><ng-content></ng-content>',
})
class PizzaMsg {
  constructor(@Optional() public snack: Chocolate) {}
}

/**
 * Saves the parent node that the directive was attached to on init.
 * Useful to see where the element was in the DOM when it was first attached.
 */
@Directive({
  selector: '[savesParentNodeOnInit]',
})
class SaveParentNodeOnInit implements AfterViewInit {
  parentOnViewInit: HTMLElement;

  constructor(private _elementRef: ElementRef<HTMLElement>) {}

  ngAfterViewInit() {
    this.parentOnViewInit = this._elementRef.nativeElement.parentElement!;
  }
}

/** Simple component to grab an arbitrary ViewContainerRef */
@Component({
  selector: 'some-placeholder',
  template: `
    <p>Hello</p>

    <ng-template #template>
      <div savesParentNodeOnInit></div>
    </ng-template>
  `,
})
class ArbitraryViewContainerRefComponent {
  @ViewChild('template') template: TemplateRef<any>;
  @ViewChild(SaveParentNodeOnInit) saveParentNodeOnInit: SaveParentNodeOnInit;

  constructor(public viewContainerRef: ViewContainerRef, public injector: Injector) {}
}

/** Test-bed component that contains a portal outlet and a couple of template portals. */
@Component({
  selector: 'portal-test',
  template: `
  <div class="portal-container">
    <ng-template [cdkPortalOutlet]="selectedPortal" (attached)="attachedSpy($event)"></ng-template>
  </div>

  <ng-container #alternateContainer></ng-container>

  <ng-template cdk-portal>Cake</ng-template>

  <div *cdk-portal>Pie</div>
  <ng-template cdk-portal let-data> {{fruit}} - {{ data?.status }}! <pizza-msg></pizza-msg></ng-template>

  <ng-template cdk-portal>
    <ul>
      <li *ngFor="let fruitName of fruits"> {{fruitName}} </li>
    </ul>
  </ng-template>

  <ng-template #templateRef let-data> {{fruit}} - {{ data?.status }}! <pizza-msg></pizza-msg></ng-template>

  <div class="dom-portal-parent">
    <div #domPortalContent>
      <p class="dom-portal-inner-content">Hello there</p>
    </div>
  </div>
  `,
})
class PortalTestApp {
  @ViewChildren(CdkPortal) portals: QueryList<CdkPortal>;
  @ViewChild(CdkPortalOutlet) portalOutlet: CdkPortalOutlet;
  @ViewChild('templateRef', {read: TemplateRef}) templateRef: TemplateRef<any>;
  @ViewChild('domPortalContent') domPortalContent: ElementRef<HTMLElement>;
  @ViewChild('alternateContainer', {read: ViewContainerRef})
  alternateContainer: ViewContainerRef;

  selectedPortal: Portal<any> | undefined;
  fruit: string = 'Banana';
  fruits = ['Apple', 'Pineapple', 'Durian'];
  attachedSpy = jasmine.createSpy('attached spy');

  constructor(public viewContainerRef: ViewContainerRef, public injector: Injector) {}

  get cakePortal() {
    return this.portals.first;
  }

  get piePortal() {
    return this.portals.toArray()[1];
  }

  get portalWithBinding() {
    return this.portals.toArray()[2];
  }

  get portalWithTemplate() {
    return this.portals.toArray()[3];
  }
}

/** Test-bed component that contains a portal outlet and a couple of template portals. */
@Component({
  template: `
    <div class="portal-container">
      <ng-template cdkPortalOutlet></ng-template>
    </div>
  `,
})
class UnboundPortalTestApp {
  @ViewChild(CdkPortalOutlet) portalOutlet: CdkPortalOutlet;
}
