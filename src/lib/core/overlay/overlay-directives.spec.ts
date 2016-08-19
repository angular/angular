import {async, fakeAsync, flushMicrotasks, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, ViewChild} from '@angular/core';
import {ConnectedOverlayDirective, OverlayModule} from './overlay-directives';
import {OverlayContainer} from './overlay-container';
import {ConnectedPositionStrategy} from './position/connected-position-strategy';


describe('Overlay directives', () => {
  let overlayContainerElement: HTMLElement;
  let fixture: ComponentFixture<ConnectedOverlayDirectiveTest>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [OverlayModule],
      declarations: [ConnectedOverlayDirectiveTest],
      providers: [
        {provide: OverlayContainer, useFactory: () => {
          overlayContainerElement = document.createElement('div');
          return {getContainerElement: () => overlayContainerElement};
        }}
      ],
    });
  }));

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ConnectedOverlayDirectiveTest);
    fixture.detectChanges();
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
})
class ConnectedOverlayDirectiveTest {
  @ViewChild(ConnectedOverlayDirective) connectedOverlayDirective: ConnectedOverlayDirective;
}
