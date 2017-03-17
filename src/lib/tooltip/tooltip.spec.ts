import {
  async,
  ComponentFixture,
  TestBed,
  tick,
  fakeAsync,
  flushMicrotasks
} from '@angular/core/testing';
import {
  Component,
  DebugElement,
  AnimationTransitionEvent,
  ViewChild,
  ChangeDetectionStrategy
} from '@angular/core';
import {By} from '@angular/platform-browser';
import {TooltipPosition, MdTooltip, MdTooltipModule, SCROLL_THROTTLE_MS} from './index';
import {OverlayContainer} from '../core';
import {Dir, LayoutDirection} from '../core/rtl/dir';
import {OverlayModule} from '../core/overlay/overlay-directives';
import {Platform} from '../core/platform/platform';
import {Scrollable} from '../core/overlay/scroll/scrollable';
import {dispatchFakeEvent} from '../core/testing/dispatch-events';


const initialTooltipMessage = 'initial tooltip message';

describe('MdTooltip', () => {
  let overlayContainerElement: HTMLElement;
  let dir: {value: LayoutDirection};

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdTooltipModule.forRoot(), OverlayModule],
      declarations: [BasicTooltipDemo, ScrollableTooltipDemo, OnPushTooltipDemo],
      providers: [
        Platform,
        {provide: OverlayContainer, useFactory: () => {
          overlayContainerElement = document.createElement('div');
          document.body.appendChild(overlayContainerElement);
          return {getContainerElement: () => overlayContainerElement};
        }},
        {provide: Dir, useFactory: () => {
          return dir = { value: 'ltr' };
        }}
      ]
    });

    TestBed.compileComponents();
  }));

  describe('basic usage', () => {
    let fixture: ComponentFixture<BasicTooltipDemo>;
    let buttonDebugElement: DebugElement;
    let buttonElement: HTMLButtonElement;
    let tooltipDirective: MdTooltip;

    beforeEach(() => {
      fixture = TestBed.createComponent(BasicTooltipDemo);
      fixture.detectChanges();
      buttonDebugElement = fixture.debugElement.query(By.css('button'));
      buttonElement = <HTMLButtonElement> buttonDebugElement.nativeElement;
      tooltipDirective = buttonDebugElement.injector.get(MdTooltip);
    });

    it('should show and hide the tooltip', fakeAsync(() => {
      expect(tooltipDirective._tooltipInstance).toBeUndefined();

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
      expect(tooltipDirective._tooltipInstance).toBeNull();
    }));

    it('should show with delay', fakeAsync(() => {
      expect(tooltipDirective._tooltipInstance).toBeUndefined();

      const tooltipDelay = 1000;
      tooltipDirective.show(tooltipDelay);
      expect(tooltipDirective._isTooltipVisible()).toBe(false);

      fixture.detectChanges();
      expect(overlayContainerElement.textContent).toContain('');

      tick(tooltipDelay);
      expect(tooltipDirective._isTooltipVisible()).toBe(true);
      expect(overlayContainerElement.textContent).toContain(initialTooltipMessage);
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

    it('should not show if hide is called before delay finishes', fakeAsync(() => {
      expect(tooltipDirective._tooltipInstance).toBeUndefined();

      const tooltipDelay = 1000;
      tooltipDirective.show(tooltipDelay);
      expect(tooltipDirective._isTooltipVisible()).toBe(false);

      fixture.detectChanges();
      expect(overlayContainerElement.textContent).toContain('');

      tooltipDirective.hide();
      tick(tooltipDelay);
      expect(tooltipDirective._isTooltipVisible()).toBe(false);
    }));

    it('should not show tooltip if message is not present or empty', () => {
      expect(tooltipDirective._tooltipInstance).toBeUndefined();

      tooltipDirective.message = undefined;
      fixture.detectChanges();
      tooltipDirective.show();
      expect(tooltipDirective._tooltipInstance).toBeUndefined();

      tooltipDirective.message = null;
      fixture.detectChanges();
      tooltipDirective.show();
      expect(tooltipDirective._tooltipInstance).toBeUndefined();

      tooltipDirective.message = '';
      fixture.detectChanges();
      tooltipDirective.show();
      expect(tooltipDirective._tooltipInstance).toBeUndefined();

      tooltipDirective.message = '   ';
      fixture.detectChanges();
      tooltipDirective.show();
      expect(tooltipDirective._tooltipInstance).toBeUndefined();
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

      expect(tooltipDirective._tooltipInstance).toBeUndefined();

      tooltipDirective.position = initialPosition;
      tooltipDirective.show();
      expect(tooltipDirective._tooltipInstance).toBeDefined();

      // Same position value should not remove the tooltip
      tooltipDirective.position = initialPosition;
      expect(tooltipDirective._tooltipInstance).toBeDefined();

      // Different position value should destroy the tooltip
      tooltipDirective.position = changedPosition;
      expect(tooltipDirective._tooltipInstance).toBeNull();
      expect(tooltipDirective._overlayRef).toBeNull();
    });

    it('should be able to modify the tooltip message', fakeAsync(() => {
      expect(tooltipDirective._tooltipInstance).toBeUndefined();

      tooltipDirective.show();
      tick(0); // Tick for the show delay (default is 0)
      expect(tooltipDirective._tooltipInstance._visibility).toBe('visible');

      fixture.detectChanges();
      expect(overlayContainerElement.textContent).toContain(initialTooltipMessage);

      const newMessage = 'new tooltip message';
      tooltipDirective.message = newMessage;

      fixture.detectChanges();
      expect(overlayContainerElement.textContent).toContain(newMessage);
    }));

    it('should be removed after parent destroyed', fakeAsync(() => {
      tooltipDirective.show();
      tick(0); // Tick for the show delay (default is 0)
      expect(tooltipDirective._isTooltipVisible()).toBe(true);

      fixture.destroy();
      expect(overlayContainerElement.childNodes.length).toBe(0);
      expect(overlayContainerElement.textContent).toBe('');
    }));

    it('should not try to dispose the tooltip when destroyed and done hiding', fakeAsync(() => {
      tooltipDirective.show();
      fixture.detectChanges();
      tick(150);

      const tooltipDelay = 1000;
      tooltipDirective.hide();
      tick(tooltipDelay); // Change the tooltip state to hidden and trigger animation start

      // Store the tooltip instance, which will be set to null after the button is hidden.
      const tooltipInstance = tooltipDirective._tooltipInstance;
      fixture.componentInstance.showButton = false;
      fixture.detectChanges();

      // At this point the animation should be able to complete itself and trigger the
      // _afterVisibilityAnimation function, but for unknown reasons in the test infrastructure,
      // this does not occur. Manually call this and verify that doing so does not
      // throw an error.
      tooltipInstance._afterVisibilityAnimation(new AnimationTransitionEvent({
        fromState: 'visible',
        toState: 'hidden',
        totalTime: 150,
        phaseName: '',
      }));
    }));

    it('should consistently position before and after overlay origin in ltr and rtl dir', () => {
      tooltipDirective.position = 'left';
      const leftOrigin = tooltipDirective._getOrigin();
      tooltipDirective.position = 'right';
      const rightOrigin = tooltipDirective._getOrigin();

      // Test expectations in LTR
      tooltipDirective.position = 'before';
      expect(tooltipDirective._getOrigin()).toEqual(leftOrigin);
      tooltipDirective.position = 'after';
      expect(tooltipDirective._getOrigin()).toEqual(rightOrigin);

      // Test expectations in LTR
      dir.value = 'rtl';
      tooltipDirective.position = 'before';
      expect(tooltipDirective._getOrigin()).toEqual(rightOrigin);
      tooltipDirective.position = 'after';
      expect(tooltipDirective._getOrigin()).toEqual(leftOrigin);
    });

    it('should consistently position before and after overlay position in ltr and rtl dir', () => {
      tooltipDirective.position = 'left';
      const leftOverlayPosition = tooltipDirective._getOverlayPosition();
      tooltipDirective.position = 'right';
      const rightOverlayPosition = tooltipDirective._getOverlayPosition();

      // Test expectations in LTR
      tooltipDirective.position = 'before';
      expect(tooltipDirective._getOverlayPosition()).toEqual(leftOverlayPosition);
      tooltipDirective.position = 'after';
      expect(tooltipDirective._getOverlayPosition()).toEqual(rightOverlayPosition);

      // Test expectations in LTR
      dir.value = 'rtl';
      tooltipDirective.position = 'before';
      expect(tooltipDirective._getOverlayPosition()).toEqual(rightOverlayPosition);
      tooltipDirective.position = 'after';
      expect(tooltipDirective._getOverlayPosition()).toEqual(leftOverlayPosition);
    });

    it('should have consistent left transform origin in any dir', () => {
      tooltipDirective.position = 'right';
      tooltipDirective.show();
      expect(tooltipDirective._tooltipInstance._transformOrigin).toBe('left');

      tooltipDirective.position = 'after';
      tooltipDirective.show();
      expect(tooltipDirective._tooltipInstance._transformOrigin).toBe('left');

      dir.value = 'rtl';
      tooltipDirective.position = 'before';
      tooltipDirective.show();
      expect(tooltipDirective._tooltipInstance._transformOrigin).toBe('left');
    });

    it('should have consistent right transform origin in any dir', () => {
      tooltipDirective.position = 'left';
      tooltipDirective.show();
      expect(tooltipDirective._tooltipInstance._transformOrigin).toBe('right');

      tooltipDirective.position = 'before';
      tooltipDirective.show();
      expect(tooltipDirective._tooltipInstance._transformOrigin).toBe('right');

      dir.value = 'rtl';
      tooltipDirective.position = 'after';
      tooltipDirective.show();
      expect(tooltipDirective._tooltipInstance._transformOrigin).toBe('right');
    });

    it('should throw when trying to assign an invalid position', () => {
      expect(() => {
        fixture.componentInstance.position = 'everywhere';
        fixture.detectChanges();
        tooltipDirective.show();
      }).toThrowError('Tooltip position "everywhere" is invalid.');
    });
  });

  describe('scrollable usage', () => {
    let fixture: ComponentFixture<ScrollableTooltipDemo>;
    let buttonDebugElement: DebugElement;
    let buttonElement: HTMLButtonElement;
    let tooltipDirective: MdTooltip;

    beforeEach(() => {
      fixture = TestBed.createComponent(ScrollableTooltipDemo);
      fixture.detectChanges();
      buttonDebugElement = fixture.debugElement.query(By.css('button'));
      buttonElement = <HTMLButtonElement> buttonDebugElement.nativeElement;
      tooltipDirective = buttonDebugElement.injector.get(MdTooltip);
    });

    it('should hide tooltip if clipped after changing positions', fakeAsync(() => {
      expect(tooltipDirective._tooltipInstance).toBeUndefined();

      // Show the tooltip and tick for the show delay (default is 0)
      tooltipDirective.show();
      fixture.detectChanges();
      tick(0);

      // Expect that the tooltip is displayed
      expect(tooltipDirective._isTooltipVisible()).toBe(true);

      // Scroll the page but tick just before the default throttle should update.
      fixture.componentInstance.scrollDown();
      tick(SCROLL_THROTTLE_MS - 1);
      expect(tooltipDirective._isTooltipVisible()).toBe(true);

      // Finish ticking to the throttle's limit and check that the scroll event notified the
      // tooltip and it was hidden.
      tick(1);
      expect(tooltipDirective._isTooltipVisible()).toBe(false);
    }));
  });

  describe('with OnPush', () => {
    let fixture: ComponentFixture<OnPushTooltipDemo>;
    let buttonDebugElement: DebugElement;
    let buttonElement: HTMLButtonElement;
    let tooltipDirective: MdTooltip;

    beforeEach(() => {
      fixture = TestBed.createComponent(OnPushTooltipDemo);
      fixture.detectChanges();
      buttonDebugElement = fixture.debugElement.query(By.css('button'));
      buttonElement = <HTMLButtonElement> buttonDebugElement.nativeElement;
      tooltipDirective = buttonDebugElement.injector.get(MdTooltip);
    });

    it('should show and hide the tooltip', fakeAsync(() => {
      expect(tooltipDirective._tooltipInstance).toBeUndefined();

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
      expect(tooltipDirective._tooltipInstance).toBeNull();
    }));
  });

  describe('destroy', () => {
    it('does not throw an error on destroy', () => {
      const fixture = TestBed.createComponent(BasicTooltipDemo);
      fixture.detectChanges();
      delete fixture.componentInstance.tooltip.scrollSubscription;
      expect(fixture.destroy.bind(fixture)).not.toThrow();
    });
  });
});

@Component({
  selector: 'app',
  template: `
    <button *ngIf="showButton"
            [mdTooltip]="message"
            [mdTooltipPosition]="position">
      Button
    </button>`
})
class BasicTooltipDemo {
  position: string = 'below';
  message: string = initialTooltipMessage;
  showButton: boolean = true;
  @ViewChild(MdTooltip) tooltip: MdTooltip;
}

@Component({
     selector: 'app',
     template: `
    <div cdk-scrollable style="padding: 100px; margin: 300px;
                               height: 200px; width: 200px; overflow: auto;">
      <button *ngIf="showButton" style="margin-bottom: 600px"
              [md-tooltip]="message"
              [tooltip-position]="position">
        Button
      </button>
    </div>`
})
class ScrollableTooltipDemo {
 position: string = 'below';
 message: string = initialTooltipMessage;
 showButton: boolean = true;

 @ViewChild(Scrollable) scrollingContainer: Scrollable;

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
    <button [mdTooltip]="message"
            [mdTooltipPosition]="position">
      Button
    </button>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
class OnPushTooltipDemo {
  position: string = 'below';
  message: string = initialTooltipMessage;
}
