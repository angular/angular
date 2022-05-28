import {Component} from '@angular/core';
import {waitForAsync, ComponentFixture, TestBed, fakeAsync, flush} from '@angular/core/testing';
import {dispatchKeyboardEvent, dispatchMouseEvent} from '@angular/cdk/testing/private';
import {By} from '@angular/platform-browser';
import {SPACE, ENTER} from '@angular/cdk/keycodes';
import {MatChip, MatChipsModule} from './index';

describe('MDC-based Chip Remove', () => {
  let fixture: ComponentFixture<TestChip>;
  let testChip: TestChip;
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
  }));

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
      fixture.detectChanges();
      flush();

      expect(testChip.didRemove).toHaveBeenCalled();
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
      fixture.detectChanges();
      flush();

      expect(event.defaultPrevented).toBe(true);
    }));

    it('should prevent the default ENTER action', fakeAsync(() => {
      const buttonElement = chipNativeElement.querySelector('button')!;

      testChip.removable = true;
      fixture.detectChanges();

      const event = dispatchKeyboardEvent(buttonElement, 'keydown', ENTER);
      fixture.detectChanges();
      flush();

      expect(event.defaultPrevented).toBe(true);
    }));

    it('should have a focus indicator', fakeAsync(() => {
      const buttonElement = chipNativeElement.querySelector('.mdc-evolution-chip__icon--trailing')!;
      expect(buttonElement.classList.contains('mat-mdc-focus-indicator')).toBe(true);
    }));

    it('should prevent the default click action', fakeAsync(() => {
      const buttonElement = chipNativeElement.querySelector('button')!;
      const event = dispatchMouseEvent(buttonElement, 'click');
      fixture.detectChanges();
      flush();

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
