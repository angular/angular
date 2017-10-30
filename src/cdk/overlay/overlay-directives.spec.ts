import {Component, ViewChild} from '@angular/core';
import {By} from '@angular/platform-browser';
import {ComponentFixture, TestBed, async, inject} from '@angular/core/testing';
import {Directionality} from '@angular/cdk/bidi';
import {dispatchKeyboardEvent} from '@angular/cdk/testing';
import {ESCAPE} from '@angular/cdk/keycodes';
import {CdkConnectedOverlay, OverlayModule, CdkOverlayOrigin} from './index';
import {OverlayContainer} from './overlay-container';
import {ConnectedPositionStrategy} from './position/connected-position-strategy';
import {ConnectedOverlayPositionChange} from './position/connected-position';


describe('Overlay directives', () => {
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;
  let fixture: ComponentFixture<ConnectedOverlayDirectiveTest>;
  let dir: {value: string};

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OverlayModule],
      declarations: [ConnectedOverlayDirectiveTest, ConnectedOverlayPropertyInitOrder],
      providers: [
        {provide: Directionality, useFactory: () => {
          return dir = {value: 'ltr'};
        }}
      ],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectedOverlayDirectiveTest);
    fixture.detectChanges();
  });

  beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
    overlayContainer = oc;
    overlayContainerElement = oc.getContainerElement();
  }));

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  /** Returns the current open overlay pane element. */
  function getPaneElement() {
    return overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
  }

  it(`should attach the overlay based on the open property`, () => {
    fixture.componentInstance.isOpen = true;
    fixture.detectChanges();

    expect(overlayContainerElement.textContent).toContain('Menu content');
    expect(getPaneElement().style.pointerEvents)
      .toBe('auto', 'Expected the overlay pane to enable pointerEvents when attached.');

    fixture.componentInstance.isOpen = false;
    fixture.detectChanges();

    expect(overlayContainerElement.textContent).toBe('');
    expect(getPaneElement().style.pointerEvents)
      .toBe('none', 'Expected the overlay pane to disable pointerEvents when detached.');
  });

  it('should destroy the overlay when the directive is destroyed', () => {
    fixture.componentInstance.isOpen = true;
    fixture.detectChanges();
    fixture.destroy();

    expect(overlayContainerElement.textContent!.trim()).toBe('');
    expect(getPaneElement())
      .toBeFalsy('Expected the overlay pane element to be removed when disposed.');
  });

  it('should use a connected position strategy with a default set of positions', () => {
    fixture.componentInstance.isOpen = true;
    fixture.detectChanges();

    let testComponent: ConnectedOverlayDirectiveTest =
        fixture.debugElement.componentInstance;
    let overlayDirective = testComponent.connectedOverlayDirective;

    let strategy =
        <ConnectedPositionStrategy> overlayDirective.overlayRef.getConfig().positionStrategy;
    expect(strategy instanceof ConnectedPositionStrategy).toBe(true);

    let positions = strategy.positions;
    expect(positions.length).toBeGreaterThan(0);
  });

  it('should set and update the `dir` attribute', () => {
    dir.value = 'rtl';
    fixture.componentInstance.isOpen = true;
    fixture.detectChanges();

    expect(getPaneElement().getAttribute('dir')).toBe('rtl');

    fixture.componentInstance.isOpen = false;
    fixture.detectChanges();

    dir.value = 'ltr';
    fixture.componentInstance.isOpen = true;
    fixture.detectChanges();

    expect(getPaneElement().getAttribute('dir')).toBe('ltr');
  });

  it('should close when pressing escape', () => {
    fixture.componentInstance.isOpen = true;
    fixture.detectChanges();

    dispatchKeyboardEvent(document, 'keydown', ESCAPE);
    fixture.detectChanges();

    expect(overlayContainerElement.textContent!.trim()).toBe('',
        'Expected overlay to have been detached.');
  });

  it('should not depend on the order in which the `origin` and `open` are set', async(() => {
    fixture.destroy();

    const propOrderFixture = TestBed.createComponent(ConnectedOverlayPropertyInitOrder);
    propOrderFixture.detectChanges();

    const overlayDirective = propOrderFixture.componentInstance.connectedOverlayDirective;

    expect(() => {
      overlayDirective.open = true;
      overlayDirective.origin = propOrderFixture.componentInstance.trigger;
      propOrderFixture.detectChanges();
    }).not.toThrow();
  }));

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

    it('should set the min width', () => {
      fixture.componentInstance.minWidth = 250;
      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      const pane = overlayContainerElement.children[0] as HTMLElement;
      expect(pane.style.minWidth).toEqual('250px');
    });

    it('should set the min height', () => {
      fixture.componentInstance.minHeight = '500px';
      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      const pane = overlayContainerElement.children[0] as HTMLElement;
      expect(pane.style.minHeight).toEqual('500px');
    });

    it('should create the backdrop if designated', () => {
      fixture.componentInstance.hasBackdrop = true;
      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      let backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop');
      expect(backdrop).toBeTruthy();
    });

    it('should not create the backdrop by default', () => {
      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      let backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop');
      expect(backdrop).toBeNull();
    });

    it('should set the custom backdrop class', () => {
      fixture.componentInstance.hasBackdrop = true;
      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      const backdrop =
          overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;
      expect(backdrop.classList).toContain('mat-test-class');
    });

    it('should set the offsetX', () => {
      const trigger = fixture.debugElement.query(By.css('button')).nativeElement;
      const startX = trigger.getBoundingClientRect().left;

      fixture.componentInstance.offsetX = 5;
      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      const pane = overlayContainerElement.children[0] as HTMLElement;

      expect(pane.style.left)
          .toBe(startX + 5 + 'px',
              `Expected overlay translateX to equal the original X + the offsetX.`);

      fixture.componentInstance.isOpen = false;
      fixture.detectChanges();

      fixture.componentInstance.offsetX = 15;
      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      expect(pane.style.left)
          .toBe(startX + 15 + 'px',
              `Expected overlay directive to reflect new offsetX if it changes.`);
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

      expect(pane.style.top)
          .toBe('95px', `Expected overlay translateY to equal the start Y + height + offsetY.`);

      fixture.componentInstance.isOpen = false;
      fixture.detectChanges();

      fixture.componentInstance.offsetY = 55;
      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();
      expect(pane.style.top)
          .toBe('105px', `Expected overlay directive to reflect new offsetY if it changes.`);
    });

  });

  describe('outputs', () => {
    it('should emit backdropClick appropriately', () => {
      fixture.componentInstance.hasBackdrop = true;
      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      const backdrop =
          overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;
      backdrop.click();
      fixture.detectChanges();

      expect(fixture.componentInstance.backdropClicked).toBe(true);
    });

    it('should emit positionChange appropriately', () => {
      expect(fixture.componentInstance.positionChangeHandler).not.toHaveBeenCalled();
      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      expect(fixture.componentInstance.positionChangeHandler).toHaveBeenCalled();

      const latestCall = fixture.componentInstance.positionChangeHandler.calls.mostRecent();

      expect(latestCall.args[0] instanceof ConnectedOverlayPositionChange)
          .toBe(true, `Expected directive to emit an instance of ConnectedOverlayPositionChange.`);
    });

    it('should emit attach and detach appropriately', () => {
      expect(fixture.componentInstance.attachHandler).not.toHaveBeenCalled();
      expect(fixture.componentInstance.detachHandler).not.toHaveBeenCalled();
      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      expect(fixture.componentInstance.attachHandler).toHaveBeenCalled();
      expect(fixture.componentInstance.attachResult instanceof HTMLElement)
          .toBe(true, `Expected pane to be populated with HTML elements when attach was called.`);
      expect(fixture.componentInstance.detachHandler).not.toHaveBeenCalled();

      fixture.componentInstance.isOpen = false;
      fixture.detectChanges();
      expect(fixture.componentInstance.detachHandler).toHaveBeenCalled();
    });

  });

});


@Component({
  template: `
  <button cdk-overlay-origin #trigger="cdkOverlayOrigin">Toggle menu</button>
  <ng-template cdk-connected-overlay [open]="isOpen" [width]="width" [height]="height"
            [origin]="trigger"
            [hasBackdrop]="hasBackdrop" backdropClass="mat-test-class"
            (backdropClick)="backdropClicked=true" [offsetX]="offsetX" [offsetY]="offsetY"
            (positionChange)="positionChangeHandler($event)" (attach)="attachHandler()"
            (detach)="detachHandler()" [minWidth]="minWidth" [minHeight]="minHeight">
    <p>Menu content</p>
  </ng-template>`,
})
class ConnectedOverlayDirectiveTest {
  isOpen = false;
  width: number | string;
  height: number | string;
  minWidth: number | string;
  minHeight: number | string;
  offsetX: number = 0;
  offsetY: number = 0;
  hasBackdrop: boolean;
  backdropClicked = false;
  positionChangeHandler = jasmine.createSpy('positionChangeHandler');
  attachHandler = jasmine.createSpy('attachHandler').and.callFake(() => {
    this.attachResult =
        this.connectedOverlayDirective.overlayRef.overlayElement.querySelector('p') as HTMLElement;
  });
  detachHandler = jasmine.createSpy('detachHandler');
  attachResult: HTMLElement;

  @ViewChild(CdkConnectedOverlay) connectedOverlayDirective: CdkConnectedOverlay;
}

@Component({
  template: `
  <button cdk-overlay-origin #trigger="cdkOverlayOrigin">Toggle menu</button>
  <ng-template cdk-connected-overlay>Menu content</ng-template>`,
})
class ConnectedOverlayPropertyInitOrder {
  @ViewChild(CdkConnectedOverlay) connectedOverlayDirective: CdkConnectedOverlay;
  @ViewChild('trigger') trigger: CdkOverlayOrigin;
}

