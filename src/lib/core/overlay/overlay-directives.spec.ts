import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, ViewChild} from '@angular/core';
import {By} from '@angular/platform-browser';
import {ConnectedOverlayDirective, OverlayModule} from './overlay-directives';
import {OverlayContainer} from './overlay-container';
import {ConnectedPositionStrategy} from './position/connected-position-strategy';
import {ConnectedOverlayPositionChange} from './position/connected-position';


describe('Overlay directives', () => {
  let overlayContainerElement: HTMLElement;
  let fixture: ComponentFixture<ConnectedOverlayDirectiveTest>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OverlayModule.forRoot()],
      declarations: [ConnectedOverlayDirectiveTest],
      providers: [
        {provide: OverlayContainer, useFactory: () => {
          overlayContainerElement = document.createElement('div');
          return {getContainerElement: () => overlayContainerElement};
        }}
      ],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectedOverlayDirectiveTest);
    fixture.detectChanges();
  });

  it(`should attach the overlay based on the open property`, () => {
    fixture.componentInstance.isOpen = true;
    fixture.detectChanges();

    expect(overlayContainerElement.textContent).toContain('Menu content');

    fixture.componentInstance.isOpen = false;
    fixture.detectChanges();

    expect(overlayContainerElement.textContent).toBe('');
  });

  it('should destroy the overlay when the directive is destroyed', () => {
    fixture.componentInstance.isOpen = true;
    fixture.detectChanges();
    fixture.destroy();

    expect(overlayContainerElement.textContent.trim()).toBe('');
  });

  it('should use a connected position strategy with a default set of positions', () => {
    fixture.componentInstance.isOpen = true;
    fixture.detectChanges();

    let testComponent: ConnectedOverlayDirectiveTest =
        fixture.debugElement.componentInstance;
    let overlayDirective = testComponent.connectedOverlayDirective;

    let strategy =
        <ConnectedPositionStrategy> overlayDirective.overlayRef.getState().positionStrategy;
    expect(strategy).toEqual(jasmine.any(ConnectedPositionStrategy));

    let positions = strategy.positions;
    expect(positions.length).toBeGreaterThan(0);
  });

  describe('inputs', () => {

    it('should set the width', () => {
      fixture.componentInstance.width = 250;
      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      const pane = overlayContainerElement.children[0] as HTMLElement;
      expect(pane.style.width).toEqual('250px');
    });

    it('should set the height', () => {
      fixture.componentInstance.height = '100vh';
      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      const pane = overlayContainerElement.children[0] as HTMLElement;
      expect(pane.style.height).toEqual('100vh');
    });

    it('should create the backdrop if designated', () => {
      fixture.componentInstance.hasBackdrop = true;
      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      let backdrop = overlayContainerElement.querySelector('.md-overlay-backdrop');
      expect(backdrop).toBeTruthy();
    });

    it('should not create the backdrop by default', () => {
      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      let backdrop = overlayContainerElement.querySelector('.md-overlay-backdrop');
      expect(backdrop).toBeNull();
    });

    it('should set the custom backdrop class', () => {
      fixture.componentInstance.hasBackdrop = true;
      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      const backdrop = overlayContainerElement.querySelector('.md-overlay-backdrop') as HTMLElement;
      expect(backdrop.classList).toContain('md-test-class');
    });

    it('should set the offsetX', () => {
      const trigger = fixture.debugElement.query(By.css('button')).nativeElement;
      const startX = trigger.getBoundingClientRect().left;

      fixture.componentInstance.offsetX = 5;
      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      // expected x value is the starting x + offset x
      const expectedX = startX + 5;
      const pane = overlayContainerElement.children[0] as HTMLElement;
      expect(pane.style.transform).toContain(`translateX(${expectedX}px)`);
    });

    it('should set the offsetY', () => {
      const trigger = fixture.debugElement.query(By.css('button')).nativeElement;
      trigger.style.position = 'absolute';
      trigger.style.top = '30px';
      trigger.style.height = '20px';

      fixture.componentInstance.offsetY = 45;
      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      // expected y value is the starting y + trigger height + offset y
      // 30 + 20 + 45 = 95px
      const pane = overlayContainerElement.children[0] as HTMLElement;
      expect(pane.style.transform).toContain(`translateY(95px)`);
    });

  });

  describe('outputs', () => {
    it('should emit backdropClick appropriately', () => {
      fixture.componentInstance.hasBackdrop = true;
      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      const backdrop = overlayContainerElement.querySelector('.md-overlay-backdrop') as HTMLElement;
      backdrop.click();
      fixture.detectChanges();

      expect(fixture.componentInstance.backdropClicked).toBe(true);
    });

    it('should emit positionChange appropriately', () => {
      expect(fixture.componentInstance.positionChangeHandler).not.toHaveBeenCalled();
      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      expect(fixture.componentInstance.positionChangeHandler).toHaveBeenCalled();
      expect(fixture.componentInstance.positionChangeHandler.calls.mostRecent().args[0])
          .toEqual(jasmine.any(ConnectedOverlayPositionChange),
              `Expected directive to emit an instance of ConnectedOverlayPositionChange.`);
    });

  });

});


@Component({
  template: `
  <button overlay-origin #trigger="overlayOrigin">Toggle menu</button>
  <template connected-overlay [origin]="trigger" [open]="isOpen" [width]="width" [height]="height"
            [hasBackdrop]="hasBackdrop" backdropClass="md-test-class"
            (backdropClick)="backdropClicked=true" [offsetX]="offsetX" [offsetY]="offsetY"
            (positionChange)="positionChangeHandler($event)">
    <p>Menu content</p>
  </template>`,
})
class ConnectedOverlayDirectiveTest {
  isOpen = false;
  width: number | string;
  height: number | string;
  offsetX: number = 0;
  offsetY: number = 0;
  hasBackdrop: boolean;
  backdropClicked = false;
  positionChangeHandler = jasmine.createSpy('positionChangeHandler');

  @ViewChild(ConnectedOverlayDirective) connectedOverlayDirective: ConnectedOverlayDirective;
}
