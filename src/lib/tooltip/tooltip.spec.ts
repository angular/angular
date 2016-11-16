import {
    async,
    ComponentFixture,
    TestBed,
    tick,
    fakeAsync,
    flushMicrotasks
} from '@angular/core/testing';
import {Component, DebugElement, AnimationTransitionEvent} from '@angular/core';
import {By} from '@angular/platform-browser';
import {TooltipPosition, MdTooltip, MdTooltipModule} from './tooltip';
import {OverlayContainer} from '../core';

const initialTooltipMessage = 'initial tooltip message';

describe('MdTooltip', () => {
  let overlayContainerElement: HTMLElement;


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdTooltipModule.forRoot()],
      declarations: [BasicTooltipDemo],
      providers: [
        {provide: OverlayContainer, useFactory: () => {
          overlayContainerElement = document.createElement('div');
          return {getContainerElement: () => overlayContainerElement};
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
      expect(tooltipDirective._isTooltipVisible()).toBe(true);

      fixture.detectChanges();
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

    it('should not follow through with hide if show is called after', fakeAsync(() => {
      tooltipDirective.show();
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

    it('should be able to modify the tooltip message', () => {
      expect(tooltipDirective._tooltipInstance).toBeUndefined();

      tooltipDirective.show();
      expect(tooltipDirective._tooltipInstance._visibility).toBe('visible');

      fixture.detectChanges();
      expect(overlayContainerElement.textContent).toContain(initialTooltipMessage);

      const newMessage = 'new tooltip message';
      tooltipDirective.message = newMessage;

      fixture.detectChanges();
      expect(overlayContainerElement.textContent).toContain(newMessage);
    });

    it('should be removed after parent destroyed', () => {
      tooltipDirective.show();
      expect(tooltipDirective._isTooltipVisible()).toBe(true);

      fixture.destroy();
      expect(overlayContainerElement.childNodes.length).toBe(0);
      expect(overlayContainerElement.textContent).toBe('');
    });

    it('should not try to dispose the tooltip when destroyed and done hiding', fakeAsync(() => {
      tooltipDirective.show();
      fixture.detectChanges();
      tick(150);

      tooltipDirective.hide();
      tick(TOOLTIP_HIDE_DELAY); // Change the tooltip state to hidden and trigger animation start

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
  });
});

@Component({
  selector: 'app',
  template: `
    <button *ngIf="showButton"
            [md-tooltip]="message" 
            [tooltip-position]="position">
      Button
    </button>`
})
class BasicTooltipDemo {
  position: TooltipPosition = 'below';
  message: string = initialTooltipMessage;
  showButton: boolean = true;
}
