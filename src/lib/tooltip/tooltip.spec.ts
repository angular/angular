import {
  async,
  ComponentFixture,
  fakeAsync,
  flushMicrotasks,
  inject,
  TestBed,
  tick
} from '@angular/core/testing';
import {
  ChangeDetectionStrategy,
  Component,
  DebugElement,
  ElementRef,
  ViewChild,
  NgZone,
} from '@angular/core';
import {AnimationEvent} from '@angular/animations';
import {By} from '@angular/platform-browser';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {Direction, Directionality} from '@angular/cdk/bidi';
import {OverlayContainer, OverlayModule, CdkScrollable} from '@angular/cdk/overlay';
import {Platform} from '@angular/cdk/platform';
import {dispatchFakeEvent, dispatchKeyboardEvent} from '@angular/cdk/testing';
import {ESCAPE} from '@angular/cdk/keycodes';
import {
  MatTooltip,
  MatTooltipModule,
  SCROLL_THROTTLE_MS,
  TOOLTIP_PANEL_CLASS,
  TooltipPosition,
  MAT_TOOLTIP_DEFAULT_OPTIONS,
} from './index';


const initialTooltipMessage = 'initial tooltip message';

describe('MatTooltip', () => {
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;
  let dir: {value: Direction};
  let platform: {IOS: boolean, isBrowser: boolean};

  beforeEach(async(() => {
    // Set the default Platform override that can be updated before component creation.
    platform = {IOS: false, isBrowser: true};

    TestBed.configureTestingModule({
      imports: [MatTooltipModule, OverlayModule, NoopAnimationsModule],
      declarations: [
        BasicTooltipDemo,
        ScrollableTooltipDemo,
        OnPushTooltipDemo,
        DynamicTooltipsDemo,
        TooltipOnTextFields
      ],
      providers: [
        {provide: Platform, useFactory: () => platform},
        {provide: Directionality, useFactory: () => {
          return dir = {value: 'ltr'};
        }}
      ]
    });

    TestBed.compileComponents();

    inject([OverlayContainer], (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    })();
  }));

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  describe('basic usage', () => {
    let fixture: ComponentFixture<BasicTooltipDemo>;
    let buttonDebugElement: DebugElement;
    let buttonElement: HTMLButtonElement;
    let tooltipDirective: MatTooltip;

    beforeEach(() => {
      fixture = TestBed.createComponent(BasicTooltipDemo);
      fixture.detectChanges();
      buttonDebugElement = fixture.debugElement.query(By.css('button'));
      buttonElement = <HTMLButtonElement> buttonDebugElement.nativeElement;
      tooltipDirective = buttonDebugElement.injector.get<MatTooltip>(MatTooltip);
    });

    it('should show and hide the tooltip', fakeAsync(() => {
      assertTooltipInstance(tooltipDirective, false);

      tooltipDirective.show();
      tick(0); // Tick for the show delay (default is 0)
      expect(tooltipDirective._isTooltipVisible()).toBe(true);

      fixture.detectChanges();

      // wait till animation has finished
      tick(500);

      // Make sure tooltip is shown to the user and animation has finished
      const tooltipElement = overlayContainerElement.querySelector('.mat-tooltip') as HTMLElement;
      expect(tooltipElement instanceof HTMLElement).toBe(true);
      expect(tooltipElement.style.transform).toBe('scale(1)');

      expect(overlayContainerElement.textContent).toContain(initialTooltipMessage);

      // After hide called, a timeout delay is created that will to hide the tooltip.
      const tooltipDelay = 1000;
      tooltipDirective.hide(tooltipDelay);
      expect(tooltipDirective._isTooltipVisible()).toBe(true);

      // After the tooltip delay elapses, expect that the tooltip is not visible.
      tick(tooltipDelay);
      fixture.detectChanges();
      expect(tooltipDirective._isTooltipVisible()).toBe(false);

      // On animation complete, should expect that the tooltip has been detached.
      flushMicrotasks();
      assertTooltipInstance(tooltipDirective, false);
    }));

    it('should be able to re-open a tooltip if it was closed by detaching the overlay',
      fakeAsync(() => {
        tooltipDirective.show();
        tick(0);
        expect(tooltipDirective._isTooltipVisible()).toBe(true);
        fixture.detectChanges();
        tick(500);

        tooltipDirective._overlayRef!.detach();
        tick(0);
        fixture.detectChanges();
        expect(tooltipDirective._isTooltipVisible()).toBe(false);
        flushMicrotasks();
        assertTooltipInstance(tooltipDirective, false);

        tooltipDirective.show();
        tick(0);
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
      TestBed
        .resetTestingModule()
        .configureTestingModule({
          imports: [MatTooltipModule, OverlayModule, NoopAnimationsModule],
          declarations: [BasicTooltipDemo],
          providers: [{
            provide: MAT_TOOLTIP_DEFAULT_OPTIONS,
            useValue: {showDelay: 1337, hideDelay: 7331}
          }]
        })
        .compileComponents();

      fixture = TestBed.createComponent(BasicTooltipDemo);
      fixture.detectChanges();
      tooltipDirective = fixture.debugElement.query(By.css('button')).injector.get(MatTooltip);

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

    it('should set a css class on the overlay panel element', fakeAsync(() => {
      tooltipDirective.show();
      fixture.detectChanges();
      tick(0);

      const overlayRef = tooltipDirective._overlayRef;

      expect(overlayRef).not.toBeNull();
      expect(overlayRef!.overlayElement.classList).toContain(TOOLTIP_PANEL_CLASS,
          'Expected the overlay panel element to have the tooltip panel class set.');
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

    it('should not show if hide is called before delay finishes', async(() => {
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

    it('should remove the tooltip when changing position', () => {
      const initialPosition: TooltipPosition = 'below';
      const changedPosition: TooltipPosition = 'above';

      assertTooltipInstance(tooltipDirective, false);

      tooltipDirective.position = initialPosition;
      tooltipDirective.show();
      expect(tooltipDirective._tooltipInstance).toBeDefined();

      // Same position value should not remove the tooltip
      tooltipDirective.position = initialPosition;
      expect(tooltipDirective._tooltipInstance).toBeDefined();

      // Different position value should destroy the tooltip
      tooltipDirective.position = changedPosition;
      assertTooltipInstance(tooltipDirective, false);
      expect(tooltipDirective._overlayRef).toBeNull();
    });

    it('should be able to modify the tooltip message', fakeAsync(() => {
      assertTooltipInstance(tooltipDirective, false);

      tooltipDirective.show();
      tick(0); // Tick for the show delay (default is 0)
      expect(tooltipDirective._tooltipInstance!._visibility).toBe('visible');

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
      let tooltipElement = overlayContainerElement.querySelector('.mat-tooltip') as HTMLElement;
      expect(tooltipElement.classList).not.toContain('custom-one',
        'Expected to not have the class before enabling matTooltipClass');
      expect(tooltipElement.classList).not.toContain('custom-two',
        'Expected to not have the class before enabling matTooltipClass');

      // Enable the classes via ngClass syntax
      fixture.componentInstance.showTooltipClass = true;
      fixture.detectChanges();

      // Make sure classes are correctly added
      tooltipElement = overlayContainerElement.querySelector('.mat-tooltip') as HTMLElement;
      expect(tooltipElement.classList).toContain('custom-one',
        'Expected to have the class after enabling matTooltipClass');
      expect(tooltipElement.classList).toContain('custom-two',
        'Expected to have the class after enabling matTooltipClass');
    }));

    it('should be removed after parent destroyed', fakeAsync(() => {
      tooltipDirective.show();
      tick(0); // Tick for the show delay (default is 0)
      expect(tooltipDirective._isTooltipVisible()).toBe(true);

      fixture.destroy();
      expect(overlayContainerElement.childNodes.length).toBe(0);
      expect(overlayContainerElement.textContent).toBe('');
    }));

    it('should have an aria-described element with the tooltip message', () => {
      const dynamicTooltipsDemoFixture = TestBed.createComponent(DynamicTooltipsDemo);
      const dynamicTooltipsComponent = dynamicTooltipsDemoFixture.componentInstance;

      dynamicTooltipsComponent.tooltips = ['Tooltip One', 'Tooltip Two'];
      dynamicTooltipsDemoFixture.detectChanges();

      const buttons = dynamicTooltipsComponent.getButtons();
      const firstButtonAria = buttons[0].getAttribute('aria-describedby');
      expect(document.querySelector(`#${firstButtonAria}`)!.textContent).toBe('Tooltip One');

      const secondButtonAria = buttons[1].getAttribute('aria-describedby');
      expect(document.querySelector(`#${secondButtonAria}`)!.textContent).toBe('Tooltip Two');
    });

    it('should not try to dispose the tooltip when destroyed and done hiding', fakeAsync(() => {
      tooltipDirective.show();
      fixture.detectChanges();
      tick(150);

      const tooltipDelay = 1000;
      tooltipDirective.hide();
      tick(tooltipDelay); // Change the tooltip state to hidden and trigger animation start

      // Store the tooltip instance, which will be set to null after the button is hidden.
      const tooltipInstance = tooltipDirective._tooltipInstance!;
      fixture.componentInstance.showButton = false;
      fixture.detectChanges();

      // At this point the animation should be able to complete itself and trigger the
      // _animationDone function, but for unknown reasons in the test infrastructure,
      // this does not occur. Manually call this and verify that doing so does not
      // throw an error.
      tooltipInstance._animationDone({
        fromState: 'visible',
        toState: 'hidden',
        totalTime: 150,
        phaseName: 'done',
      } as AnimationEvent);
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

      // Test expectations in LTR
      dir.value = 'rtl';
      tooltipDirective.position = 'before';
      expect(tooltipDirective._getOrigin().main).toEqual(rightOrigin);
      tooltipDirective.position = 'after';
      expect(tooltipDirective._getOrigin().main).toEqual(leftOrigin);
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

      // Test expectations in LTR
      dir.value = 'rtl';
      tooltipDirective.position = 'before';
      expect(tooltipDirective._getOverlayPosition().main).toEqual(rightOverlayPosition);
      tooltipDirective.position = 'after';
      expect(tooltipDirective._getOverlayPosition().main).toEqual(leftOverlayPosition);
    });

    it('should have consistent left transform origin in any dir', () => {
      tooltipDirective.position = 'right';
      tooltipDirective.show();
      fixture.detectChanges();
      expect(tooltipDirective._tooltipInstance!._transformOrigin).toBe('left');

      tooltipDirective.position = 'after';
      tooltipDirective.show();
      fixture.detectChanges();
      expect(tooltipDirective._tooltipInstance!._transformOrigin).toBe('left');

      dir.value = 'rtl';
      tooltipDirective.position = 'before';
      tooltipDirective.show();
      fixture.detectChanges();
      expect(tooltipDirective._tooltipInstance!._transformOrigin).toBe('left');
    });

    it('should have consistent right transform origin in any dir', () => {
      // Move the button away from the edge of the screen so
      // we don't get into the fallback positions.
      fixture.componentInstance.button.nativeElement.style.margin = '200px';

      tooltipDirective.position = 'left';
      tooltipDirective.show();
      fixture.detectChanges();
      expect(tooltipDirective._tooltipInstance!._transformOrigin).toBe('right');

      tooltipDirective.position = 'before';
      tooltipDirective.show();
      fixture.detectChanges();
      expect(tooltipDirective._tooltipInstance!._transformOrigin).toBe('right');

      dir.value = 'rtl';
      tooltipDirective.position = 'after';
      tooltipDirective.show();
      fixture.detectChanges();
      expect(tooltipDirective._tooltipInstance!._transformOrigin).toBe('right');
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

      const tooltipWrapper = overlayContainerElement.querySelector('.cdk-overlay-pane')!;

      expect(tooltipWrapper).toBeTruthy('Expected tooltip to be shown.');
      expect(tooltipWrapper.getAttribute('dir')).toBe('rtl', 'Expected tooltip to be in RTL mode.');
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
      tick(500);

      expect(tooltipDirective._isTooltipVisible()).toBe(true);
      expect(overlayContainerElement.textContent).toContain(initialTooltipMessage);

      document.body.click();
      tick(0);
      fixture.detectChanges();
      tick(500);

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

      expect(overlayContainerElement.textContent).toContain(initialTooltipMessage);
    }));

    it('should not throw when pressing ESCAPE', fakeAsync(() => {
      expect(() => {
        dispatchKeyboardEvent(buttonElement, 'keydown', ESCAPE);
        fixture.detectChanges();
      }).not.toThrow();

      tick(0);
    }));

    it('should not show the tooltip on progammatic focus', fakeAsync(() => {
      assertTooltipInstance(tooltipDirective, false);

      buttonElement.focus();
      tick(0);
      fixture.detectChanges();
      tick(500);

      expect(overlayContainerElement.querySelector('.mat-tooltip')).toBeNull();
    }));


  });

  describe('fallback positions', () => {
    let fixture: ComponentFixture<BasicTooltipDemo>;
    let tooltip: MatTooltip;

    beforeEach(() => {
      fixture = TestBed.createComponent(BasicTooltipDemo);
      fixture.detectChanges();
      tooltip = fixture.debugElement.query(By.css('button')).injector.get<MatTooltip>(MatTooltip);
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
    let buttonElement: HTMLButtonElement;
    let tooltipDirective: MatTooltip;

    beforeEach(() => {
      fixture = TestBed.createComponent(ScrollableTooltipDemo);
      fixture.detectChanges();
      buttonDebugElement = fixture.debugElement.query(By.css('button'));
      buttonElement = <HTMLButtonElement> buttonDebugElement.nativeElement;
      tooltipDirective = buttonDebugElement.injector.get<MatTooltip>(MatTooltip);
    });

    it('should hide tooltip if clipped after changing positions', fakeAsync(() => {
      assertTooltipInstance(tooltipDirective, false);

      // Show the tooltip and tick for the show delay (default is 0)
      tooltipDirective.show();
      fixture.detectChanges();
      tick(0);

      // Expect that the tooltip is displayed
      expect(tooltipDirective._isTooltipVisible())
          .toBe(true, 'Expected tooltip to be initially visible');

      // Scroll the page but tick just before the default throttle should update.
      fixture.componentInstance.scrollDown();
      tick(SCROLL_THROTTLE_MS - 1);
      expect(tooltipDirective._isTooltipVisible())
          .toBe(true, 'Expected tooltip to be visible when scrolling, before throttle limit');

      // Finish ticking to the throttle's limit and check that the scroll event notified the
      // tooltip and it was hidden.
      tick(100);
      fixture.detectChanges();
      expect(tooltipDirective._isTooltipVisible())
          .toBe(false, 'Expected tooltip hidden when scrolled out of view, after throttle limit');
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
      buttonDebugElement = fixture.debugElement.query(By.css('button'));
      buttonElement = <HTMLButtonElement> buttonDebugElement.nativeElement;
      tooltipDirective = buttonDebugElement.injector.get<MatTooltip>(MatTooltip);
    });

    it('should show and hide the tooltip', fakeAsync(() => {
      assertTooltipInstance(tooltipDirective, false);

      tooltipDirective.show();
      tick(0); // Tick for the show delay (default is 0)
      expect(tooltipDirective._isTooltipVisible()).toBe(true);

      fixture.detectChanges();

      // wait until animation has finished
      tick(500);

      // Make sure tooltip is shown to the user and animation has finished
      const tooltipElement = overlayContainerElement.querySelector('.mat-tooltip') as HTMLElement;
      expect(tooltipElement instanceof HTMLElement).toBe(true);
      expect(tooltipElement.style.transform).toBe('scale(1)');

      // After hide called, a timeout delay is created that will to hide the tooltip.
      const tooltipDelay = 1000;
      tooltipDirective.hide(tooltipDelay);
      expect(tooltipDirective._isTooltipVisible()).toBe(true);

      // After the tooltip delay elapses, expect that the tooltip is not visible.
      tick(tooltipDelay);
      fixture.detectChanges();
      expect(tooltipDirective._isTooltipVisible()).toBe(false);

      // On animation complete, should expect that the tooltip has been detached.
      flushMicrotasks();
      assertTooltipInstance(tooltipDirective, false);
    }));

    it('should have rendered the tooltip text on init', fakeAsync(() => {
      dispatchFakeEvent(buttonElement, 'mouseenter');
      fixture.detectChanges();
      tick(0);

      const tooltipElement = overlayContainerElement.querySelector('.mat-tooltip') as HTMLElement;
      expect(tooltipElement.textContent).toContain('initial tooltip message');
    }));
  });

  describe('special cases', () => {
    it('should clear the `user-select` when a tooltip is set on a text field in iOS', () => {
      platform.IOS = true;

      const fixture = TestBed.createComponent(TooltipOnTextFields);
      const instance = fixture.componentInstance;

      fixture.detectChanges();

      expect(instance.input.nativeElement.style.userSelect).toBeFalsy();
      expect(instance.input.nativeElement.style.webkitUserSelect).toBeFalsy();

      expect(instance.textarea.nativeElement.style.userSelect).toBeFalsy();
      expect(instance.textarea.nativeElement.style.webkitUserSelect).toBeFalsy();
    });
  });

});

@Component({
  selector: 'app',
  template: `
    <button #button
            *ngIf="showButton"
            [matTooltip]="message"
            [matTooltipPosition]="position"
            [matTooltipClass]="{'custom-one': showTooltipClass, 'custom-two': showTooltipClass }">
      Button
    </button>`
})
class BasicTooltipDemo {
  position: string = 'below';
  message: any = initialTooltipMessage;
  showButton: boolean = true;
  showTooltipClass = false;
  @ViewChild(MatTooltip) tooltip: MatTooltip;
  @ViewChild('button') button: ElementRef;
}

@Component({
     selector: 'app',
     template: `
    <div cdk-scrollable style="padding: 100px; margin: 300px;
                               height: 200px; width: 200px; overflow: auto;">
      <button *ngIf="showButton" style="margin-bottom: 600px"
              [matTooltip]="message"
              [matTooltipPosition]="position">
        Button
      </button>
    </div>`
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
  changeDetection: ChangeDetectionStrategy.OnPush
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
  tooltips: Array<string> = [];

  constructor(private _elementRef: ElementRef) {}

  getButtons() {
    return this._elementRef.nativeElement.querySelectorAll('button');
  }
}

@Component({
  template: `
    <input
      #input
      style="user-select: none; -webkit-user-select: none"
      matTooltip="Something">

    <textarea
      #textarea
      style="user-select: none; -webkit-user-select: none"
      matTooltip="Another thing"></textarea>
  `,
})
class TooltipOnTextFields {
  @ViewChild('input') input: ElementRef;
  @ViewChild('textarea') textarea: ElementRef;
}

/** Asserts whether a tooltip directive has a tooltip instance. */
function assertTooltipInstance(tooltip: MatTooltip, shouldExist: boolean): void {
  // Note that we have to cast this to a boolean, because Jasmine will go into an infinite loop
  // if it tries to stringify the `_tooltipInstance` when an assertion fails. The infinite loop
  // happens due to the `_tooltipInstance` having a circular structure.
  expect(!!tooltip._tooltipInstance).toBe(shouldExist);
}
