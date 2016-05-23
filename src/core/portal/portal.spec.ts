import {
  it,
  describe,
  expect,
  beforeEach,
  inject,
  fakeAsync,
  flushMicrotasks
} from '@angular/core/testing';
import {TestComponentBuilder, ComponentFixture} from '@angular/compiler/testing';
import {
  Component,
  ViewChildren,
  QueryList,
  ViewContainerRef,
  ComponentResolver
} from '@angular/core';
import {TemplatePortalDirective, PortalHostDirective} from './portal-directives';
import {Portal, ComponentPortal} from './portal';
import {DomPortalHost} from './dom-portal-host';


describe('Portals', () => {
  let builder: TestComponentBuilder;

  beforeEach(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
    builder = tcb;
  }));

  describe('PortalHostDirective', () => {
    it('should load a component into the portal', fakeAsync(() => {
      let appFixture: ComponentFixture<PortalTestApp>;

      builder.createAsync(PortalTestApp).then(fixture => {
        appFixture = fixture;
      });

      // Flush the async creation of the PortalTestApp.
      flushMicrotasks();

      // Set the selectedHost to be a ComponentPortal.
      let testAppComponent = appFixture.debugElement.componentInstance;
      testAppComponent.selectedPortal = new ComponentPortal(PizzaMsg);
      appFixture.detectChanges();

      // Flush the attachment of the Portal.
      flushMicrotasks();

      // Expect that the content of the attached portal is present.
      let hostContainer = appFixture.nativeElement.querySelector('.portal-container');
      expect(hostContainer.textContent).toContain('Pizza');
    }));

    it('should load a <template> portal', fakeAsync(() => {
      let appFixture: ComponentFixture<PortalTestApp>;

      builder.createAsync(PortalTestApp).then(fixture => {
        appFixture = fixture;
      });

      // Flush the async creation of the PortalTestApp.
      flushMicrotasks();

      let testAppComponent = appFixture.debugElement.componentInstance;

      // Detect changes initially so that the component's ViewChildren are resolved.
      appFixture.detectChanges();

      // Set the selectedHost to be a TemplatePortal.
      testAppComponent.selectedPortal = testAppComponent.cakePortal;
      appFixture.detectChanges();

      // Flush the attachment of the Portal.
      flushMicrotasks();

      // Expect that the content of the attached portal is present.
      let hostContainer = appFixture.nativeElement.querySelector('.portal-container');
      expect(hostContainer.textContent).toContain('Cake');
    }));

    it('should load a <template> portal with the `*` sugar', fakeAsync(() => {
      let appFixture: ComponentFixture<PortalTestApp>;

      builder.createAsync(PortalTestApp).then(fixture => {
        appFixture = fixture;
      });

      // Flush the async creation of the PortalTestApp.
      flushMicrotasks();

      let testAppComponent = appFixture.debugElement.componentInstance;

      // Detect changes initially so that the component's ViewChildren are resolved.
      appFixture.detectChanges();

      // Set the selectedHost to be a TemplatePortal (with the `*` syntax).
      testAppComponent.selectedPortal = testAppComponent.piePortal;
      appFixture.detectChanges();

      // Flush the attachment of the Portal.
      flushMicrotasks();

      // Expect that the content of the attached portal is present.
      let hostContainer = appFixture.nativeElement.querySelector('.portal-container');
      expect(hostContainer.textContent).toContain('Pie');
    }));

    it('should load a <template> portal with a binding', fakeAsync(() => {
      let appFixture: ComponentFixture<PortalTestApp>;

      builder.createAsync(PortalTestApp).then(fixture => {
        appFixture = fixture;
      });

      // Flush the async creation of the PortalTestApp.
      flushMicrotasks();

      let testAppComponent = appFixture.debugElement.componentInstance;

      // Detect changes initially so that the component's ViewChildren are resolved.
      appFixture.detectChanges();

      // Set the selectedHost to be a TemplatePortal.
      testAppComponent.selectedPortal = testAppComponent.portalWithBinding;
      appFixture.detectChanges();

      // Flush the attachment of the Portal.
      flushMicrotasks();

      // Now that the portal is attached, change detection has to happen again in order
      // for the bindings to update.
      appFixture.detectChanges();

      // Expect that the content of the attached portal is present.
      let hostContainer = appFixture.nativeElement.querySelector('.portal-container');
      expect(hostContainer.textContent).toContain('Banana');

      // When updating the binding value.
      testAppComponent.fruit = 'Mango';
      appFixture.detectChanges();

      // Expect the new value to be reflected in the rendered output.
      expect(hostContainer.textContent).toContainError('Mango');
    }));

    it('should change the attached portal', fakeAsync(() => {
      let appFixture: ComponentFixture<PortalTestApp>;

      builder.createAsync(PortalTestApp).then(fixture => {
        appFixture = fixture;
      });

      // Flush the async creation of the PortalTestApp.
      flushMicrotasks();

      let testAppComponent = appFixture.debugElement.componentInstance;

      // Detect changes initially so that the component's ViewChildren are resolved.
      appFixture.detectChanges();

      // Set the selectedHost to be a ComponentPortal.
      testAppComponent.selectedPortal = testAppComponent.piePortal;
      appFixture.detectChanges();

      // Flush the attachment of the Portal.
      flushMicrotasks();
      appFixture.detectChanges();

      // Expect that the content of the attached portal is present.
      let hostContainer = appFixture.nativeElement.querySelector('.portal-container');
      expect(hostContainer.textContent).toContain('Pie');

      testAppComponent.selectedPortal = new ComponentPortal(PizzaMsg);
      appFixture.detectChanges();

      flushMicrotasks();

      expect(hostContainer.textContent).toContain('Pizza');
    }));
  });

  describe('DomPortalHost', function () {
    let componentLoader: ComponentResolver;
    let someViewContainerRef: ViewContainerRef;
    let someDomElement: HTMLElement;
    let host: DomPortalHost;

    beforeEach(inject([ComponentResolver], (dcl: ComponentResolver) => {
      componentLoader = dcl;
    }));

    beforeEach(() => {
      someDomElement = document.createElement('div');
      host = new DomPortalHost(someDomElement, componentLoader);
    });

    it('should attach and detach a component portal', fakeAsync(() => {
      builder.createAsync(ArbitraryViewContainerRefComponent).then(fixture => {
        someViewContainerRef = fixture.componentInstance.viewContainerRef;
      });

      flushMicrotasks();

      let portal = new ComponentPortal(PizzaMsg, someViewContainerRef);

      let componentInstance: PizzaMsg;
      portal.attach(host).then(ref => {
        componentInstance = ref.instance;
      });

      flushMicrotasks();

      expect(componentInstance).toBeAnInstanceOf(PizzaMsg);
      expect(someDomElement.textContent).toContain('Pizza');

      host.detach();
      flushMicrotasks();

      expect(someDomElement.innerHTML).toBe('');
    }));

    it('should attach and detach a template portal', fakeAsync(() => {
      let appFixture: ComponentFixture<PortalTestApp>;

      builder.createAsync(PortalTestApp).then(fixture => {
        appFixture = fixture;
      });

      // Flush the async creation of the PortalTestApp.
      flushMicrotasks();
      appFixture.detectChanges();

      appFixture.componentInstance.cakePortal.attach(host);
      flushMicrotasks();

      expect(someDomElement.textContent).toContain('Cake');
    }));

    it('should attach and detach a template portal with a binding', fakeAsync(() => {
      let appFixture: ComponentFixture<PortalTestApp>;
      builder.createAsync(PortalTestApp).then(fixture => {
        appFixture = fixture;
      });

      // Flush the async creation of the PortalTestApp.
      flushMicrotasks();

      let testAppComponent = appFixture.debugElement.componentInstance;

      // Detect changes initially so that the component's ViewChildren are resolved.
      appFixture.detectChanges();

      // Attach the TemplatePortal.
      testAppComponent.portalWithBinding.attach(host);
      appFixture.detectChanges();

      // Flush the attachment of the Portal.
      flushMicrotasks();

      // Now that the portal is attached, change detection has to happen again in order
      // for the bindings to update.
      appFixture.detectChanges();

      // Expect that the content of the attached portal is present.
      expect(someDomElement.textContent).toContain('Banana');

      // When updating the binding value.
      testAppComponent.fruit = 'Mango';
      appFixture.detectChanges();

      // Expect the new value to be reflected in the rendered output.
      expect(someDomElement.textContent).toContainError('Mango');

      host.detach();
      expect(someDomElement.innerHTML).toBe('');
    }));

    it('should change the attached portal', fakeAsync(() => {
      builder.createAsync(ArbitraryViewContainerRefComponent).then(fixture => {
        someViewContainerRef = fixture.componentInstance.viewContainerRef;
      });

      flushMicrotasks();

      let appFixture: ComponentFixture<PortalTestApp>;

      builder.createAsync(PortalTestApp).then(fixture => {
        appFixture = fixture;
      });

      // Flush the async creation of the PortalTestApp.
      flushMicrotasks();
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


/** Simple component for testing ComponentPortal. */
@Component({
  selector: 'pizza-msg',
  template: '<p>Pizza</p>',
})
class PizzaMsg {
}

/** Simple component to grab an arbitrary ViewContainerRef */
@Component({
  selector: 'some-placeholder',
  template: '<p>Hello</p>'
})
class ArbitraryViewContainerRefComponent {
  constructor(public viewContainerRef: ViewContainerRef) {
  }
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

  <template portal> {{fruit}} </template>
  `,
  directives: [PortalHostDirective, TemplatePortalDirective],
})
class PortalTestApp {
  @ViewChildren(TemplatePortalDirective) portals: QueryList<TemplatePortalDirective>;
  selectedPortal: Portal<any>;
  fruit: string = 'Banana';

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
