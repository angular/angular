import {
  inject,
  fakeAsync,
  flushMicrotasks,
  ComponentFixture,
  TestBed,
  async,
} from '@angular/core/testing';
import {
  NgModule,
  Component,
  ViewChildren,
  QueryList,
  ViewContainerRef,
  ComponentFactoryResolver,
  Optional,
  Injector,
} from '@angular/core';
import {TemplatePortalDirective, PortalModule} from './portal-directives';
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

    beforeEach(fakeAsync(() => {
      fixture = TestBed.createComponent(PortalTestApp);
    }));

    it('should load a component into the portal', fakeAsync(() => {
      // Set the selectedHost to be a ComponentPortal.
      let testAppComponent = fixture.debugElement.componentInstance;
      testAppComponent.selectedPortal = new ComponentPortal(PizzaMsg);
      fixture.detectChanges();

      // Flush the attachment of the Portal.
      flushMicrotasks();

      // Expect that the content of the attached portal is present.
      let hostContainer = fixture.nativeElement.querySelector('.portal-container');
      expect(hostContainer.textContent).toContain('Pizza');
    }));

    it('should load a component into the portal with a given injector', fakeAsync(() => {
      // Create a custom injector for the component.
      let chocolateInjector = new ChocolateInjector(fixture.componentInstance.injector);

      // Set the selectedHost to be a ComponentPortal.
      let testAppComponent = fixture.debugElement.componentInstance;
      testAppComponent.selectedPortal = new ComponentPortal(PizzaMsg, null, chocolateInjector);
      fixture.detectChanges();

      // Flush the attachment of the Portal.
      flushMicrotasks();
      fixture.detectChanges();

      // Expect that the content of the attached portal is present.
      let hostContainer = fixture.nativeElement.querySelector('.portal-container');
      expect(hostContainer.textContent).toContain('Pizza');
      expect(hostContainer.textContent).toContain('Chocolate');
    }));

    it('should load a <template> portal', fakeAsync(() => {
      let testAppComponent = fixture.debugElement.componentInstance;

      // Detect changes initially so that the component's ViewChildren are resolved.
      fixture.detectChanges();

      // Set the selectedHost to be a TemplatePortal.
      testAppComponent.selectedPortal = testAppComponent.cakePortal;
      fixture.detectChanges();

      // Flush the attachment of the Portal.
      flushMicrotasks();

      // Expect that the content of the attached portal is present.
      let hostContainer = fixture.nativeElement.querySelector('.portal-container');
      expect(hostContainer.textContent).toContain('Cake');
    }));

    it('should load a <template> portal with the `*` sugar', fakeAsync(() => {
      let testAppComponent = fixture.debugElement.componentInstance;

      // Detect changes initially so that the component's ViewChildren are resolved.
      fixture.detectChanges();

      // Set the selectedHost to be a TemplatePortal (with the `*` syntax).
      testAppComponent.selectedPortal = testAppComponent.piePortal;
      fixture.detectChanges();

      // Flush the attachment of the Portal.
      flushMicrotasks();

      // Expect that the content of the attached portal is present.
      let hostContainer = fixture.nativeElement.querySelector('.portal-container');
      expect(hostContainer.textContent).toContain('Pie');
    }));

    it('should load a <template> portal with a binding', fakeAsync(() => {
      let testAppComponent = fixture.debugElement.componentInstance;

      // Detect changes initially so that the component's ViewChildren are resolved.
      fixture.detectChanges();

      // Set the selectedHost to be a TemplatePortal.
      testAppComponent.selectedPortal = testAppComponent.portalWithBinding;
      fixture.detectChanges();

      // Flush the attachment of the Portal.
      flushMicrotasks();

      // Now that the portal is attached, change detection has to happen again in order
      // for the bindings to update.
      fixture.detectChanges();

      // Expect that the content of the attached portal is present.
      let hostContainer = fixture.nativeElement.querySelector('.portal-container');
      expect(hostContainer.textContent).toContain('Banana');

      // When updating the binding value.
      testAppComponent.fruit = 'Mango';
      fixture.detectChanges();

      // Expect the new value to be reflected in the rendered output.
      expect(hostContainer.textContent).toContain('Mango');
    }));

    it('should change the attached portal', fakeAsync(() => {
      let testAppComponent = fixture.debugElement.componentInstance;

      // Detect changes initially so that the component's ViewChildren are resolved.
      fixture.detectChanges();

      // Set the selectedHost to be a ComponentPortal.
      testAppComponent.selectedPortal = testAppComponent.piePortal;
      fixture.detectChanges();

      // Flush the attachment of the Portal.
      flushMicrotasks();
      fixture.detectChanges();

      // Expect that the content of the attached portal is present.
      let hostContainer = fixture.nativeElement.querySelector('.portal-container');
      expect(hostContainer.textContent).toContain('Pie');

      testAppComponent.selectedPortal = new ComponentPortal(PizzaMsg);
      fixture.detectChanges();

      flushMicrotasks();

      expect(hostContainer.textContent).toContain('Pizza');
    }));
  });

  describe('DomPortalHost', function () {
    let componentFactoryResolver: ComponentFactoryResolver;
    let someViewContainerRef: ViewContainerRef;
    let someInjector: Injector;
    let someDomElement: HTMLElement;
    let host: DomPortalHost;

    beforeEach(inject([ComponentFactoryResolver], (dcl: ComponentFactoryResolver) => {
      componentFactoryResolver = dcl;
    }));

    beforeEach(() => {
      someDomElement = document.createElement('div');
      host = new DomPortalHost(someDomElement, componentFactoryResolver);

      let fixture = TestBed.createComponent(ArbitraryViewContainerRefComponent);
      someViewContainerRef = fixture.componentInstance.viewContainerRef;
      someInjector = fixture.componentInstance.injector;
    });

    it('should attach and detach a component portal', fakeAsync(() => {
      let portal = new ComponentPortal(PizzaMsg, someViewContainerRef);

      let componentInstance: PizzaMsg;
      portal.attach(host).then(ref => {
        componentInstance = ref.instance;
      });

      flushMicrotasks();

      expect(componentInstance).toEqual(jasmine.any(PizzaMsg));
      expect(someDomElement.textContent).toContain('Pizza');

      host.detach();
      flushMicrotasks();

      expect(someDomElement.innerHTML).toBe('');
    }));

    it('should attach and detach a component portal with a given injector', fakeAsync(() => {
      let fixture = TestBed.createComponent(ArbitraryViewContainerRefComponent);
      someViewContainerRef = fixture.componentInstance.viewContainerRef;
      someInjector = fixture.componentInstance.injector;

      let chocolateInjector = new ChocolateInjector(someInjector);
      let portal = new ComponentPortal(PizzaMsg, someViewContainerRef, chocolateInjector);

      let componentInstance: PizzaMsg;
      portal.attach(host).then(ref => {
        componentInstance = ref.instance;
      });

      flushMicrotasks();
      fixture.detectChanges();

      expect(componentInstance).toEqual(jasmine.any(PizzaMsg));
      expect(someDomElement.textContent).toContain('Pizza');
      expect(someDomElement.textContent).toContain('Chocolate');

      host.detach();
      flushMicrotasks();

      expect(someDomElement.innerHTML).toBe('');
    }));

    it('should attach and detach a template portal', fakeAsync(() => {
      let fixture = TestBed.createComponent(PortalTestApp);
      fixture.detectChanges();

      fixture.componentInstance.cakePortal.attach(host);
      flushMicrotasks();

      expect(someDomElement.textContent).toContain('Cake');
    }));

    it('should attach and detach a template portal with a binding', fakeAsync(() => {
      let fixture = TestBed.createComponent(PortalTestApp);

      let testAppComponent = fixture.debugElement.componentInstance;

      // Detect changes initially so that the component's ViewChildren are resolved.
      fixture.detectChanges();

      // Attach the TemplatePortal.
      testAppComponent.portalWithBinding.attach(host);
      fixture.detectChanges();

      // Flush the attachment of the Portal.
      flushMicrotasks();

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
    }));

    it('should change the attached portal', fakeAsync(() => {
      let fixture = TestBed.createComponent(ArbitraryViewContainerRefComponent);
      someViewContainerRef = fixture.componentInstance.viewContainerRef;

      let appFixture = TestBed.createComponent(PortalTestApp);
      appFixture.detectChanges();

      appFixture.componentInstance.piePortal.attach(host);
      flushMicrotasks();

      expect(someDomElement.textContent).toContain('Pie');

      host.detach();
      flushMicrotasks();

      host.attach(new ComponentPortal(PizzaMsg, someViewContainerRef));
      flushMicrotasks();

      expect(someDomElement.textContent).toContain('Pizza');
    }));
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
    return token === Chocolate ? new Chocolate() : this.parentInjector.get(token);
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
    <template [portalHost]="selectedPortal"></template>
  </div>

  <template portal>Cake</template>

  <div *portal>Pie</div>

  <template portal> {{fruit}} </template>`,
})
class PortalTestApp {
  @ViewChildren(TemplatePortalDirective) portals: QueryList<TemplatePortalDirective>;
  selectedPortal: Portal<any>;
  fruit: string = 'Banana';

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
}

// Create a real (non-test) NgModule as a workaround for
// https://github.com/angular/angular/issues/10760
const TEST_COMPONENTS = [PortalTestApp, ArbitraryViewContainerRefComponent, PizzaMsg];
@NgModule({
  imports: [PortalModule],
  exports: TEST_COMPONENTS,
  declarations: TEST_COMPONENTS,
  entryComponents: TEST_COMPONENTS,
})
class PortalTestModule { }
