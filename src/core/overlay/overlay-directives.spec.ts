import {
    it,
    describe,
    expect,
    beforeEach,
    inject,
    async,
    fakeAsync,
    flushMicrotasks,
    beforeEachProviders
} from '@angular/core/testing';
import {TestComponentBuilder, ComponentFixture} from '@angular/compiler/testing';
import {Component, provide, ViewChild} from '@angular/core';
import {ConnectedOverlayDirective, OverlayOrigin} from './overlay-directives';
import {OVERLAY_CONTAINER_TOKEN, Overlay} from './overlay';
import {ViewportRuler} from './position/viewport-ruler';
import {OverlayPositionBuilder} from './position/overlay-position-builder';
import {ConnectedPositionStrategy} from './position/connected-position-strategy';


describe('Overlay directives', () => {
  let builder: TestComponentBuilder;
  let overlayContainerElement: HTMLElement;
  let fixture: ComponentFixture<ConnectedOverlayDirectiveTest>;

  beforeEachProviders(() => [
    Overlay,
    OverlayPositionBuilder,
    ViewportRuler,
    provide(OVERLAY_CONTAINER_TOKEN, {useFactory: () => {
      overlayContainerElement = document.createElement('div');
      return overlayContainerElement;
    }})
  ]);

  beforeEach(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
    builder = tcb;
  }));

  beforeEach(async(() => {
    builder.createAsync(ConnectedOverlayDirectiveTest).then(f => {
      fixture = f;
      fixture.detectChanges();
    });
  }));

  it(`should create an overlay and attach the directive's template`, () => {
    expect(overlayContainerElement.textContent).toContain('Menu content');
  });

  it('should destroy the overlay when the directive is destroyed', fakeAsync(() => {
    fixture.destroy();
    flushMicrotasks();

    expect(overlayContainerElement.textContent.trim()).toBe('');
  }));

  it('should use a connected position strategy with a default set of positions', () => {
    let testComponent: ConnectedOverlayDirectiveTest =
        fixture.debugElement.componentInstance;
    let overlayDirective = testComponent.connectedOverlayDirective;

    let strategy =
        <ConnectedPositionStrategy> overlayDirective.overlayRef.getState().positionStrategy;
    expect(strategy) .toEqual(jasmine.any(ConnectedPositionStrategy));

    let positions = strategy.positions;
    expect(positions.length).toBeGreaterThan(0);
  });
});


@Component({
  template: `
  <button overlay-origin #trigger="overlayOrigin">Toggle menu</button>
  <template connected-overlay [origin]="trigger">
    <p>Menu content</p>
  </template>`,
  directives: [ConnectedOverlayDirective, OverlayOrigin],
})
class ConnectedOverlayDirectiveTest {
  @ViewChild(ConnectedOverlayDirective) connectedOverlayDirective: ConnectedOverlayDirective;
}
