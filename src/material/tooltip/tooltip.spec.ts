import {FocusMonitor} from '@angular/cdk/a11y';
import {Direction, Directionality} from '@angular/cdk/bidi';
import {ESCAPE} from '@angular/cdk/keycodes';
import {CdkScrollable, OverlayContainer, OverlayModule} from '@angular/cdk/overlay';
import {Platform} from '@angular/cdk/platform';
import {
  createFakeEvent,
  createKeyboardEvent,
  createMouseEvent,
  dispatchEvent,
  dispatchFakeEvent,
  dispatchKeyboardEvent,
  dispatchMouseEvent,
  patchElementFocus,
} from '../../cdk/testing/private';
import {
  ChangeDetectionStrategy,
  Component,
  DebugElement,
  ElementRef,
  NgZone,
  ViewChild,
} from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  flush,
  inject,
  TestBed,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {Subject} from 'rxjs';
import {
  MAT_TOOLTIP_DEFAULT_OPTIONS,
  MatTooltip,
  MatTooltipModule,
  SCROLL_THROTTLE_MS,
  TooltipPosition,
  TooltipTouchGestures,
} from './index';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';

const initialTooltipMessage = 'initial tooltip message';

describe('MDC-based MatTooltip', () => {
  let overlayContainerElement: HTMLElement;
  let dir: {value: Direction; change: Subject<Direction>};
  let platform: Platform;
  let focusMonitor: FocusMonitor;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatTooltipModule, OverlayModule],
      declarations: [
        BasicTooltipDemo,
        ScrollableTooltipDemo,
        OnPushTooltipDemo,
        DynamicTooltipsDemo,
        TooltipOnTextFields,
        TooltipOnDraggableElement,
        DataBoundAriaLabelTooltip,
      ],
      providers: [
        {
          provide: Directionality,
          useFactory: () => {
            return (dir = {value: 'ltr', change: new Subject()});
          },
        },
      ],
    });

    TestBed.compileComponents();

    inject(
      [OverlayContainer, FocusMonitor, Platform],
      (oc: OverlayContainer, fm: FocusMonitor, pl: Platform) => {
        overlayContainerElement = oc.getContainerElement();
        focusMonitor = fm;
        platform = pl;
      },
    )();
  }));

  describe('basic usage', () => {
    let fixture: ComponentFixture<BasicTooltipDemo>;
    let buttonDebugElement: DebugElement;
    let buttonElement: HTMLButtonElement;
    let tooltipDirective: MatTooltip;

    beforeEach(() => {
      fixture = TestBed.createComponent(BasicTooltipDemo);
      fixture.detectChanges();
      buttonDebugElement = fixture.debugElement.query(By.css('button'))!;
      buttonElement = <HTMLButtonElement>buttonDebugElement.nativeElement;
      tooltipDirective = buttonDebugElement.injector.get<MatTooltip>(MatTooltip);
    });

    it('should show and hide the tooltip', fakeAsync(() => {
      assertTooltipInstance(tooltipDirective, false);

      tooltipDirective.show();
      tick(0); // Tick for the show delay (default is 0)
      expect(tooltipDirective._isTooltipVisible()).toBe(true);

      fixture.detectChanges();

      // Wait until animation has finished
      finishCurrentTooltipAnimation(overlayContainerElement, true);

      // Make sure tooltip is shown to the user and animation has finished.
      const tooltipElement = overlayContainerElement.querySelector(
        '.mat-mdc-tooltip',
      ) as HTMLElement;
      expect(tooltipElement instanceof HTMLElement).toBe(true);
      expect(tooltipElement.classList).toContain('mat-mdc-tooltip-show');

      expect(overlayContainerElement.textContent).toContain(initialTooltipMessage);

      // After hide is called, a timeout delay is created that will to hide the tooltip.
      const tooltipDelay = 1000;
      tooltipDirective.hide(tooltipDelay);
      expect(tooltipDirective._isTooltipVisible()).toBe(true);

      // After the tooltip delay elapses, expect that the tooltip is not visible.
      tick(tooltipDelay);
      fixture.detectChanges();
      expect(tooltipDirective._isTooltipVisible()).toBe(false);

      // On animation complete, should expect that the tooltip has been detached.
      finishCurrentTooltipAnimation(overlayContainerElement, false);
      assertTooltipInstance(tooltipDirective, false);
    }));

    it('should be able to re-open a tooltip if it was closed by detaching the overlay', fakeAsync(() => {
      tooltipDirective.show();
      tick(0);
      expect(tooltipDirective._isTooltipVisible()).toBe(true);
      fixture.detectChanges();
      finishCurrentTooltipAnimation(overlayContainerElement, true);

      tooltipDirective._overlayRef!.detach();
      tick(0);
      fixture.detectChanges();
      expect(tooltipDirective._isTooltipVisible()).toBe(false);
      assertTooltipInstance(tooltipDirective, false);

      tooltipDirective.show();
      tick(0);
      finishCurrentTooltipAnimation(overlayContainerElement, true);
      expect(tooltipDirective._isTooltipVisible()).toBe(true);
    }));

    it('should show with delay', fakeAsync(() => {
      assertTooltipInstance(tooltipDirective, false);

      const tooltipDelay = 1000;
      tooltipDirective.show(tooltipDelay);
      expect(tooltipDirective._isTooltipVisible()).toBe(false);

      fixture.detectChanges();
      expect(overlayContainerElement.textContent).toContain('');

      tick(tooltipDelay);
      expect(tooltipDirective._isTooltipVisible()).toBe(true);
      expect(overlayContainerElement.textContent).toContain(initialTooltipMessage);
    }));

    it('should be able to override the default show and hide delays', fakeAsync(() => {
      TestBed.resetTestingModule()
        .configureTestingModule({
          imports: [MatTooltipModule, OverlayModule],
          declarations: [BasicTooltipDemo],
          providers: [
            {
              provide: MAT_TOOLTIP_DEFAULT_OPTIONS,
              useValue: {showDelay: 1337, hideDelay: 7331},
            },
          ],
        })
        .compileComponents();

      fixture = TestBed.createComponent(BasicTooltipDemo);
      fixture.detectChanges();
      tooltipDirective = fixture.debugElement
        .query(By.css('button'))!
        .injector.get<MatTooltip>(MatTooltip);

      tooltipDirective.show();
      fixture.detectChanges();
      tick();

      expect(tooltipDirective._isTooltipVisible()).toBe(false);
      tick(1337);
      expect(tooltipDirective._isTooltipVisible()).toBe(true);

      tooltipDirective.hide();
      fixture.detectChanges();
      tick();

      expect(tooltipDirective._isTooltipVisible()).toBe(true);
      tick(7331);
      expect(tooltipDirective._isTooltipVisible()).toBe(false);
    }));

    it('should be able to override the default position', fakeAsync(() => {
      TestBed.resetTestingModule()
        .configureTestingModule({
          imports: [MatTooltipModule, OverlayModule],
          declarations: [TooltipDemoWithoutPositionBinding],
          providers: [
            {
              provide: MAT_TOOLTIP_DEFAULT_OPTIONS,
              useValue: {position: 'right'},
            },
          ],
        })
        .compileComponents();

      const newFixture = TestBed.createComponent(TooltipDemoWithoutPositionBinding);
      newFixture.detectChanges();
      tooltipDirective = newFixture.debugElement
        .query(By.css('button'))!
        .injector.get<MatTooltip>(MatTooltip);

      tooltipDirective.show();
      newFixture.detectChanges();
      tick();

      expect(tooltipDirective.position).toBe('right');
      expect(tooltipDirective._getOverlayPosition().main.overlayX).toBe('start');
      expect(tooltipDirective._getOverlayPosition().fallback.overlayX).toBe('end');
    }));

    it('should position on the bottom-left by default', fakeAsync(() => {
      // We don't bind mouse events on mobile devices.
      if (platform.IOS || platform.ANDROID) {
        return;
      }

      TestBed.resetTestingModule()
        .configureTestingModule({
          imports: [MatTooltipModule, OverlayModule],
          declarations: [WideTooltipDemo],
        })
        .compileComponents();

      const wideFixture = TestBed.createComponent(WideTooltipDemo);
      wideFixture.detectChanges();
      tooltipDirective = wideFixture.debugElement
        .query(By.css('button'))!
        .injector.get<MatTooltip>(MatTooltip);
      const button: HTMLButtonElement = wideFixture.nativeElement.querySelector('button');
      const triggerRect = button.getBoundingClientRect();

      dispatchMouseEvent(button, 'mouseenter', triggerRect.right - 100, triggerRect.top + 100);
      wideFixture.detectChanges();
      tick();
      expect(tooltipDirective._isTooltipVisible()).toBe(true);

      expect(tooltipDirective._overlayRef!.overlayElement.offsetLeft).toBeLessThan(
        triggerRect.right - 250,
      );
      expect(tooltipDirective._overlayRef!.overlayElement.offsetTop).toBeGreaterThanOrEqual(
        triggerRect.bottom,
      );
    }));

    it('should be able to override the default positionAtOrigin', fakeAsync(() => {
      // We don't bind mouse events on mobile devices.
      if (platform.IOS || platform.ANDROID) {
        return;
      }

      TestBed.resetTestingModule()
        .configureTestingModule({
          imports: [MatTooltipModule, OverlayModule],
          declarations: [WideTooltipDemo],
          providers: [
            {
              provide: MAT_TOOLTIP_DEFAULT_OPTIONS,
              useValue: {positionAtOrigin: true},
            },
          ],
        })
        .compileComponents();

      const wideFixture = TestBed.createComponent(WideTooltipDemo);
      wideFixture.detectChanges();
      tooltipDirective = wideFixture.debugElement
        .query(By.css('button'))!
        .injector.get<MatTooltip>(MatTooltip);
      const button: HTMLButtonElement = wideFixture.nativeElement.querySelector('button');
      const triggerRect = button.getBoundingClientRect();

      dispatchMouseEvent(button, 'mouseenter', triggerRect.right - 100, triggerRect.top + 100);
      wideFixture.detectChanges();
      tick();
      expect(tooltipDirective._isTooltipVisible()).toBe(true);

      expect(tooltipDirective._overlayRef!.overlayElement.offsetLeft).toBe(
        triggerRect.right - 100 - 20,
      );
      expect(tooltipDirective._overlayRef!.overlayElement.offsetTop).toBe(triggerRect.top + 100);
    }));

    it('should be able to disable tooltip interactivity', fakeAsync(() => {
      TestBed.resetTestingModule()
        .configureTestingModule({
          imports: [MatTooltipModule, OverlayModule, NoopAnimationsModule],
          declarations: [TooltipDemoWithoutPositionBinding],
          providers: [
            {
              provide: MAT_TOOLTIP_DEFAULT_OPTIONS,
              useValue: {disableTooltipInteractivity: true},
            },
          ],
        })
        .compileComponents();

      const newFixture = TestBed.createComponent(TooltipDemoWithoutPositionBinding);
      newFixture.detectChanges();
      tooltipDirective = newFixture.debugElement
        .query(By.css('button'))!
        .injector.get<MatTooltip>(MatTooltip);

      tooltipDirective.show();
      newFixture.detectChanges();
      tick();

      expect(tooltipDirective._overlayRef?.overlayElement.classList).toContain(
        'mat-mdc-tooltip-panel-non-interactive',
      );
    }));

    it('should set a css class on the overlay panel element', fakeAsync(() => {
      tooltipDirective.show();
      fixture.detectChanges();
      tick(0);

      const overlayRef = tooltipDirective._overlayRef;

      expect(!!overlayRef).toBeTruthy();
      expect(overlayRef!.overlayElement.classList)
        .withContext('Expected the overlay panel element to have the tooltip panel class set.')
        .toContain('mat-mdc-tooltip-panel');
    }));

    it('should not show if disabled', fakeAsync(() => {
      // Test that disabling the tooltip will not set the tooltip visible
      tooltipDirective.disabled = true;
      tooltipDirective.show();
      fixture.detectChanges();
      tick(0);
      expect(tooltipDirective._isTooltipVisible()).toBe(false);

      // Test to make sure setting disabled to false will show the tooltip
      // Sanity check to make sure everything was correct before (detectChanges, tick)
      tooltipDirective.disabled = false;
      tooltipDirective.show();
      fixture.detectChanges();
      tick(0);
      expect(tooltipDirective._isTooltipVisible()).toBe(true);
    }));

    it('should hide if disabled while visible', fakeAsync(() => {
      // Display the tooltip with a timeout before hiding.
      tooltipDirective.hideDelay = 1000;
      tooltipDirective.show();
      fixture.detectChanges();
      tick(0);
      expect(tooltipDirective._isTooltipVisible()).toBe(true);

      // Set tooltip to be disabled and verify that the tooltip hides.
      tooltipDirective.disabled = true;
      tick(0);
      expect(tooltipDirective._isTooltipVisible()).toBe(false);
    }));

    it('should hide if the message is cleared while the tooltip is open', fakeAsync(() => {
      tooltipDirective.show();
      fixture.detectChanges();
      tick(0);
      expect(tooltipDirective._isTooltipVisible()).toBe(true);

      fixture.componentInstance.message = '';
      fixture.detectChanges();
      tick(0);
      expect(tooltipDirective._isTooltipVisible()).toBe(false);
    }));

    it('should not show if hide is called before delay finishes', waitForAsync(() => {
      assertTooltipInstance(tooltipDirective, false);

      const tooltipDelay = 1000;

      tooltipDirective.show(tooltipDelay);
      expect(tooltipDirective._isTooltipVisible()).toBe(false);

      fixture.detectChanges();
      expect(overlayContainerElement.textContent).toContain('');
      tooltipDirective.hide();

      fixture.whenStable().then(() => {
        expect(tooltipDirective._isTooltipVisible()).toBe(false);
      });
    }));

    it('should not show tooltip if message is not present or empty', () => {
      assertTooltipInstance(tooltipDirective, false);

      tooltipDirective.message = undefined!;
      fixture.detectChanges();
      tooltipDirective.show();
      assertTooltipInstance(tooltipDirective, false);

      tooltipDirective.message = null!;
      fixture.detectChanges();
      tooltipDirective.show();
      assertTooltipInstance(tooltipDirective, false);

      tooltipDirective.message = '';
      fixture.detectChanges();
      tooltipDirective.show();
      assertTooltipInstance(tooltipDirective, false);

      tooltipDirective.message = '   ';
      fixture.detectChanges();
      tooltipDirective.show();
      assertTooltipInstance(tooltipDirective, false);
    });

    it('should not follow through with hide if show is called after', fakeAsync(() => {
      tooltipDirective.show();
      tick(0); // Tick for the show delay (default is 0)
      expect(tooltipDirective._isTooltipVisible()).toBe(true);

      // After hide called, a timeout delay is created that will to hide the tooltip.
      const tooltipDelay = 1000;
      tooltipDirective.hide(tooltipDelay);
      expect(tooltipDirective._isTooltipVisible()).toBe(true);

      // Before delay time has passed, call show which should cancel intent to hide tooltip.
      tooltipDirective.show();
      tick(tooltipDelay);
      expect(tooltipDirective._isTooltipVisible()).toBe(true);
    }));

    it('should be able to update the tooltip position while open', fakeAsync(() => {
      tooltipDirective.position = 'below';
      tooltipDirective.show();
      tick();

      assertTooltipInstance(tooltipDirective, true);

      tooltipDirective.position = 'above';
      spyOn(tooltipDirective._overlayRef!, 'updatePosition').and.callThrough();
      fixture.detectChanges();
      tick();

      assertTooltipInstance(tooltipDirective, true);
      expect(tooltipDirective._overlayRef!.updatePosition).toHaveBeenCalled();
    }));

    it('should update the tooltip position when the directionality changes', fakeAsync(() => {
      tooltipDirective.position = 'right';
      tooltipDirective.show();
      tick();

      assertTooltipInstance(tooltipDirective, true);
      const spy = spyOn(tooltipDirective as any, '_updatePosition').and.callThrough();
      dir.change.next('rtl');

      assertTooltipInstance(tooltipDirective, true);
      expect(spy).toHaveBeenCalled();
    }));

    it('should not throw when updating the position for a closed tooltip', fakeAsync(() => {
      tooltipDirective.position = 'left';
      tooltipDirective.show(0);
      fixture.detectChanges();
      tick();

      tooltipDirective.hide(0);
      fixture.detectChanges();
      tick();
      finishCurrentTooltipAnimation(overlayContainerElement, false);

      expect(() => {
        tooltipDirective.position = 'right';
        fixture.detectChanges();
        tick();
      }).not.toThrow();
    }));

    it('should be able to modify the tooltip message', fakeAsync(() => {
      assertTooltipInstance(tooltipDirective, false);

      tooltipDirective.show();
      tick(0); // Tick for the show delay (default is 0)
      expect(tooltipDirective._tooltipInstance!.isVisible()).toBe(true);

      fixture.detectChanges();
      expect(overlayContainerElement.textContent).toContain(initialTooltipMessage);

      const newMessage = 'new tooltip message';
      tooltipDirective.message = newMessage;

      fixture.detectChanges();
      expect(overlayContainerElement.textContent).toContain(newMessage);
    }));

    it('should allow extra classes to be set on the tooltip', fakeAsync(() => {
      assertTooltipInstance(tooltipDirective, false);

      tooltipDirective.show();
      tick(0); // Tick for the show delay (default is 0)
      fixture.detectChanges();

      // Make sure classes aren't prematurely added
      let tooltipElement = overlayContainerElement.querySelector('.mat-mdc-tooltip') as HTMLElement;
      expect(tooltipElement.classList).not.toContain(
        'custom-one',
        'Expected to not have the class before enabling matTooltipClass',
      );
      expect(tooltipElement.classList).not.toContain(
        'custom-two',
        'Expected to not have the class before enabling matTooltipClass',
      );

      // Enable the classes via ngClass syntax
      fixture.componentInstance.showTooltipClass = true;
      fixture.detectChanges();

      // Make sure classes are correctly added
      tooltipElement = overlayContainerElement.querySelector('.mat-mdc-tooltip') as HTMLElement;
      expect(tooltipElement.classList)
        .withContext('Expected to have the class after enabling matTooltipClass')
        .toContain('custom-one');
      expect(tooltipElement.classList)
        .withContext('Expected to have the class after enabling matTooltipClass')
        .toContain('custom-two');
    }));

    it('should be removed after parent destroyed', fakeAsync(() => {
      tooltipDirective.show();
      tick(0); // Tick for the show delay (default is 0)
      expect(tooltipDirective._isTooltipVisible()).toBe(true);

      fixture.destroy();
      expect(overlayContainerElement.childNodes.length).toBe(0);
      expect(overlayContainerElement.textContent).toBe('');
    }));

    it('should have an aria-described element with the tooltip message', fakeAsync(() => {
      const dynamicTooltipsDemoFixture = TestBed.createComponent(DynamicTooltipsDemo);
      const dynamicTooltipsComponent = dynamicTooltipsDemoFixture.componentInstance;

      dynamicTooltipsComponent.tooltips = ['Tooltip One', 'Tooltip Two'];
      dynamicTooltipsDemoFixture.detectChanges();
      tick();

      const buttons = dynamicTooltipsDemoFixture.nativeElement.querySelectorAll('button');
      const firstButtonAria = buttons[0].getAttribute('aria-describedby');
      expect(document.querySelector(`#${firstButtonAria}`)!.textContent).toBe('Tooltip One');

      const secondButtonAria = buttons[1].getAttribute('aria-describedby');
      expect(document.querySelector(`#${secondButtonAria}`)!.textContent).toBe('Tooltip Two');
    }));

    it(
      'should not add an ARIA description for elements that have the same text as a' +
        'data-bound aria-label',
      fakeAsync(() => {
        const ariaLabelFixture = TestBed.createComponent(DataBoundAriaLabelTooltip);
        ariaLabelFixture.detectChanges();
        tick();

        const button = ariaLabelFixture.nativeElement.querySelector('button');
        expect(button.getAttribute('aria-describedby')).toBeFalsy();
      }),
    );

    it('should not try to dispose the tooltip when destroyed and done hiding', fakeAsync(() => {
      tooltipDirective.show();
      fixture.detectChanges();
      finishCurrentTooltipAnimation(overlayContainerElement, true);

      const tooltipDelay = 1000;
      tooltipDirective.hide();
      tick(tooltipDelay); // Change the tooltip state to hidden and trigger animation start
      finishCurrentTooltipAnimation(overlayContainerElement, false);

      fixture.componentInstance.showButton = false;
      fixture.detectChanges();
    }));

    it('should complete the afterHidden stream when tooltip is destroyed', fakeAsync(() => {
      tooltipDirective.show();
      fixture.detectChanges();
      finishCurrentTooltipAnimation(overlayContainerElement, true);

      const spy = jasmine.createSpy('complete spy');
      const subscription = tooltipDirective
        ._tooltipInstance!.afterHidden()
        .subscribe({complete: spy});

      tooltipDirective.hide(0);
      tick(0);
      fixture.detectChanges();
      finishCurrentTooltipAnimation(overlayContainerElement, false);

      expect(spy).toHaveBeenCalled();
      subscription.unsubscribe();
    }));

    it('should consistently position before and after overlay origin in ltr and rtl dir', () => {
      tooltipDirective.position = 'left';
      const leftOrigin = tooltipDirective._getOrigin().main;
      tooltipDirective.position = 'right';
      const rightOrigin = tooltipDirective._getOrigin().main;

      // Test expectations in LTR
      tooltipDirective.position = 'before';
      expect(tooltipDirective._getOrigin().main).toEqual(leftOrigin);
      tooltipDirective.position = 'after';
      expect(tooltipDirective._getOrigin().main).toEqual(rightOrigin);

      // Test expectations in RTL
      dir.value = 'rtl';
      tooltipDirective.position = 'before';
      expect(tooltipDirective._getOrigin().main).toEqual(leftOrigin);
      tooltipDirective.position = 'after';
      expect(tooltipDirective._getOrigin().main).toEqual(rightOrigin);
    });

    it('should consistently position before and after overlay position in ltr and rtl dir', () => {
      tooltipDirective.position = 'left';
      const leftOverlayPosition = tooltipDirective._getOverlayPosition().main;
      tooltipDirective.position = 'right';
      const rightOverlayPosition = tooltipDirective._getOverlayPosition().main;

      // Test expectations in LTR
      tooltipDirective.position = 'before';
      expect(tooltipDirective._getOverlayPosition().main).toEqual(leftOverlayPosition);
      tooltipDirective.position = 'after';
      expect(tooltipDirective._getOverlayPosition().main).toEqual(rightOverlayPosition);

      // Test expectations in RTL
      dir.value = 'rtl';
      tooltipDirective.position = 'before';
      expect(tooltipDirective._getOverlayPosition().main).toEqual(leftOverlayPosition);
      tooltipDirective.position = 'after';
      expect(tooltipDirective._getOverlayPosition().main).toEqual(rightOverlayPosition);
    });

    it('should throw when trying to assign an invalid position', () => {
      expect(() => {
        fixture.componentInstance.position = 'everywhere';
        fixture.detectChanges();
        tooltipDirective.show();
      }).toThrowError('Tooltip position "everywhere" is invalid.');
    });

    it('should pass the layout direction to the tooltip', fakeAsync(() => {
      dir.value = 'rtl';

      tooltipDirective.show();
      tick(0);
      fixture.detectChanges();

      const tooltipWrapper = overlayContainerElement.querySelector(
        '.cdk-overlay-connected-position-bounding-box',
      )!;

      expect(tooltipWrapper).withContext('Expected tooltip to be shown.').toBeTruthy();
      expect(tooltipWrapper.getAttribute('dir'))
        .withContext('Expected tooltip to be in RTL mode.')
        .toBe('rtl');
    }));

    it('should keep the overlay direction in sync with the trigger direction', fakeAsync(() => {
      dir.value = 'rtl';
      tooltipDirective.show();
      tick(0);
      fixture.detectChanges();
      finishCurrentTooltipAnimation(overlayContainerElement, true);

      let tooltipWrapper = overlayContainerElement.querySelector(
        '.cdk-overlay-connected-position-bounding-box',
      )!;
      expect(tooltipWrapper.getAttribute('dir'))
        .withContext('Expected tooltip to be in RTL.')
        .toBe('rtl');

      tooltipDirective.hide(0);
      tick(0);
      fixture.detectChanges();
      finishCurrentTooltipAnimation(overlayContainerElement, false);

      dir.value = 'ltr';
      tooltipDirective.show();
      tick(0);
      fixture.detectChanges();
      finishCurrentTooltipAnimation(overlayContainerElement, true);

      tooltipWrapper = overlayContainerElement.querySelector(
        '.cdk-overlay-connected-position-bounding-box',
      )!;
      expect(tooltipWrapper.getAttribute('dir'))
        .withContext('Expected tooltip to be in LTR.')
        .toBe('ltr');
    }));

    it('should be able to set the tooltip message as a number', fakeAsync(() => {
      fixture.componentInstance.message = 100;
      fixture.detectChanges();

      expect(tooltipDirective.message).toBe('100');
    }));

    it('should hide when clicking away', fakeAsync(() => {
      tooltipDirective.show();
      tick(0);
      fixture.detectChanges();
      finishCurrentTooltipAnimation(overlayContainerElement, true);

      expect(tooltipDirective._isTooltipVisible()).toBe(true);
      expect(overlayContainerElement.textContent).toContain(initialTooltipMessage);

      document.body.click();
      tick(0);
      fixture.detectChanges();
      finishCurrentTooltipAnimation(overlayContainerElement, false);
      fixture.detectChanges();

      expect(tooltipDirective._isTooltipVisible()).toBe(false);
      expect(overlayContainerElement.textContent).toBe('');
    }));

    it('should hide when clicking away with an auxilliary button', fakeAsync(() => {
      tooltipDirective.show();
      tick(0);
      fixture.detectChanges();
      finishCurrentTooltipAnimation(overlayContainerElement, true);

      expect(tooltipDirective._isTooltipVisible()).toBe(true);
      expect(overlayContainerElement.textContent).toContain(initialTooltipMessage);

      dispatchFakeEvent(document.body, 'auxclick');
      tick(0);
      fixture.detectChanges();
      finishCurrentTooltipAnimation(overlayContainerElement, false);
      fixture.detectChanges();

      expect(tooltipDirective._isTooltipVisible()).toBe(false);
      expect(overlayContainerElement.textContent).toBe('');
    }));

    it('should not hide immediately if a click fires while animating', fakeAsync(() => {
      tooltipDirective.show();
      tick(0);
      fixture.detectChanges();

      document.body.click();
      fixture.detectChanges();
      tick(500);
      finishCurrentTooltipAnimation(overlayContainerElement, true);

      expect(overlayContainerElement.textContent).toContain(initialTooltipMessage);
    }));

    it('should hide when pressing escape', fakeAsync(() => {
      tooltipDirective.show();
      tick(0);
      fixture.detectChanges();
      tick(500);

      expect(tooltipDirective._isTooltipVisible()).toBe(true);
      expect(overlayContainerElement.textContent).toContain(initialTooltipMessage);

      dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
      tick(0);
      fixture.detectChanges();
      tick(500);
      fixture.detectChanges();
      finishCurrentTooltipAnimation(overlayContainerElement, false);

      expect(tooltipDirective._isTooltipVisible()).toBe(false);
      expect(overlayContainerElement.textContent).toBe('');
    }));

    it('should not throw when pressing ESCAPE', fakeAsync(() => {
      expect(() => {
        dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
        fixture.detectChanges();
      }).not.toThrow();

      // Flush due to the additional tick that is necessary for the FocusMonitor.
      flush();
    }));

    it('should preventDefault when pressing ESCAPE', fakeAsync(() => {
      tooltipDirective.show();
      tick(0);
      fixture.detectChanges();

      const event = dispatchKeyboardEvent(document.body, 'keydown', ESCAPE);
      fixture.detectChanges();
      flush();

      expect(event.defaultPrevented).toBe(true);
    }));

    it('should not preventDefault when pressing ESCAPE with a modifier', fakeAsync(() => {
      tooltipDirective.show();
      tick(0);
      fixture.detectChanges();

      const event = createKeyboardEvent('keydown', ESCAPE, undefined, {alt: true});
      dispatchEvent(document.body, event);
      fixture.detectChanges();
      flush();

      expect(event.defaultPrevented).toBe(false);
    }));

    it('should not show the tooltip on programmatic focus', fakeAsync(() => {
      patchElementFocus(buttonElement);
      assertTooltipInstance(tooltipDirective, false);

      focusMonitor.focusVia(buttonElement, 'program');
      tick(0);
      fixture.detectChanges();
      tick(500);

      expect(overlayContainerElement.querySelector('.mat-mdc-tooltip')).toBeNull();
    }));

    it('should not show the tooltip on mouse focus', fakeAsync(() => {
      patchElementFocus(buttonElement);
      assertTooltipInstance(tooltipDirective, false);

      focusMonitor.focusVia(buttonElement, 'mouse');
      tick(0);
      fixture.detectChanges();
      tick(500);

      expect(overlayContainerElement.querySelector('.mat-mdc-tooltip')).toBeNull();
    }));

    it('should not show the tooltip on touch focus', fakeAsync(() => {
      patchElementFocus(buttonElement);
      assertTooltipInstance(tooltipDirective, false);

      focusMonitor.focusVia(buttonElement, 'touch');
      tick(0);
      fixture.detectChanges();
      tick(500);

      expect(overlayContainerElement.querySelector('.mat-mdc-tooltip')).toBeNull();
    }));

    it('should not hide the tooltip when calling `show` twice in a row', fakeAsync(() => {
      tooltipDirective.show();
      tick(0);
      expect(tooltipDirective._isTooltipVisible()).toBe(true);
      fixture.detectChanges();
      finishCurrentTooltipAnimation(overlayContainerElement, true);

      const overlayRef = tooltipDirective._overlayRef!;

      spyOn(overlayRef, 'detach').and.callThrough();

      tooltipDirective.show();
      tick(0);
      expect(tooltipDirective._isTooltipVisible()).toBe(true);
      fixture.detectChanges();
      finishCurrentTooltipAnimation(overlayContainerElement, true);

      expect(overlayRef.detach).not.toHaveBeenCalled();
    }));

    it('should set a class on the overlay panel that reflects the position', fakeAsync(() => {
      // Move the element so that the primary position is always used.
      buttonElement.style.position = 'fixed';
      buttonElement.style.top = buttonElement.style.left = '200px';

      fixture.componentInstance.message = 'hi';
      fixture.detectChanges();
      setPositionAndShow('below');

      const classList = tooltipDirective._overlayRef!.overlayElement.classList;
      expect(classList).toContain('mat-mdc-tooltip-panel-below');

      setPositionAndShow('above');
      expect(classList).not.toContain('mat-mdc-tooltip-panel-below');
      expect(classList).toContain('mat-mdc-tooltip-panel-above');

      setPositionAndShow('left');
      expect(classList).not.toContain('mat-mdc-tooltip-panel-above');
      expect(classList).toContain('mat-mdc-tooltip-panel-left');

      setPositionAndShow('right');
      expect(classList).not.toContain('mat-mdc-tooltip-panel-left');
      expect(classList).toContain('mat-mdc-tooltip-panel-right');

      function setPositionAndShow(position: TooltipPosition) {
        tooltipDirective.hide(0);
        fixture.detectChanges();
        tick(0);
        tooltipDirective.position = position;
        tooltipDirective.show(0);
        fixture.detectChanges();
        tick(0);
        fixture.detectChanges();
        tick(500);
      }
    }));

    it('should account for RTL when setting the tooltip position class', fakeAsync(() => {
      // Move the element so that the primary position is always used.
      buttonElement.style.position = 'fixed';
      buttonElement.style.top = buttonElement.style.left = '200px';
      fixture.componentInstance.message = 'hi';
      fixture.detectChanges();

      dir.value = 'ltr';
      tooltipDirective.position = 'after';
      tooltipDirective.show(0);
      fixture.detectChanges();
      tick(0);
      fixture.detectChanges();
      tick(500);

      const classList = tooltipDirective._overlayRef!.overlayElement.classList;
      expect(classList).not.toContain('mat-mdc-tooltip-panel-after');
      expect(classList).not.toContain('mat-mdc-tooltip-panel-before');
      expect(classList).not.toContain('mat-mdc-tooltip-panel-left');
      expect(classList).toContain('mat-mdc-tooltip-panel-right');

      tooltipDirective.hide(0);
      fixture.detectChanges();
      tick(0);
      dir.value = 'rtl';
      tooltipDirective.show(0);
      fixture.detectChanges();
      tick(0);
      fixture.detectChanges();
      tick(500);

      expect(classList).not.toContain('mat-mdc-tooltip-panel-after');
      expect(classList).not.toContain('mat-mdc-tooltip-panel-before');
      expect(classList).not.toContain('mat-mdc-tooltip-panel-right');
      expect(classList).toContain('mat-mdc-tooltip-panel-left');
    }));

    it('should clear the show timeout on destroy', fakeAsync(() => {
      assertTooltipInstance(tooltipDirective, false);

      tooltipDirective.show(1000);
      fixture.detectChanges();

      // Note that we aren't asserting anything, but `fakeAsync` will
      // throw if we have any timers by the end of the test.
      fixture.destroy();
    }));

    it('should clear the hide timeout on destroy', fakeAsync(() => {
      assertTooltipInstance(tooltipDirective, false);

      tooltipDirective.show();
      tick(0);
      fixture.detectChanges();
      tick(500);

      tooltipDirective.hide(1000);
      fixture.detectChanges();

      // Note that we aren't asserting anything, but `fakeAsync` will
      // throw if we have any timers by the end of the test.
      fixture.destroy();
    }));

    it('should set the multiline class on tooltips with messages that overflow', fakeAsync(() => {
      fixture.componentInstance.message =
        'This is a very long message that should cause the' +
        'tooltip message body to overflow onto a new line.';
      tooltipDirective.show();
      fixture.detectChanges();
      tick();

      // Need to detect changes again to wait for the multiline class to be applied.
      fixture.detectChanges();

      const tooltipElement = overlayContainerElement.querySelector(
        '.mat-mdc-tooltip',
      ) as HTMLElement;

      expect(tooltipElement.classList).toContain('mdc-tooltip--multiline');
      expect(tooltipDirective._tooltipInstance?._isMultiline).toBeTrue();
    }));

    it('should hide on mouseleave on the trigger', fakeAsync(() => {
      // We don't bind mouse events on mobile devices.
      if (platform.IOS || platform.ANDROID) {
        return;
      }

      dispatchMouseEvent(fixture.componentInstance.button.nativeElement, 'mouseenter');
      fixture.detectChanges();
      tick(0);
      expect(tooltipDirective._isTooltipVisible()).toBe(true);

      dispatchMouseEvent(fixture.componentInstance.button.nativeElement, 'mouseleave');
      fixture.detectChanges();
      tick(0);
      expect(tooltipDirective._isTooltipVisible()).toBe(false);
    }));

    it('should not hide on mouseleave if the pointer goes from the trigger to the tooltip', fakeAsync(() => {
      // We don't bind mouse events on mobile devices.
      if (platform.IOS || platform.ANDROID) {
        return;
      }

      dispatchMouseEvent(fixture.componentInstance.button.nativeElement, 'mouseenter');
      fixture.detectChanges();
      tick(0);
      expect(tooltipDirective._isTooltipVisible()).toBe(true);

      const tooltipElement = overlayContainerElement.querySelector(
        '.mat-mdc-tooltip',
      ) as HTMLElement;
      const event = createMouseEvent('mouseleave');
      Object.defineProperty(event, 'relatedTarget', {value: tooltipElement});

      dispatchEvent(fixture.componentInstance.button.nativeElement, event);
      fixture.detectChanges();
      tick(0);
      expect(tooltipDirective._isTooltipVisible()).toBe(true);
    }));

    it('should hide on mouseleave on the tooltip', fakeAsync(() => {
      // We don't bind mouse events on mobile devices.
      if (platform.IOS || platform.ANDROID) {
        return;
      }

      dispatchMouseEvent(fixture.componentInstance.button.nativeElement, 'mouseenter');
      fixture.detectChanges();
      tick(0);
      expect(tooltipDirective._isTooltipVisible()).toBe(true);

      const tooltipElement = overlayContainerElement.querySelector(
        '.mat-mdc-tooltip',
      ) as HTMLElement;
      dispatchMouseEvent(tooltipElement, 'mouseleave');
      fixture.detectChanges();
      tick(0);
      expect(tooltipDirective._isTooltipVisible()).toBe(false);
    }));

    it('should not hide on mouseleave if the pointer goes from the tooltip to the trigger', fakeAsync(() => {
      // We don't bind mouse events on mobile devices.
      if (platform.IOS || platform.ANDROID) {
        return;
      }

      dispatchMouseEvent(fixture.componentInstance.button.nativeElement, 'mouseenter');
      fixture.detectChanges();
      tick(0);
      expect(tooltipDirective._isTooltipVisible()).toBe(true);

      const tooltipElement = overlayContainerElement.querySelector(
        '.mat-mdc-tooltip',
      ) as HTMLElement;
      const event = createMouseEvent('mouseleave');
      Object.defineProperty(event, 'relatedTarget', {
        value: fixture.componentInstance.button.nativeElement,
      });

      dispatchEvent(tooltipElement, event);
      fixture.detectChanges();
      tick(0);
      expect(tooltipDirective._isTooltipVisible()).toBe(true);
    }));
  });

  describe('fallback positions', () => {
    let fixture: ComponentFixture<BasicTooltipDemo>;
    let tooltip: MatTooltip;

    beforeEach(() => {
      fixture = TestBed.createComponent(BasicTooltipDemo);
      fixture.detectChanges();
      tooltip = fixture.debugElement.query(By.css('button'))!.injector.get<MatTooltip>(MatTooltip);
    });

    it('should set a fallback origin position by inverting the main origin position', () => {
      tooltip.position = 'left';
      expect(tooltip._getOrigin().main.originX).toBe('start');
      expect(tooltip._getOrigin().fallback.originX).toBe('end');

      tooltip.position = 'right';
      expect(tooltip._getOrigin().main.originX).toBe('end');
      expect(tooltip._getOrigin().fallback.originX).toBe('start');

      tooltip.position = 'above';
      expect(tooltip._getOrigin().main.originY).toBe('top');
      expect(tooltip._getOrigin().fallback.originY).toBe('bottom');

      tooltip.position = 'below';
      expect(tooltip._getOrigin().main.originY).toBe('bottom');
      expect(tooltip._getOrigin().fallback.originY).toBe('top');
    });

    it('should set a fallback overlay position by inverting the main overlay position', () => {
      tooltip.position = 'left';
      expect(tooltip._getOverlayPosition().main.overlayX).toBe('end');
      expect(tooltip._getOverlayPosition().fallback.overlayX).toBe('start');

      tooltip.position = 'right';
      expect(tooltip._getOverlayPosition().main.overlayX).toBe('start');
      expect(tooltip._getOverlayPosition().fallback.overlayX).toBe('end');

      tooltip.position = 'above';
      expect(tooltip._getOverlayPosition().main.overlayY).toBe('bottom');
      expect(tooltip._getOverlayPosition().fallback.overlayY).toBe('top');

      tooltip.position = 'below';
      expect(tooltip._getOverlayPosition().main.overlayY).toBe('top');
      expect(tooltip._getOverlayPosition().fallback.overlayY).toBe('bottom');
    });
  });

  describe('scrollable usage', () => {
    let fixture: ComponentFixture<ScrollableTooltipDemo>;
    let buttonDebugElement: DebugElement;
    let tooltipDirective: MatTooltip;

    beforeEach(() => {
      fixture = TestBed.createComponent(ScrollableTooltipDemo);
      fixture.detectChanges();
      buttonDebugElement = fixture.debugElement.query(By.css('button'))!;
      tooltipDirective = buttonDebugElement.injector.get<MatTooltip>(MatTooltip);
    });

    it('should hide tooltip if clipped after changing positions', fakeAsync(() => {
      assertTooltipInstance(tooltipDirective, false);

      // Show the tooltip and tick for the show delay (default is 0)
      tooltipDirective.show();
      fixture.detectChanges();
      tick(0);

      // Expect that the tooltip is displayed
      // Expect that the tooltip is displayed
      expect(tooltipDirective._isTooltipVisible())
        .withContext('Expected tooltip to be initially visible')
        .toBe(true);

      // Scroll the page but tick just before the default throttle should update.
      fixture.componentInstance.scrollDown();
      tick(SCROLL_THROTTLE_MS - 1);
      expect(tooltipDirective._isTooltipVisible())
        .withContext('Expected tooltip to be visible when scrolling, before throttle limit')
        .toBe(true);

      // Finish ticking to the throttle's limit and check that the scroll event notified the
      // tooltip and it was hidden.
      tick(100);
      fixture.detectChanges();
      expect(tooltipDirective._isTooltipVisible())
        .withContext('Expected tooltip hidden when scrolled out of view, after throttle limit')
        .toBe(false);
    }));

    it('should execute the `hide` call, after scrolling away, inside the NgZone', fakeAsync(() => {
      const inZoneSpy = jasmine.createSpy('in zone spy');

      tooltipDirective.show();
      fixture.detectChanges();
      tick(0);

      spyOn(tooltipDirective._tooltipInstance!, 'hide').and.callFake(() => {
        inZoneSpy(NgZone.isInAngularZone());
      });

      fixture.componentInstance.scrollDown();
      tick(100);
      fixture.detectChanges();

      expect(inZoneSpy).toHaveBeenCalled();
      expect(inZoneSpy).toHaveBeenCalledWith(true);
    }));
  });

  describe('with OnPush', () => {
    let fixture: ComponentFixture<OnPushTooltipDemo>;
    let buttonDebugElement: DebugElement;
    let buttonElement: HTMLButtonElement;
    let tooltipDirective: MatTooltip;

    beforeEach(() => {
      fixture = TestBed.createComponent(OnPushTooltipDemo);
      fixture.detectChanges();
      buttonDebugElement = fixture.debugElement.query(By.css('button'))!;
      buttonElement = <HTMLButtonElement>buttonDebugElement.nativeElement;
      tooltipDirective = buttonDebugElement.injector.get<MatTooltip>(MatTooltip);
    });

    it('should show and hide the tooltip', fakeAsync(() => {
      assertTooltipInstance(tooltipDirective, false);

      tooltipDirective.show();
      tick(0); // Tick for the show delay (default is 0)
      expect(tooltipDirective._isTooltipVisible()).toBe(true);

      fixture.detectChanges();

      // wait until animation has finished
      finishCurrentTooltipAnimation(overlayContainerElement, true);

      // Make sure tooltip is shown to the user and animation has finished
      const tooltipElement = overlayContainerElement.querySelector(
        '.mat-mdc-tooltip',
      ) as HTMLElement;
      expect(tooltipElement instanceof HTMLElement).toBe(true);
      expect(tooltipElement.classList).toContain('mat-mdc-tooltip-show');

      // After hide called, a timeout delay is created that will to hide the tooltip.
      const tooltipDelay = 1000;
      tooltipDirective.hide(tooltipDelay);
      expect(tooltipDirective._isTooltipVisible()).toBe(true);

      // After the tooltip delay elapses, expect that the tooltip is not visible.
      tick(tooltipDelay);
      fixture.detectChanges();
      expect(tooltipDirective._isTooltipVisible()).toBe(false);

      // On animation complete, should expect that the tooltip has been detached.
      finishCurrentTooltipAnimation(overlayContainerElement, false);
      assertTooltipInstance(tooltipDirective, false);
    }));

    it('should have rendered the tooltip text on init', fakeAsync(() => {
      // We don't bind mouse events on mobile devices.
      if (platform.IOS || platform.ANDROID) {
        return;
      }

      dispatchFakeEvent(buttonElement, 'mouseenter');
      fixture.detectChanges();
      tick(0);

      const tooltipElement = overlayContainerElement.querySelector(
        '.mat-mdc-tooltip',
      ) as HTMLElement;
      expect(tooltipElement.textContent).toContain('initial tooltip message');
    }));
  });

  describe('touch gestures', () => {
    beforeEach(() => {
      platform.ANDROID = true;
    });

    it('should have a delay when showing on touchstart', fakeAsync(() => {
      const fixture = TestBed.createComponent(BasicTooltipDemo);
      fixture.detectChanges();
      const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');

      dispatchFakeEvent(button, 'touchstart');
      fixture.detectChanges();
      tick(250); // Halfway through the delay.

      assertTooltipInstance(fixture.componentInstance.tooltip, false);

      tick(500); // Finish the delay.
      fixture.detectChanges();
      finishCurrentTooltipAnimation(overlayContainerElement, true); // Finish the animation.

      assertTooltipInstance(fixture.componentInstance.tooltip, true);
    }));

    it('should be able to disable opening on touch', fakeAsync(() => {
      const fixture = TestBed.createComponent(BasicTooltipDemo);
      fixture.componentInstance.touchGestures = 'off';
      fixture.detectChanges();
      const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');

      dispatchFakeEvent(button, 'touchstart');
      fixture.detectChanges();
      tick(500); // Finish the delay.
      fixture.detectChanges();
      tick(500); // Finish the animation.

      assertTooltipInstance(fixture.componentInstance.tooltip, false);
    }));

    it('should not prevent the default action on touchstart', () => {
      const fixture = TestBed.createComponent(BasicTooltipDemo);
      fixture.detectChanges();
      const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
      const event = dispatchFakeEvent(button, 'touchstart');
      fixture.detectChanges();

      expect(event.defaultPrevented).toBe(false);
    });

    it('should close on touchend with a delay', fakeAsync(() => {
      const fixture = TestBed.createComponent(BasicTooltipDemo);
      fixture.detectChanges();
      const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');

      dispatchFakeEvent(button, 'touchstart');
      fixture.detectChanges();
      tick(500); // Finish the open delay.
      fixture.detectChanges();
      finishCurrentTooltipAnimation(overlayContainerElement, true); // Finish the animation.
      assertTooltipInstance(fixture.componentInstance.tooltip, true);

      dispatchFakeEvent(button, 'touchend');
      fixture.detectChanges();
      tick(1000); // 2/3 through the delay
      assertTooltipInstance(fixture.componentInstance.tooltip, true);

      tick(500); // Finish the delay.
      fixture.detectChanges();
      finishCurrentTooltipAnimation(overlayContainerElement, false); // Finish the exit animation.

      assertTooltipInstance(fixture.componentInstance.tooltip, false);
    }));

    it('should close on touchcancel with a delay', fakeAsync(() => {
      const fixture = TestBed.createComponent(BasicTooltipDemo);
      fixture.detectChanges();
      const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');

      dispatchFakeEvent(button, 'touchstart');
      fixture.detectChanges();
      tick(500); // Finish the open delay.
      fixture.detectChanges();
      finishCurrentTooltipAnimation(overlayContainerElement, true); // Finish the animation.
      assertTooltipInstance(fixture.componentInstance.tooltip, true);

      dispatchFakeEvent(button, 'touchcancel');
      fixture.detectChanges();
      tick(1000); // 2/3 through the delay
      assertTooltipInstance(fixture.componentInstance.tooltip, true);

      tick(500); // Finish the delay.
      fixture.detectChanges();
      finishCurrentTooltipAnimation(overlayContainerElement, false); // Finish the exit animation.

      assertTooltipInstance(fixture.componentInstance.tooltip, false);
    }));

    it('should disable native touch interactions', () => {
      const fixture = TestBed.createComponent(BasicTooltipDemo);
      fixture.detectChanges();

      const styles = fixture.nativeElement.querySelector('button').style;
      expect(styles.touchAction || (styles as any).webkitUserDrag).toBe('none');
    });

    it('should allow native touch interactions if touch gestures are turned off', () => {
      const fixture = TestBed.createComponent(BasicTooltipDemo);
      fixture.componentInstance.touchGestures = 'off';
      fixture.detectChanges();

      const styles = fixture.nativeElement.querySelector('button').style;
      expect(styles.touchAction || (styles as any).webkitUserDrag).toBeFalsy();
    });

    it('should allow text selection on inputs when gestures are set to auto', () => {
      const fixture = TestBed.createComponent(TooltipOnTextFields);
      fixture.detectChanges();

      const inputStyle = fixture.componentInstance.input.nativeElement.style;
      const textareaStyle = fixture.componentInstance.textarea.nativeElement.style;

      expect(inputStyle.userSelect).toBeFalsy();
      expect(inputStyle.webkitUserSelect).toBeFalsy();
      expect((inputStyle as any).msUserSelect).toBeFalsy();
      expect((inputStyle as any).MozUserSelect).toBeFalsy();

      expect(textareaStyle.userSelect).toBeFalsy();
      expect(textareaStyle.webkitUserSelect).toBeFalsy();
      expect((textareaStyle as any).msUserSelect).toBeFalsy();
      expect((textareaStyle as any).MozUserSelect).toBeFalsy();
    });

    it('should disable text selection on inputs when gestures are set to on', () => {
      const fixture = TestBed.createComponent(TooltipOnTextFields);
      fixture.componentInstance.touchGestures = 'on';
      fixture.detectChanges();

      const inputStyle = fixture.componentInstance.input.nativeElement.style;
      const inputUserSelect =
        inputStyle.userSelect ||
        inputStyle.webkitUserSelect ||
        (inputStyle as any).msUserSelect ||
        (inputStyle as any).MozUserSelect;
      const textareaStyle = fixture.componentInstance.textarea.nativeElement.style;
      const textareaUserSelect =
        textareaStyle.userSelect ||
        textareaStyle.webkitUserSelect ||
        (textareaStyle as any).msUserSelect ||
        (textareaStyle as any).MozUserSelect;

      expect(inputUserSelect).toBe('none');
      expect(textareaUserSelect).toBe('none');
    });

    it('should allow native dragging on draggable elements when gestures are set to auto', () => {
      const fixture = TestBed.createComponent(TooltipOnDraggableElement);
      fixture.detectChanges();

      expect(fixture.componentInstance.button.nativeElement.style.webkitUserDrag).toBeFalsy();
    });

    it('should disable native dragging on draggable elements when gestures are set to on', () => {
      const fixture = TestBed.createComponent(TooltipOnDraggableElement);
      fixture.componentInstance.touchGestures = 'on';
      fixture.detectChanges();

      const styles = fixture.componentInstance.button.nativeElement.style;

      if ('webkitUserDrag' in styles) {
        expect(styles.webkitUserDrag).toBe('none');
      }
    });

    it('should not open on `mouseenter` on iOS', () => {
      platform.IOS = true;
      platform.ANDROID = false;

      const fixture = TestBed.createComponent(BasicTooltipDemo);

      fixture.detectChanges();
      dispatchMouseEvent(fixture.componentInstance.button.nativeElement, 'mouseenter');
      fixture.detectChanges();

      assertTooltipInstance(fixture.componentInstance.tooltip, false);
    });

    it('should not open on `mouseenter` on Android', () => {
      platform.ANDROID = true;
      platform.IOS = false;

      const fixture = TestBed.createComponent(BasicTooltipDemo);

      fixture.detectChanges();
      dispatchMouseEvent(fixture.componentInstance.button.nativeElement, 'mouseenter');
      fixture.detectChanges();

      assertTooltipInstance(fixture.componentInstance.tooltip, false);
    });
  });

  describe('mouse wheel handling', () => {
    it('should close when a wheel event causes the cursor to leave the trigger', fakeAsync(() => {
      // We don't bind wheel events on mobile devices.
      if (platform.IOS || platform.ANDROID) {
        return;
      }

      const fixture = TestBed.createComponent(BasicTooltipDemo);
      fixture.detectChanges();
      const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');

      dispatchFakeEvent(button, 'mouseenter');
      fixture.detectChanges();
      tick(500); // Finish the open delay.
      fixture.detectChanges();
      finishCurrentTooltipAnimation(overlayContainerElement, true);
      assertTooltipInstance(fixture.componentInstance.tooltip, true);

      // Simulate the pointer at the bottom/right of the page.
      const wheelEvent = createFakeEvent('wheel');
      Object.defineProperties(wheelEvent, {
        clientX: {get: () => window.innerWidth},
        clientY: {get: () => window.innerHeight},
      });

      dispatchEvent(button, wheelEvent);
      fixture.detectChanges();
      tick(1500); // Finish the delay.
      fixture.detectChanges();
      finishCurrentTooltipAnimation(overlayContainerElement, false);

      assertTooltipInstance(fixture.componentInstance.tooltip, false);
    }));

    it('should not close if the cursor is over the trigger after a wheel event', fakeAsync(() => {
      // We don't bind wheel events on mobile devices.
      if (platform.IOS || platform.ANDROID) {
        return;
      }

      const fixture = TestBed.createComponent(BasicTooltipDemo);
      fixture.detectChanges();
      const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');

      dispatchFakeEvent(button, 'mouseenter');
      fixture.detectChanges();
      tick(500); // Finish the open delay.
      fixture.detectChanges();
      finishCurrentTooltipAnimation(overlayContainerElement, true);
      assertTooltipInstance(fixture.componentInstance.tooltip, true);

      // Simulate the pointer over the trigger.
      const triggerRect = button.getBoundingClientRect();
      const wheelEvent = createFakeEvent('wheel');
      Object.defineProperties(wheelEvent, {
        clientX: {get: () => triggerRect.left + 1},
        clientY: {get: () => triggerRect.top + 1},
      });

      dispatchEvent(button, wheelEvent);
      fixture.detectChanges();
      tick(1500); // Finish the delay.
      fixture.detectChanges();
      finishCurrentTooltipAnimation(overlayContainerElement, false);

      assertTooltipInstance(fixture.componentInstance.tooltip, true);
    }));
  });
});

@Component({
  selector: 'app',
  template: `
    <button #button
            *ngIf="showButton"
            [matTooltip]="message"
            [matTooltipPosition]="position"
            [matTooltipClass]="{'custom-one': showTooltipClass, 'custom-two': showTooltipClass }"
            [matTooltipTouchGestures]="touchGestures">
      Button
    </button>`,
})
class BasicTooltipDemo {
  position: string = 'below';
  message: any = initialTooltipMessage;
  showButton: boolean = true;
  showTooltipClass = false;
  touchGestures: TooltipTouchGestures = 'auto';
  @ViewChild(MatTooltip) tooltip: MatTooltip;
  @ViewChild('button') button: ElementRef<HTMLButtonElement>;
}

@Component({
  selector: 'app',
  template: `
    <div cdkScrollable style="padding: 100px; margin: 300px;
                               height: 200px; width: 200px; overflow: auto;">
      <button *ngIf="showButton" style="margin-bottom: 600px"
              [matTooltip]="message"
              [matTooltipPosition]="position">
        Button
      </button>
    </div>`,
})
class ScrollableTooltipDemo {
  position: string = 'below';
  message: string = initialTooltipMessage;
  showButton: boolean = true;

  @ViewChild(CdkScrollable) scrollingContainer: CdkScrollable;

  scrollDown() {
    const scrollingContainerEl = this.scrollingContainer.getElementRef().nativeElement;
    scrollingContainerEl.scrollTop = 250;

    // Emit a scroll event from the scrolling element in our component.
    // This event should be picked up by the scrollable directive and notify.
    // The notification should be picked up by the service.
    dispatchFakeEvent(scrollingContainerEl, 'scroll');
  }
}

@Component({
  selector: 'app',
  template: `
    <button [matTooltip]="message"
            [matTooltipPosition]="position">
      Button
    </button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class OnPushTooltipDemo {
  position: string = 'below';
  message: string = initialTooltipMessage;
}

@Component({
  selector: 'app',
  template: `
    <button *ngFor="let tooltip of tooltips"
            [matTooltip]="tooltip">
      Button {{tooltip}}
    </button>`,
})
class DynamicTooltipsDemo {
  tooltips: string[] = [];
}

@Component({
  template: `<button [matTooltip]="message" [attr.aria-label]="message">Click me</button>`,
})
class DataBoundAriaLabelTooltip {
  message = 'Hello there';
}

@Component({
  template: `
    <input
      #input
      matTooltip="Something"
      [matTooltipTouchGestures]="touchGestures">

    <textarea
      #textarea
      matTooltip="Another thing"
      [matTooltipTouchGestures]="touchGestures"></textarea>
  `,
})
class TooltipOnTextFields {
  @ViewChild('input') input: ElementRef<HTMLInputElement>;
  @ViewChild('textarea') textarea: ElementRef<HTMLTextAreaElement>;
  touchGestures: TooltipTouchGestures = 'auto';
}

@Component({
  template: `
    <button
      #button
      draggable="true"
      matTooltip="Drag me"
      [matTooltipTouchGestures]="touchGestures"></button>
  `,
})
class TooltipOnDraggableElement {
  @ViewChild('button') button: ElementRef;
  touchGestures: TooltipTouchGestures = 'auto';
}

@Component({
  selector: 'app',
  template: `<button #button [matTooltip]="message">Button</button>`,
})
class TooltipDemoWithoutPositionBinding {
  message: any = initialTooltipMessage;
  @ViewChild(MatTooltip) tooltip: MatTooltip;
  @ViewChild('button') button: ElementRef<HTMLButtonElement>;
}

@Component({
  selector: 'app',
  styles: [`button { width: 500px; height: 500px; }`],
  template: `<button #button [matTooltip]="message">Button</button>`,
})
class WideTooltipDemo {
  message = 'Test';
  @ViewChild(MatTooltip) tooltip: MatTooltip;
  @ViewChild('button') button: ElementRef<HTMLButtonElement>;
}

/** Asserts whether a tooltip directive has a tooltip instance. */
function assertTooltipInstance(tooltip: MatTooltip, shouldExist: boolean): void {
  // Note that we have to cast this to a boolean, because Jasmine will go into an infinite loop
  // if it tries to stringify the `_tooltipInstance` when an assertion fails. The infinite loop
  // happens due to the `_tooltipInstance` having a circular structure.
  expect(!!tooltip._tooltipInstance).toBe(shouldExist);
}

function finishCurrentTooltipAnimation(overlayContainer: HTMLElement, isVisible: boolean) {
  const tooltip = overlayContainer.querySelector('.mat-mdc-tooltip')!;
  const event = createFakeEvent('animationend');
  Object.defineProperty(event, 'animationName', {
    get: () => `mat-mdc-tooltip-${isVisible ? 'show' : 'hide'}`,
  });
  dispatchEvent(tooltip, event);
}
