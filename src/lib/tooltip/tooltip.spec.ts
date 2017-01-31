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
  ChangeDetectionStrategy
} from '@angular/core';
import {By} from '@angular/platform-browser';
import {TooltipPosition, MdTooltip, MdTooltipModule} from './tooltip';
import {OverlayContainer} from '../core';
import {Dir, LayoutDirection} from '../core/rtl/dir';
import {OverlayModule} from '../core/overlay/overlay-directives';

const initialTooltipMessage = 'initial tooltip message';

describe('MdTooltip', () => {
  let overlayContainerElement: HTMLElement;
  let dir: {value: LayoutDirection};

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdTooltipModule.forRoot(), OverlayModule],
      declarations: [BasicTooltipDemo, OnPushTooltipDemo],
      providers: [
        {provide: OverlayContainer, useFactory: () => {
          overlayContainerElement = document.createElement('div');
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
      const tooltipElement = overlayContainerElement.querySelector('.md-tooltip') as HTMLElement;
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
      const tooltipElement = overlayContainerElement.querySelector('.md-tooltip') as HTMLElement;
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

