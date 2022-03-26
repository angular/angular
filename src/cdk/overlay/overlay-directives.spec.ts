import {Component, ElementRef, ViewChild} from '@angular/core';
import {By} from '@angular/platform-browser';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
  inject,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import {Directionality} from '@angular/cdk/bidi';
import {dispatchKeyboardEvent, createKeyboardEvent, dispatchEvent} from '../testing/private';
import {ESCAPE, A} from '@angular/cdk/keycodes';
import {
  Overlay,
  CdkConnectedOverlay,
  OverlayModule,
  CdkOverlayOrigin,
  ScrollDispatcher,
  ScrollStrategy,
} from './index';
import {OverlayContainer} from './overlay-container';
import {
  ConnectedOverlayPositionChange,
  ConnectionPositionPair,
} from './position/connected-position';
import {
  FlexibleConnectedPositionStrategy,
  FlexibleConnectedPositionStrategyOrigin,
} from './position/flexible-connected-position-strategy';
import {Subject} from 'rxjs';

describe('Overlay directives', () => {
  let overlay: Overlay;
  let overlayContainerElement: HTMLElement;
  let fixture: ComponentFixture<ConnectedOverlayDirectiveTest>;
  let dir: {value: string};
  let scrolledSubject = new Subject();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OverlayModule],
      declarations: [ConnectedOverlayDirectiveTest, ConnectedOverlayPropertyInitOrder],
      providers: [
        {provide: Directionality, useFactory: () => (dir = {value: 'ltr'})},
        {
          provide: ScrollDispatcher,
          useFactory: () => ({
            scrolled: () => scrolledSubject,
          }),
        },
      ],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConnectedOverlayDirectiveTest);
    fixture.detectChanges();
  });

  beforeEach(inject([OverlayContainer, Overlay], (oc: OverlayContainer, o: Overlay) => {
    overlay = o;
    overlayContainerElement = oc.getContainerElement();
  }));

  /** Returns the current open overlay pane element. */
  function getPaneElement() {
    return overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
  }

  it(`should attach the overlay based on the open property`, () => {
    fixture.componentInstance.isOpen = true;
    fixture.detectChanges();

    expect(overlayContainerElement.textContent).toContain('Menu content');

    fixture.componentInstance.isOpen = false;
    fixture.detectChanges();

    expect(overlayContainerElement.textContent).toBe('');
  });

  it('can change positionStrategy via input', () => {
    const expectedPositionStrategy = overlay
      .position()
      .flexibleConnectedTo(document.body)
      .withFlexibleDimensions(true)
      .withPositions([{originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'top'}]);
    fixture.componentInstance.isOpen = true;
    fixture.componentInstance.positionStrategy = expectedPositionStrategy;
    fixture.detectChanges();

    const testComponent: ConnectedOverlayDirectiveTest = fixture.debugElement.componentInstance;
    const overlayDirective = testComponent.connectedOverlayDirective;
    const actualPositionStrategy = overlayDirective.overlayRef.getConfig()
      .positionStrategy as FlexibleConnectedPositionStrategy;

    expect(expectedPositionStrategy).toBe(actualPositionStrategy);
  });

  it('should destroy the overlay when the directive is destroyed', () => {
    fixture.componentInstance.isOpen = true;
    fixture.detectChanges();
    fixture.destroy();

    expect(overlayContainerElement.textContent!.trim()).toBe('');
    expect(getPaneElement())
      .withContext('Expected the overlay pane element to be removed when disposed.')
      .toBeFalsy();
  });

  it('should use a connected position strategy with a default set of positions', () => {
    fixture.componentInstance.isOpen = true;
    fixture.detectChanges();

    let testComponent: ConnectedOverlayDirectiveTest = fixture.debugElement.componentInstance;
    let overlayDirective = testComponent.connectedOverlayDirective;
    let strategy = overlayDirective.overlayRef.getConfig()
      .positionStrategy as FlexibleConnectedPositionStrategy;

    expect(strategy instanceof FlexibleConnectedPositionStrategy).toBe(true);
    expect(strategy.positions.length).toBeGreaterThan(0);
  });

  it('should set and update the `dir` attribute', () => {
    dir.value = 'rtl';
    fixture.componentInstance.isOpen = true;
    fixture.detectChanges();

    let boundingBox = overlayContainerElement.querySelector(
      '.cdk-overlay-connected-position-bounding-box',
    )!;

    expect(boundingBox.getAttribute('dir')).toBe('rtl');

    fixture.componentInstance.isOpen = false;
    fixture.detectChanges();

    dir.value = 'ltr';
    fixture.componentInstance.isOpen = true;
    fixture.detectChanges();

    boundingBox = overlayContainerElement.querySelector(
      '.cdk-overlay-connected-position-bounding-box',
    )!;

    expect(boundingBox.getAttribute('dir')).toBe('ltr');
  });

  it('should close when pressing escape', () => {
    fixture.componentInstance.isOpen = true;
    fixture.detectChanges();

    const event = dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
    fixture.detectChanges();

    expect(overlayContainerElement.textContent!.trim())
      .withContext('Expected overlay to have been detached.')
      .toBe('');
    expect(event.defaultPrevented).toBe(true);
  });

  it('should not close when pressing escape with a modifier', () => {
    fixture.componentInstance.isOpen = true;
    fixture.detectChanges();

    const event = createKeyboardEvent('keydown', ESCAPE, undefined, {alt: true});
    dispatchEvent(document.body, event);
    fixture.detectChanges();

    expect(overlayContainerElement.textContent!.trim()).toBeTruthy();
    expect(event.defaultPrevented).toBe(false);
  });

  it('should prevent closing via clicks on the backdrop by default', fakeAsync(() => {
    fixture.componentInstance.hasBackdrop = true;
    fixture.componentInstance.isOpen = true;
    fixture.detectChanges();

    const backdrop = overlayContainerElement.querySelector('.cdk-overlay-backdrop') as HTMLElement;
    backdrop.click();
    fixture.detectChanges();

    expect(overlayContainerElement.textContent!.trim()).toBeTruthy();
  }));

  it('should prevent closing via the escape key with disableClose option', () => {
    fixture.componentInstance.isOpen = true;
    fixture.componentInstance.disableClose = true;
    fixture.detectChanges();

    const event = dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
    fixture.detectChanges();

    expect(overlayContainerElement.textContent!.trim()).toBeTruthy();
    expect(event.defaultPrevented).toBe(false);
  });

  it('should not depend on the order in which the `origin` and `open` are set', waitForAsync(() => {
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

      const pane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
      expect(pane.style.width).toEqual('250px');

      fixture.componentInstance.isOpen = false;
      fixture.detectChanges();

      fixture.componentInstance.width = 500;
      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      expect(pane.style.width).toEqual('500px');
    });

    it('should set the height', () => {
      fixture.componentInstance.height = '100vh';
      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      const pane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
      expect(pane.style.height).toEqual('100vh');

      fixture.componentInstance.isOpen = false;
      fixture.detectChanges();

      fixture.componentInstance.height = '50vh';
      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      expect(pane.style.height).toEqual('50vh');
    });

    it('should set the min width', () => {
      fixture.componentInstance.minWidth = 250;
      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      const pane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
      expect(pane.style.minWidth).toEqual('250px');

      fixture.componentInstance.isOpen = false;
      fixture.detectChanges();

      fixture.componentInstance.minWidth = 500;
      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      expect(pane.style.minWidth).toEqual('500px');
    });

    it('should set the min height', () => {
      fixture.componentInstance.minHeight = '500px';
      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      const pane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
      expect(pane.style.minHeight).toEqual('500px');

      fixture.componentInstance.isOpen = false;
      fixture.detectChanges();

      fixture.componentInstance.minHeight = '250px';
      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      expect(pane.style.minHeight).toEqual('250px');
    });

    it('should create the backdrop if designated', () => {
      fixture.componentInstance.hasBackdrop = true;
      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      expect(overlayContainerElement.querySelector('.cdk-overlay-backdrop')).toBeTruthy();
    });

    it('should not create the backdrop by default', () => {
      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      expect(overlayContainerElement.querySelector('.cdk-overlay-backdrop')).toBeNull();
    });

    it('should be able to change hasBackdrop after the overlay has been initialized', fakeAsync(() => {
      // Open once with a backdrop
      fixture.componentInstance.hasBackdrop = true;
      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      expect(overlayContainerElement.querySelector('.cdk-overlay-backdrop')).toBeTruthy();

      fixture.componentInstance.isOpen = false;
      fixture.detectChanges();
      tick(500);

      // Open again without a backdrop.
      fixture.componentInstance.hasBackdrop = false;
      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      expect(overlayContainerElement.querySelector('.cdk-overlay-backdrop')).toBeFalsy();
    }));

    it('should set the custom backdrop class', () => {
      fixture.componentInstance.hasBackdrop = true;
      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      const backdrop = overlayContainerElement.querySelector(
        '.cdk-overlay-backdrop',
      ) as HTMLElement;
      expect(backdrop.classList).toContain('mat-test-class');
    });

    it('should set the custom panel class', () => {
      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      const panel = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
      expect(panel.classList).toContain('cdk-test-panel-class');
    });

    it('should set the offsetX', () => {
      fixture.componentInstance.offsetX = 5;
      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      const pane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

      expect(pane.style.transform).toContain('translateX(5px)');

      fixture.componentInstance.isOpen = false;
      fixture.detectChanges();

      fixture.componentInstance.offsetX = 15;
      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      expect(pane.style.transform).toContain('translateX(15px)');
    });

    it('should set the offsetY', () => {
      const trigger = fixture.debugElement.query(By.css('button'))!.nativeElement;
      trigger.style.position = 'absolute';
      trigger.style.top = '30px';
      trigger.style.height = '20px';

      fixture.componentInstance.offsetY = 45;
      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      const pane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;

      expect(pane.style.transform).toContain('translateY(45px)');

      fixture.componentInstance.isOpen = false;
      fixture.detectChanges();

      fixture.componentInstance.offsetY = 55;
      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();
      expect(pane.style.transform).toContain('translateY(55px)');
    });

    it('should be able to update the origin after init', () => {
      const testComponent = fixture.componentInstance;

      testComponent.isOpen = true;
      fixture.detectChanges();

      let triggerRect = fixture.nativeElement.querySelector('#trigger').getBoundingClientRect();
      let overlayRect = getPaneElement().getBoundingClientRect();

      expect(Math.floor(triggerRect.left)).toBe(Math.floor(overlayRect.left));
      expect(Math.floor(triggerRect.bottom)).toBe(Math.floor(overlayRect.top));

      testComponent.triggerOverride = testComponent.otherTrigger;
      fixture.detectChanges();

      triggerRect = fixture.nativeElement.querySelector('#otherTrigger').getBoundingClientRect();
      overlayRect = getPaneElement().getBoundingClientRect();

      expect(Math.floor(triggerRect.left)).toBe(Math.floor(overlayRect.left));
      expect(Math.floor(triggerRect.bottom)).toBe(Math.floor(overlayRect.top));
    });

    it('should be able to use non-directive origin', () => {
      const testComponent = fixture.componentInstance;

      testComponent.triggerOverride = testComponent.nonDirectiveTrigger;
      testComponent.isOpen = true;
      fixture.detectChanges();

      const triggerRect = fixture.nativeElement
        .querySelector('#nonDirectiveTrigger')
        .getBoundingClientRect();
      const overlayRect = getPaneElement().getBoundingClientRect();

      expect(Math.floor(triggerRect.left)).toBe(Math.floor(overlayRect.left));
      expect(Math.floor(triggerRect.bottom)).toBe(Math.floor(overlayRect.top));
    });

    it('should update the positions if they change after init', () => {
      const trigger = fixture.nativeElement.querySelector('#trigger');

      trigger.style.position = 'fixed';
      trigger.style.top = '200px';
      trigger.style.left = '200px';

      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      let triggerRect = trigger.getBoundingClientRect();
      let overlayRect = getPaneElement().getBoundingClientRect();

      expect(Math.floor(triggerRect.left)).toBe(Math.floor(overlayRect.left));
      expect(Math.floor(triggerRect.bottom)).toBe(Math.floor(overlayRect.top));

      fixture.componentInstance.isOpen = false;
      fixture.detectChanges();

      fixture.componentInstance.positionOverrides = [
        {
          originX: 'end',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
          // TODO(jelbourn) figure out why, when compiling with bazel, these offsets are required.
          offsetX: 0,
          offsetY: 0,
          panelClass: 'custom-class',
        },
      ];

      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      triggerRect = trigger.getBoundingClientRect();
      overlayRect = getPaneElement().getBoundingClientRect();

      expect(Math.floor(triggerRect.right)).toBe(Math.floor(overlayRect.left));
      expect(Math.floor(triggerRect.bottom)).toBe(Math.floor(overlayRect.top));
    });

    it('should take the offset from the position', () => {
      const trigger = fixture.nativeElement.querySelector('#trigger');

      trigger.style.position = 'fixed';
      trigger.style.top = '200px';
      trigger.style.left = '200px';

      fixture.componentInstance.positionOverrides = [
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'top',
          offsetX: 20,
          offsetY: 10,
          panelClass: 'custom-class',
        },
      ];

      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      const triggerRect = trigger.getBoundingClientRect();
      const overlayRect = getPaneElement().getBoundingClientRect();

      expect(Math.floor(overlayRect.top)).toBe(Math.floor(triggerRect.top) + 10);
      expect(Math.floor(overlayRect.left)).toBe(Math.floor(triggerRect.left) + 20);
    });

    it('should take the offset from the position', () => {
      fixture.componentInstance.positionOverrides = [
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'top',
          panelClass: 'custom-class',
        },
      ];

      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      const panel = getPaneElement();
      expect(panel.classList).toContain('custom-class');
      expect(panel.classList).toContain('cdk-test-panel-class');
    });

    it('should be able to set the viewport margin', () => {
      expect(fixture.componentInstance.connectedOverlayDirective.viewportMargin).not.toBe(10);

      fixture.componentInstance.viewportMargin = 10;
      fixture.detectChanges();

      expect(fixture.componentInstance.connectedOverlayDirective.viewportMargin).toBe(10);
    });

    it('should allow for flexible positioning to be enabled', () => {
      expect(fixture.componentInstance.connectedOverlayDirective.flexibleDimensions).not.toBe(true);

      fixture.componentInstance.flexibleDimensions = true;
      fixture.detectChanges();

      expect(fixture.componentInstance.connectedOverlayDirective.flexibleDimensions).toBe(true);
    });

    it('should allow for growing after open to be enabled', () => {
      expect(fixture.componentInstance.connectedOverlayDirective.growAfterOpen).not.toBe(true);

      fixture.componentInstance.growAfterOpen = true;
      fixture.detectChanges();

      expect(fixture.componentInstance.connectedOverlayDirective.growAfterOpen).toBe(true);
    });

    it('should allow for pushing to be enabled', () => {
      expect(fixture.componentInstance.connectedOverlayDirective.push).not.toBe(true);

      fixture.componentInstance.push = true;
      fixture.detectChanges();

      expect(fixture.componentInstance.connectedOverlayDirective.push).toBe(true);
    });

    it('should update the element size if it changes while open', () => {
      fixture.componentInstance.width = 250;
      fixture.componentInstance.height = 250;
      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      const pane = overlayContainerElement.querySelector('.cdk-overlay-pane') as HTMLElement;
      expect(pane.style.width).toBe('250px');
      expect(pane.style.height).toBe('250px');

      fixture.componentInstance.width = 100;
      fixture.componentInstance.height = 100;
      fixture.detectChanges();

      expect(pane.style.width).toBe('100px');
      expect(pane.style.height).toBe('100px');
    });

    it('should be able to set transform origin selector', () => {
      const trigger = fixture.nativeElement.querySelector('#trigger');

      trigger.style.position = 'fixed';
      trigger.style.top = '200px';
      trigger.style.left = '200px';

      fixture.componentInstance.positionOverrides = [
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'bottom',
        },
      ];

      fixture.componentInstance.transformOriginSelector = '.cdk-test-panel-class';
      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      const target = overlayContainerElement.querySelector('.cdk-test-panel-class')! as HTMLElement;

      expect(target.style.transformOrigin).toContain('left bottom');
    });
  });

  describe('outputs', () => {
    it('should emit when the backdrop was clicked', () => {
      fixture.componentInstance.hasBackdrop = true;
      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      const backdrop = overlayContainerElement.querySelector(
        '.cdk-overlay-backdrop',
      ) as HTMLElement;
      backdrop.click();
      fixture.detectChanges();

      expect(fixture.componentInstance.backdropClickHandler).toHaveBeenCalledWith(
        jasmine.any(MouseEvent),
      );
    });

    it('should emit when the position has changed', () => {
      expect(fixture.componentInstance.positionChangeHandler).not.toHaveBeenCalled();
      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      expect(fixture.componentInstance.positionChangeHandler).toHaveBeenCalled();

      const latestCall = fixture.componentInstance.positionChangeHandler.calls.mostRecent();

      expect(latestCall.args[0] instanceof ConnectedOverlayPositionChange)
        .withContext(`Expected directive to emit an instance of ConnectedOverlayPositionChange.`)
        .toBe(true);
    });

    it('should emit when attached', () => {
      expect(fixture.componentInstance.attachHandler).not.toHaveBeenCalled();
      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      expect(fixture.componentInstance.attachHandler).toHaveBeenCalled();
      expect(fixture.componentInstance.attachResult instanceof HTMLElement)
        .withContext(`Expected pane to be populated with HTML elements when attach was called.`)
        .toBe(true);

      fixture.componentInstance.isOpen = false;
      fixture.detectChanges();
    });

    it('should emit when detached', () => {
      expect(fixture.componentInstance.detachHandler).not.toHaveBeenCalled();
      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      expect(fixture.componentInstance.detachHandler).not.toHaveBeenCalled();

      fixture.componentInstance.isOpen = false;
      fixture.detectChanges();
      expect(fixture.componentInstance.detachHandler).toHaveBeenCalled();
    });

    it('should emit the keydown events from the overlay', () => {
      expect(fixture.componentInstance.keydownHandler).not.toHaveBeenCalled();

      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      const event = dispatchKeyboardEvent(document.body, 'keydown', A);
      fixture.detectChanges();

      expect(fixture.componentInstance.keydownHandler).toHaveBeenCalledWith(event);
    });

    it('should emit when detached externally', () => {
      expect(fixture.componentInstance.detachHandler).not.toHaveBeenCalled();
      fixture.componentInstance.scrollStrategy = overlay.scrollStrategies.close();
      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();

      expect(fixture.componentInstance.detachHandler).not.toHaveBeenCalled();

      scrolledSubject.next();
      fixture.detectChanges();

      expect(fixture.componentInstance.detachHandler).toHaveBeenCalled();
    });

    // This is intended as a simplified example of a more complicated bug in g3. Technically
    // these events shouldn't invoke their listeners after destruction anyway, but in some
    // tests it can happen. For more context: https://github.com/crisbeto/material2/pull/10
    it('should not emit after the directive is destroyed', () => {
      const spy = jasmine.createSpy('detach spy');
      const subscription =
        fixture.componentInstance.connectedOverlayDirective.detach.subscribe(spy);

      fixture.componentInstance.isOpen = true;
      fixture.detectChanges();
      fixture.destroy();

      expect(spy).not.toHaveBeenCalled();
      subscription.unsubscribe();
    });
  });
});

@Component({
  template: `
  <button cdk-overlay-origin id="trigger" #trigger="cdkOverlayOrigin">Toggle menu</button>
  <button cdk-overlay-origin id="otherTrigger" #otherTrigger="cdkOverlayOrigin">Toggle menu</button>
  <button id="nonDirectiveTrigger" #nonDirectiveTrigger>Toggle menu</button>

  <ng-template cdk-connected-overlay
            [cdkConnectedOverlayOpen]="isOpen"
            [cdkConnectedOverlayWidth]="width"
            [cdkConnectedOverlayHeight]="height"
            [cdkConnectedOverlayPositionStrategy]="positionStrategy"
            [cdkConnectedOverlayOrigin]="triggerOverride || trigger"
            [cdkConnectedOverlayHasBackdrop]="hasBackdrop"
            [cdkConnectedOverlayViewportMargin]="viewportMargin"
            [cdkConnectedOverlayFlexibleDimensions]="flexibleDimensions"
            [cdkConnectedOverlayGrowAfterOpen]="growAfterOpen"
            [cdkConnectedOverlayPush]="push"
            [cdkConnectedOverlayScrollStrategy]="scrollStrategy"
            [cdkConnectedOverlayDisableClose]="disableClose"
            cdkConnectedOverlayBackdropClass="mat-test-class"
            cdkConnectedOverlayPanelClass="cdk-test-panel-class"
            (backdropClick)="backdropClickHandler($event)"
            [cdkConnectedOverlayOffsetX]="offsetX"
            [cdkConnectedOverlayOffsetY]="offsetY"
            (positionChange)="positionChangeHandler($event)"
            (attach)="attachHandler()"
            (detach)="detachHandler()"
            (overlayKeydown)="keydownHandler($event)"
            [cdkConnectedOverlayMinWidth]="minWidth"
            [cdkConnectedOverlayMinHeight]="minHeight"
            [cdkConnectedOverlayPositions]="positionOverrides"
            [cdkConnectedOverlayTransformOriginOn]="transformOriginSelector">
    <p>Menu content</p>
  </ng-template>`,
})
class ConnectedOverlayDirectiveTest {
  @ViewChild(CdkConnectedOverlay) connectedOverlayDirective: CdkConnectedOverlay;
  @ViewChild('trigger') trigger: CdkOverlayOrigin;
  @ViewChild('otherTrigger') otherTrigger: CdkOverlayOrigin;
  @ViewChild('nonDirectiveTrigger') nonDirectiveTrigger: ElementRef<HTMLElement>;

  isOpen = false;
  width: number | string;
  height: number | string;
  minWidth: number | string;
  positionStrategy: FlexibleConnectedPositionStrategy;
  minHeight: number | string;
  offsetX: number;
  offsetY: number;
  triggerOverride: CdkOverlayOrigin | FlexibleConnectedPositionStrategyOrigin;
  hasBackdrop: boolean;
  disableClose: boolean;
  viewportMargin: number;
  flexibleDimensions: boolean;
  growAfterOpen: boolean;
  push: boolean;
  scrollStrategy: ScrollStrategy;
  backdropClickHandler = jasmine.createSpy('backdropClick handler');
  positionChangeHandler = jasmine.createSpy('positionChange handler');
  keydownHandler = jasmine.createSpy('keydown handler');
  positionOverrides: ConnectionPositionPair[];
  attachHandler = jasmine.createSpy('attachHandler').and.callFake(() => {
    const overlayElement = this.connectedOverlayDirective.overlayRef.overlayElement;
    this.attachResult = overlayElement.querySelector('p') as HTMLElement;
  });
  detachHandler = jasmine.createSpy('detachHandler');
  attachResult: HTMLElement;
  transformOriginSelector: string;
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
