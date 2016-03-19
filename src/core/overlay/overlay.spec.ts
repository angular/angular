import {
  inject,
  TestComponentBuilder,
  fakeAsync,
  flushMicrotasks,
  beforeEachProviders,
} from 'angular2/testing';
import {
  it,
  describe,
  expect,
  beforeEach,
} from '../../core/facade/testing';
import {
  Component,
  ViewChild,
  ElementRef,
  provide,
} from 'angular2/core';
import {BrowserDomAdapter} from '../platform/browser/browser_adapter';
import {TemplatePortalDirective} from '../portal/portal-directives';
import {TemplatePortal, ComponentPortal} from '../portal/portal';
import {Overlay, OVERLAY_CONTAINER_TOKEN} from './overlay';
import {DOM} from '../platform/dom/dom_adapter';
import {OverlayRef} from './overlay-ref';


export function main() {
  describe('Overlay', () => {
    BrowserDomAdapter.makeCurrent();

    let builder: TestComponentBuilder;
    let overlay: Overlay;
    let componentPortal: ComponentPortal;
    let templatePortal: TemplatePortal;
    let overlayContainerElement: Element;

    beforeEachProviders(() => [
      Overlay,
      provide(OVERLAY_CONTAINER_TOKEN, {useFactory: () => {
        overlayContainerElement = DOM.createElement('div');
        return overlayContainerElement;
      }})
    ]);

    let deps = [TestComponentBuilder, Overlay];
    beforeEach(inject(deps, fakeAsync((tcb: TestComponentBuilder, o: Overlay) => {
      builder = tcb;
      overlay = o;

      builder.createAsync(TestComponentWithTemplatePortals).then(fixture => {
        fixture.detectChanges();
        templatePortal = fixture.componentInstance.templatePortal;
        componentPortal = new ComponentPortal(PizzaMsg, fixture.componentInstance.elementRef);
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
  });
}


/** Simple component for testing ComponentPortal. */
@Component({
  selector: 'pizza-msg',
  template: '<p>Pizza</p>',
})
class PizzaMsg {}


/** Test-bed component that contains a TempatePortal and an ElementRef. */
@Component({
  selector: 'portal-test',
  template: `<template portal>Cake</template>`,
  directives: [TemplatePortalDirective],
})
class TestComponentWithTemplatePortals {
  @ViewChild(TemplatePortalDirective) templatePortal: TemplatePortalDirective;
  constructor(public elementRef: ElementRef) { }
}

function fakeAsyncTest(fn: () => void) {
  return inject([], fakeAsync(fn));
}
