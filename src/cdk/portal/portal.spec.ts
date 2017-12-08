import {inject, ComponentFixture, TestBed} from '@angular/core/testing';
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
  TemplateRef
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CdkPortal, CdkPortalOutlet, PortalModule} from './portal-directives';
import {Portal, ComponentPortal, TemplatePortal} from './portal';
import {DomPortalOutlet} from './dom-portal-outlet';


describe('Portals', () => {

  beforeEach(() => {
    TestBed
      .configureTestingModule({imports: [PortalModule, PortalTestModule]})
      .compileComponents();
  });

  describe('CdkPortalOutlet', () => {
    let fixture: ComponentFixture<PortalTestApp>;

    beforeEach(() => {
      fixture = TestBed.createComponent(PortalTestApp);
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
    });

    it('should load a template into the portal', () => {
      let testAppComponent = fixture.componentInstance;
      let hostContainer = fixture.nativeElement.querySelector('.portal-container');
      let templatePortal = new TemplatePortal(testAppComponent.templateRef, null!);

      testAppComponent.selectedPortal = templatePortal;
      fixture.detectChanges();

      // Expect that the content of the attached portal is present and no context is projected
      expect(hostContainer.textContent).toContain('Banana');
      expect(testAppComponent.portalOutlet.portal).toBe(templatePortal);
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
      templatePortal =
        new TemplatePortal(testAppComponent.templateRef, null!, {$implicit: {status: 'fresh'}});
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

      // Note: calling `detectChanges` here will cause a false positive.
      // What we're testing is attaching before the first CD cycle.
      unboundFixture.componentInstance.portalOutlet.attach(new ComponentPortal(PizzaMsg));
      unboundFixture.detectChanges();

      expect(unboundFixture.nativeElement.querySelector('.portal-container').textContent)
        .toContain('Pizza');
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

  });

  describe('DomPortalOutlet', () => {
    let componentFactoryResolver: ComponentFactoryResolver;
    let someViewContainerRef: ViewContainerRef;
    let someInjector: Injector;
    let someFixture: ComponentFixture<any>;
    let someDomElement: HTMLElement;
    let host: DomPortalOutlet;
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
      host = new DomPortalOutlet(someDomElement, componentFactoryResolver, appRef, injector);

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
          .toBe(true, 'Expected a PizzaMsg component to be created');
      expect(someDomElement.textContent)
          .toContain('Pizza', 'Expected the static string "Pizza" in the DomPortalOutlet.');

      componentInstance.snack = new Chocolate();
      someFixture.detectChanges();
      expect(someDomElement.textContent)
          .toContain('Chocolate', 'Expected the bound string "Chocolate" in the DomPortalOutlet');

      host.detach();

      expect(someDomElement.innerHTML)
          .toBe('', 'Expected the DomPortalOutlet to be empty after detach');
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


/** Test-bed component that contains a portal outlet and a couple of template portals. */
@Component({
  selector: 'portal-test',
  template: `
  <div class="portal-container">
    <ng-template [cdkPortalOutlet]="selectedPortal"></ng-template>
  </div>

  <ng-template cdk-portal>Cake</ng-template>

  <div *cdk-portal>Pie</div>
  <ng-template cdk-portal let-data> {{fruit}} - {{ data?.status }} </ng-template>

  <ng-template cdk-portal>
    <ul>
      <li *ngFor="let fruitName of fruits"> {{fruitName}} </li>
    </ul>
  </ng-template>

  <ng-template #templateRef let-data> {{fruit}} - {{ data?.status }}!</ng-template>
  `,
})
class PortalTestApp {
  @ViewChildren(CdkPortal) portals: QueryList<CdkPortal>;
  @ViewChild(CdkPortalOutlet) portalOutlet: CdkPortalOutlet;
  @ViewChild('templateRef', { read: TemplateRef }) templateRef: TemplateRef<any>;

  selectedPortal: Portal<any>|undefined;
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

// Create a real (non-test) NgModule as a workaround for
// https://github.com/angular/angular/issues/10760
const TEST_COMPONENTS = [
  PortalTestApp,
  UnboundPortalTestApp,
  ArbitraryViewContainerRefComponent,
  PizzaMsg
];

@NgModule({
  imports: [CommonModule, PortalModule],
  exports: TEST_COMPONENTS,
  declarations: TEST_COMPONENTS,
  entryComponents: TEST_COMPONENTS,
})
class PortalTestModule { }
