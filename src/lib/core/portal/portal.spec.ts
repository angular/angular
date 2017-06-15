import {inject, ComponentFixture, TestBed, async} from '@angular/core/testing';
import {
  NgModule,
  Component,
  ViewChild,
  ViewChildren,
  QueryList,
  ViewContainerRef,
  ComponentFactoryResolver,
  Optional,
  Injector,
  ApplicationRef,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TemplatePortalDirective, PortalHostDirective, PortalModule} from './portal-directives';
import {Portal, ComponentPortal} from './portal';
import {DomPortalHost} from './dom-portal-host';


describe('Portals', () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [PortalModule, PortalTestModule],
    });

    TestBed.compileComponents();
  }));

  describe('PortalHostDirective', () => {
    let fixture: ComponentFixture<PortalTestApp>;

    beforeEach(() => {
      fixture = TestBed.createComponent(PortalTestApp);
    });

    it('should load a component into the portal', () => {
      // Set the selectedHost to be a ComponentPortal.
      let testAppComponent = fixture.debugElement.componentInstance;
      testAppComponent.selectedPortal = new ComponentPortal(PizzaMsg);
      fixture.detectChanges();

      // Expect that the content of the attached portal is present.
      let hostContainer = fixture.nativeElement.querySelector('.portal-container');
      expect(hostContainer.textContent).toContain('Pizza');
    });

    it('should dispose the host when destroyed', () => {
      // Set the selectedHost to be a ComponentPortal.
      let testAppComponent = fixture.debugElement.componentInstance;
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
      let testAppComponent = fixture.debugElement.componentInstance;
      testAppComponent.selectedPortal = new ComponentPortal(PizzaMsg, null, chocolateInjector);
      fixture.detectChanges();

      // Expect that the content of the attached portal is present.
      let hostContainer = fixture.nativeElement.querySelector('.portal-container');
      expect(hostContainer.textContent).toContain('Pizza');
      expect(hostContainer.textContent).toContain('Chocolate');
    });

    it('should load a <ng-template> portal', () => {
      let testAppComponent = fixture.debugElement.componentInstance;

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
      let testAppComponent = fixture.debugElement.componentInstance;

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
      let testAppComponent = fixture.debugElement.componentInstance;

      // Detect changes initially so that the component's ViewChildren are resolved.
      fixture.detectChanges();

      // Set the selectedHost to be a TemplatePortal.
      testAppComponent.selectedPortal = testAppComponent.portalWithBinding;
      fixture.detectChanges();

      // Expect that the content of the attached portal is present.
      let hostContainer = fixture.nativeElement.querySelector('.portal-container');
      expect(hostContainer.textContent).toContain('Banana');

      // When updating the binding value.
      testAppComponent.fruit = 'Mango';
      fixture.detectChanges();

      // Expect the new value to be reflected in the rendered output.
      expect(hostContainer.textContent).toContain('Mango');
    });

    it('should load a <ng-template> portal with an inner template', () => {
      let testAppComponent = fixture.debugElement.componentInstance;

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
      let testAppComponent = fixture.debugElement.componentInstance;

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
      let testAppComponent = fixture.debugElement.componentInstance;
      testAppComponent.selectedPortal = new ComponentPortal(PizzaMsg);

      fixture.detectChanges();
      expect(testAppComponent.portalHost.hasAttached()).toBe(true);
      expect(testAppComponent.portalHost.portal).toBe(testAppComponent.selectedPortal);

      testAppComponent.selectedPortal = null;
      fixture.detectChanges();

      expect(testAppComponent.portalHost.hasAttached()).toBe(false);
      expect(testAppComponent.portalHost.portal).toBeNull();
    });

    it('should set the `portal` when attaching a component portal programmatically', () => {
      let testAppComponent = fixture.debugElement.componentInstance;
      let portal = new ComponentPortal(PizzaMsg);

      testAppComponent.portalHost.attachComponentPortal(portal);

      expect(testAppComponent.portalHost.portal).toBe(portal);
    });

    it('should set the `portal` when attaching a template portal programmatically', () => {
      let testAppComponent = fixture.debugElement.componentInstance;
      fixture.detectChanges();

      testAppComponent.portalHost.attachTemplatePortal(testAppComponent.cakePortal);

      expect(testAppComponent.portalHost.portal).toBe(testAppComponent.cakePortal);
    });

    it('should clear the portal reference on destroy', () => {
      let testAppComponent = fixture.debugElement.componentInstance;

      testAppComponent.selectedPortal = new ComponentPortal(PizzaMsg);
      fixture.detectChanges();

      expect(testAppComponent.portalHost.portal).toBeTruthy();

      fixture.destroy();

      expect(testAppComponent.portalHost.portal).toBeNull();
    });
  });

  describe('DomPortalHost', () => {
    let componentFactoryResolver: ComponentFactoryResolver;
    let someViewContainerRef: ViewContainerRef;
    let someInjector: Injector;
    let someFixture: ComponentFixture<any>;
    let someDomElement: HTMLElement;
    let host: DomPortalHost;
    let injector: Injector;
    let appRef: ApplicationRef;

    let deps = [ComponentFactoryResolver, Injector, ApplicationRef];
    beforeEach(inject(deps, (dcl: ComponentFactoryResolver, i: Injector, ar: ApplicationRef) => {
      componentFactoryResolver = dcl;
      injector = i;
      appRef = ar;
    }));

    beforeEach(() => {
      someDomElement = document.createElement('div');
      host = new DomPortalHost(someDomElement, componentFactoryResolver, appRef, injector);

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

      let testAppComponent = fixture.debugElement.componentInstance;

      // Detect changes initially so that the component's ViewChildren are resolved.
      fixture.detectChanges();

      // Attach the TemplatePortal.
      testAppComponent.portalWithBinding.attach(host);
      fixture.detectChanges();

      // Now that the portal is attached, change detection has to happen again in order
      // for the bindings to update.
      fixture.detectChanges();

      // Expect that the content of the attached portal is present.
      expect(someDomElement.textContent).toContain('Banana');

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
          .toBe(true, 'Expected a PizzaMsg component to be created');
      expect(someDomElement.textContent)
          .toContain('Pizza', 'Expected the static string "Pizza" in the DomPortalHost.');

      componentInstance.snack = new Chocolate();
      someFixture.detectChanges();
      expect(someDomElement.textContent)
          .toContain('Chocolate', 'Expected the bound string "Chocolate" in the DomPortalHost');

      host.detach();

      expect(someDomElement.innerHTML)
          .toBe('', 'Expected the DomPortalHost to be empty after detach');
    });

    it('should call the dispose function even if the host has no attached content', () => {
      let spy = jasmine.createSpy('host dispose spy');

      expect(host.hasAttached()).toBe(false, 'Expected host not to have attached content.');

      host.setDisposeFn(spy);
      host.dispose();

      expect(spy).toHaveBeenCalled();
    });
  });
});


class Chocolate {
  toString() {
    return 'Chocolate';
  }
}

class ChocolateInjector {
  constructor(public parentInjector: Injector) { }

  get(token: any) {
    return token === Chocolate ? new Chocolate() : this.parentInjector.get<any>(token);
  }
}

/** Simple component for testing ComponentPortal. */
@Component({
  selector: 'pizza-msg',
  template: '<p>Pizza</p><p>{{snack}}</p>',
})
class PizzaMsg {
  constructor(@Optional() public snack: Chocolate) { }
}

/** Simple component to grab an arbitrary ViewContainerRef */
@Component({
  selector: 'some-placeholder',
  template: '<p>Hello</p>'
})
class ArbitraryViewContainerRefComponent {
  constructor(public viewContainerRef: ViewContainerRef, public injector: Injector) { }
}


/** Test-bed component that contains a portal host and a couple of template portals. */
@Component({
  selector: 'portal-test',
  template: `
  <div class="portal-container">
    <ng-template [cdkPortalHost]="selectedPortal"></ng-template>
  </div>

  <ng-template cdk-portal>Cake</ng-template>

  <div *cdk-portal>Pie</div>
  <ng-template cdk-portal> {{fruit}} </ng-template>

  <ng-template cdk-portal>
    <ul>
      <li *ngFor="let fruitName of fruits"> {{fruitName}} </li>
    </ul>
  </ng-template>
  `,
})
class PortalTestApp {
  @ViewChildren(TemplatePortalDirective) portals: QueryList<TemplatePortalDirective>;
  @ViewChild(PortalHostDirective) portalHost: PortalHostDirective;
  selectedPortal: Portal<any>;
  fruit: string = 'Banana';
  fruits = ['Apple', 'Pineapple', 'Durian'];

  constructor(public injector: Injector) { }

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

// Create a real (non-test) NgModule as a workaround for
// https://github.com/angular/angular/issues/10760
const TEST_COMPONENTS = [PortalTestApp, ArbitraryViewContainerRefComponent, PizzaMsg];
@NgModule({
  imports: [CommonModule, PortalModule],
  exports: TEST_COMPONENTS,
  declarations: TEST_COMPONENTS,
  entryComponents: TEST_COMPONENTS,
})
class PortalTestModule { }
