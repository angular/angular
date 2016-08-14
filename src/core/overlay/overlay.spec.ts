import {inject, fakeAsync, flushMicrotasks, TestBed, async} from '@angular/core/testing';
import {NgModule, Component, ViewChild, ViewContainerRef} from '@angular/core';
import {TemplatePortalDirective, PortalModule} from '../portal/portal-directives';
import {TemplatePortal, ComponentPortal} from '../portal/portal';
import {Overlay} from './overlay';
import {OverlayContainer} from './overlay-container';
import {OverlayRef} from './overlay-ref';
import {OverlayState} from './overlay-state';
import {PositionStrategy} from './position/position-strategy';
import {OverlayModule} from './overlay-directives';


describe('Overlay', () => {
  let overlay: Overlay;
  let componentPortal: ComponentPortal<PizzaMsg>;
  let templatePortal: TemplatePortal;
  let overlayContainerElement: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [OverlayModule, PortalModule, OverlayTestModule],
      providers: [
        {provide: OverlayContainer, useFactory: () => {
          overlayContainerElement = document.createElement('div');
          return {getContainerElement: () => overlayContainerElement};
        }}
      ]
    });

    TestBed.compileComponents();
  }));

  beforeEach(fakeAsync(inject([Overlay], (o: Overlay) => {
    overlay = o;

    let fixture = TestBed.createComponent(TestComponentWithTemplatePortals);
    fixture.detectChanges();
    templatePortal = fixture.componentInstance.templatePortal;
    componentPortal = new ComponentPortal(PizzaMsg, fixture.componentInstance.viewContainerRef);

    flushMicrotasks();
  })));

  it('should load a component into an overlay', fakeAsync(() => {
    let overlayRef: OverlayRef;

    overlay.create().then(ref => {
      overlayRef = ref;
      overlayRef.attach(componentPortal);
    });

    flushMicrotasks();

    expect(overlayContainerElement.textContent).toContain('Pizza');

    overlayRef.dispose();
    expect(overlayContainerElement.childNodes.length).toBe(0);
    expect(overlayContainerElement.textContent).toBe('');
  }));

  it('should load a template portal into an overlay', fakeAsync(() => {
    let overlayRef: OverlayRef;

    overlay.create().then(ref => {
      overlayRef = ref;
      overlayRef.attach(templatePortal);
    });

    flushMicrotasks();

    expect(overlayContainerElement.textContent).toContain('Cake');

    overlayRef.dispose();
    expect(overlayContainerElement.childNodes.length).toBe(0);
    expect(overlayContainerElement.textContent).toBe('');
  }));

  it('should open multiple overlays', fakeAsync(() => {
    let pizzaOverlayRef: OverlayRef;
    let cakeOverlayRef: OverlayRef;

    overlay.create().then(ref => {
      pizzaOverlayRef = ref;
      pizzaOverlayRef.attach(componentPortal);
    });

    flushMicrotasks();

    overlay.create().then(ref => {
      cakeOverlayRef = ref;
      cakeOverlayRef.attach(templatePortal);
    });

    flushMicrotasks();

    expect(overlayContainerElement.childNodes.length).toBe(2);
    expect(overlayContainerElement.textContent).toContain('Pizza');
    expect(overlayContainerElement.textContent).toContain('Cake');

    pizzaOverlayRef.dispose();
    expect(overlayContainerElement.childNodes.length).toBe(1);
    expect(overlayContainerElement.textContent).toContain('Cake');

    cakeOverlayRef.dispose();
    expect(overlayContainerElement.childNodes.length).toBe(0);
    expect(overlayContainerElement.textContent).toBe('');
  }));

  describe('applyState', () => {
    let state: OverlayState;

    beforeEach(() => {
      state = new OverlayState();
    });

    it('should apply the positioning strategy', fakeAsync(() => {
      state.positionStrategy = new FakePositionStrategy();

      overlay.create(state).then(ref => {
        ref.attach(componentPortal);
      });

      flushMicrotasks();

      expect(overlayContainerElement.querySelectorAll('.fake-positioned').length).toBe(1);
    }));
  });
});


/** Simple component for testing ComponentPortal. */
@Component({template: '<p>Pizza</p>'})
class PizzaMsg { }


/** Test-bed component that contains a TempatePortal and an ElementRef. */
@Component({template: `<template portal>Cake</template>`})
class TestComponentWithTemplatePortals {
  @ViewChild(TemplatePortalDirective) templatePortal: TemplatePortalDirective;

  constructor(public viewContainerRef: ViewContainerRef) { }
}

// Create a real (non-test) NgModule as a workaround for
// https://github.com/angular/angular/issues/10760
const TEST_COMPONENTS = [PizzaMsg, TestComponentWithTemplatePortals];
@NgModule({
  imports: [OverlayModule, PortalModule],
  exports: TEST_COMPONENTS,
  declarations: TEST_COMPONENTS,
  entryComponents: TEST_COMPONENTS,
})
class OverlayTestModule { }

class FakePositionStrategy implements PositionStrategy {
  apply(element: Element): Promise<void> {
    element.classList.add('fake-positioned');
    return Promise.resolve();
  }

}

