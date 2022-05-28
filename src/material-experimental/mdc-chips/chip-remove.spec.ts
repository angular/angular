import {Component} from '@angular/core';
import {waitForAsync, ComponentFixture, TestBed, fakeAsync, flush} from '@angular/core/testing';
import {dispatchKeyboardEvent, dispatchMouseEvent} from '@angular/cdk/testing/private';
import {By} from '@angular/platform-browser';
import {SPACE, ENTER} from '@angular/cdk/keycodes';
import {MDCChipAnimation, MDCChipCssClasses} from '@material/chips/chip';
import {MatChip, MatChipsModule} from './index';

describe('MDC-based Chip Remove', () => {
  let fixture: ComponentFixture<TestChip>;
  let testChip: TestChip;
  let chipInstance: MatChip;
  let chipNativeElement: HTMLElement;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatChipsModule],
      declarations: [TestChip],
    });

    TestBed.compileComponents();
  }));

  beforeEach(waitForAsync(() => {
    fixture = TestBed.createComponent(TestChip);
    testChip = fixture.debugElement.componentInstance;
    fixture.detectChanges();

    const chipDebugElement = fixture.debugElement.query(By.directive(MatChip))!;
    chipNativeElement = chipDebugElement.nativeElement;
    chipInstance = chipDebugElement.componentInstance;
  }));

  function triggerRemoveSequence() {
    // At the time of writing, MDC's removal sequence requires the following to happen:
    // 1. Button is clicked, triggering the animation.
    // 2. Before the animation has finished, the `--hidden` class is added.
    // 3. Animation callback fires at some point. It doesn't really matter for the test,
    // but it does queue up some `requestAnimationFrame` calls that we need to flush.
    // 4. `transitionend` callback fires and finishes the removal sequence if the
    // `--hidden` class exists.
    fixture.detectChanges();
    (chipInstance as any)._handleAnimationend({
      animationName: MDCChipAnimation.EXIT,
      target: chipNativeElement,
    });
    flush();
    (chipInstance as any)._handleTransitionend({target: chipNativeElement});
    flush();
    fixture.detectChanges();
  }

  describe('basic behavior', () => {
    it('should apply a CSS class to the remove icon', fakeAsync(() => {
      const buttonElement = chipNativeElement.querySelector('.mdc-evolution-chip__icon--trailing')!;
      expect(buttonElement.classList).toContain('mat-mdc-chip-remove');
    }));

    it('should ensure that the button cannot submit its parent form', fakeAsync(() => {
      const buttonElement = chipNativeElement.querySelector('button')!;
      expect(buttonElement.getAttribute('type')).toBe('button');
    }));

    it('should not set the `type` attribute on non-button elements', fakeAsync(() => {
      const buttonElement = chipNativeElement.querySelector('span.mat-mdc-chip-remove')!;
      expect(buttonElement.hasAttribute('type')).toBe(false);
    }));

    it('should emit (removed) event when exit animation is complete', fakeAsync(() => {
      testChip.removable = true;
      fixture.detectChanges();

      chipNativeElement.querySelector('button')!.click();
      triggerRemoveSequence();

      expect(testChip.didRemove).toHaveBeenCalled();
    }));

    it('should not start MDC exit animation if parent chip is disabled', fakeAsync(() => {
      testChip.removable = true;
      testChip.disabled = true;
      fixture.detectChanges();

      chipNativeElement.querySelector('button')!.click();

      expect(chipNativeElement.classList.contains(MDCChipCssClasses.HIDDEN)).toBe(false);
    }));

    it('should not make the element aria-hidden when it is focusable', fakeAsync(() => {
      const buttonElement = chipNativeElement.querySelector('button')!;

      expect(buttonElement.getAttribute('tabindex')).toBe('-1');
      expect(buttonElement.hasAttribute('aria-hidden')).toBe(false);
    }));

    it('should prevent the default SPACE action', fakeAsync(() => {
      const buttonElement = chipNativeElement.querySelector('button')!;

      testChip.removable = true;
      fixture.detectChanges();

      const event = dispatchKeyboardEvent(buttonElement, 'keydown', SPACE);
      triggerRemoveSequence();

      expect(event.defaultPrevented).toBe(true);
    }));

    it('should prevent the default ENTER action', fakeAsync(() => {
      const buttonElement = chipNativeElement.querySelector('button')!;

      testChip.removable = true;
      fixture.detectChanges();

      const event = dispatchKeyboardEvent(buttonElement, 'keydown', ENTER);
      triggerRemoveSequence();

      expect(event.defaultPrevented).toBe(true);
    }));

    it('should have a focus indicator', fakeAsync(() => {
      const buttonElement = chipNativeElement.querySelector('.mdc-evolution-chip__icon--trailing')!;
      expect(buttonElement.classList.contains('mat-mdc-focus-indicator')).toBe(true);
    }));

    it('should prevent the default click action', fakeAsync(() => {
      const buttonElement = chipNativeElement.querySelector('button')!;
      const event = dispatchMouseEvent(buttonElement, 'click');
      triggerRemoveSequence();

      expect(event.defaultPrevented).toBe(true);
    }));
  });
});

@Component({
  template: `
    <mat-chip-set>
      <mat-chip
        [removable]="removable"
        [disabled]="disabled"
        (removed)="didRemove()">
        <button matChipRemove></button>
        <span matChipRemove></span>
      </mat-chip>
    </mat-chip-set>
  `,
})
class TestChip {
  removable: boolean;
  disabled = false;
  didRemove = jasmine.createSpy('didRemove spy');
}
