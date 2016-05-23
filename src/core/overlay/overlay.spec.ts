import {
  it,
  describe,
  expect,
  beforeEach,
  inject,
  fakeAsync,
  flushMicrotasks,
  beforeEachProviders,
} from '@angular/core/testing';
import {TestComponentBuilder} from '@angular/compiler/testing';
import {
  Component,
  ViewChild,
  provide, ViewContainerRef,
} from '@angular/core';
import {TemplatePortalDirective} from '../portal/portal-directives';
import {TemplatePortal, ComponentPortal} from '../portal/portal';
import {Overlay, OVERLAY_CONTAINER_TOKEN} from './overlay';
import {OverlayRef} from './overlay-ref';
import {OverlayState} from './overlay-state';
import {PositionStrategy} from './position/position-strategy';
import {OverlayPositionBuilder} from './position/overlay-position-builder';
import {ViewportRuler} from './position/viewport-ruler';


describe('Overlay', () => {
  let builder: TestComponentBuilder;
  let overlay: Overlay;
  let componentPortal: ComponentPortal;
  let templatePortal: TemplatePortal;
  let overlayContainerElement: HTMLElement;

  beforeEachProviders(() => [
    Overlay,
    OverlayPositionBuilder,
    ViewportRuler,
    provide(OVERLAY_CONTAINER_TOKEN, {
      useFactory: () => {
        overlayContainerElement = document.createElement('div');
        return overlayContainerElement;
      }
    })
  ]);

  let deps = [TestComponentBuilder, Overlay];
  beforeEach(inject(deps, fakeAsync((tcb: TestComponentBuilder, o: Overlay) => {
    builder = tcb;
    overlay = o;

    builder.createAsync(TestComponentWithTemplatePortals).then(fixture => {
      fixture.detectChanges();
      templatePortal = fixture.componentInstance.templatePortal;
      componentPortal = new ComponentPortal(PizzaMsg, fixture.componentInstance.viewContainerRef);
    });

    flushMicrotasks();
  })));

  it('should load a component into an overlay', fakeAsyncTest(() => {
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

  it('should load a template portal into an overlay', fakeAsyncTest(() => {
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

  it('should open multiple overlays', fakeAsyncTest(() => {
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

    it('should apply the positioning strategy', fakeAsyncTest(() => {
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
@Component({
  selector: 'pizza-msg',
  template: '<p>Pizza</p>',
})
class PizzaMsg {
}


/** Test-bed component that contains a TempatePortal and an ElementRef. */
@Component({
  selector: 'portal-test',
  template: `<template portal>Cake</template>`,
  directives: [TemplatePortalDirective],
})
class TestComponentWithTemplatePortals {
  @ViewChild(TemplatePortalDirective) templatePortal: TemplatePortalDirective;

  constructor(public viewContainerRef: ViewContainerRef) {
  }
}

class FakePositionStrategy implements PositionStrategy {
  apply(element: Element): Promise<void> {
    element.classList.add('fake-positioned');
    return Promise.resolve();
  }

}

function fakeAsyncTest(fn: () => void) {
  return inject([], fakeAsync(fn));
}
