import {
  inject,
  ComponentFixture,
  TestComponentBuilder,
} from 'angular2/testing';
import {
  it,
  iit,
  describe,
  ddescribe,
  expect,
  beforeEach,
} from '../../core/facade/testing';
import {Component, ViewChildren, QueryList} from 'angular2/core';
import {TemplatePortalDirective} from './portal-directives';
import {Portal} from './portal';
import {ComponentPortal} from './portal';
import {PortalHostDirective} from './portal-directives';
import {fakeAsync} from 'angular2/testing';
import {flushMicrotasks} from 'angular2/testing';


export function main() {
  describe('Portal directives', () => {
    let builder: TestComponentBuilder;

    beforeEach(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
      builder = tcb;
    }));

    it('should load a component into the portal', fakeAsyncTest(() => {
      let appFixture: ComponentFixture;

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

    it('should load a <template> portal', fakeAsyncTest(() => {
      let appFixture: ComponentFixture;

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

    it('should load a <template> portal with the `*` sugar', fakeAsyncTest(() => {
      let appFixture: ComponentFixture;

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

    it('should load a <template> portal with a binding', fakeAsyncTest(() => {
      let appFixture: ComponentFixture;

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
    }));

    it('should load a <template> portal with extra locals', fakeAsyncTest(() => {
      let appFixture: ComponentFixture;

      builder.createAsync(PortalTestApp).then(fixture => {
        appFixture = fixture;
      });

      // Flush the async creation of the PortalTestApp.
      flushMicrotasks();

      let testAppComponent = appFixture.debugElement.componentInstance;

      // Detect changes initially so that the component's ViewChildren are resolved.
      appFixture.detectChanges();

      let locals = new Map<string, string>();
      locals.set('appetizer', 'Samosa');

      let templatePortal = testAppComponent.portalWithLocals;
      templatePortal.locals = locals;

      // Set the selectedHost to be a TemplatePortal.
      testAppComponent.selectedPortal = templatePortal;
      appFixture.detectChanges();

      // Flush the attachment of the Portal.
      flushMicrotasks();

      // Now that the portal is attached, change detection has to happen again in order
      // for the bindings to update.
      appFixture.detectChanges();

      // Expect that the content of the attached portal is present.
      let hostContainer = appFixture.nativeElement.querySelector('.portal-container');
      expect(hostContainer.textContent).toContain('Samosa');
    }));

    it('should change the attached portal', fakeAsyncTest(() => {
      let appFixture: ComponentFixture;

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
}


/** Simple component for testing ComponentPortal. */
@Component({
  selector: 'pizza-msg',
  template: '<p>Pizza</p>',
})
class PizzaMsg {}


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

  <template portal #yum="appetizer">{{yum}}</template>
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

  get portalWithLocals() {
    return this.portals.last;
  }
}

function fakeAsyncTest(fn: () => void) {
  return inject([], fakeAsync(fn));
}
