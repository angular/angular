import {Component, DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {fakeAsync, ComponentFixture, TestBed} from '@angular/core/testing';
import {MatChip, MatChipsModule} from './index';
import {dispatchFakeEvent} from '@angular/cdk/testing';

describe('Chip Remove', () => {
  let fixture: ComponentFixture<any>;
  let testChip: TestChip;
  let chipDebugElement: DebugElement;
  let chipNativeElement: HTMLElement;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatChipsModule],
      declarations: [
        TestChip
      ]
    });

    TestBed.compileComponents();
    fixture = TestBed.createComponent(TestChip);
    testChip = fixture.debugElement.componentInstance;
    fixture.detectChanges();

    chipDebugElement = fixture.debugElement.query(By.directive(MatChip));
    chipNativeElement = chipDebugElement.nativeElement;
  }));

  describe('basic behavior', () => {
    it('should apply the `mat-chip-remove` CSS class', () => {
      const hrefElement = chipNativeElement.querySelector('a')!;

      expect(hrefElement.classList).toContain('mat-chip-remove');
    });

    it('should emit (remove) on click', () => {
      const hrefElement = chipNativeElement.querySelector('a')!;

      testChip.removable = true;
      fixture.detectChanges();

      spyOn(testChip, 'didRemove');

      hrefElement.click();

      expect(testChip.didRemove).toHaveBeenCalled();
    });

    it('should prevent the default click action', () => {
      const hrefElement = chipNativeElement.querySelector('a')!;

      testChip.removable = true;
      fixture.detectChanges();

      const event = dispatchFakeEvent(hrefElement, 'click');
      fixture.detectChanges();

      expect(event.defaultPrevented).toBe(true);
    });

  });
});

@Component({
  template: `
    <mat-chip [removable]="removable" (remove)="didRemove()"><a matChipRemove></a></mat-chip>
  `
})
class TestChip {
  removable: boolean;

  didRemove() {}
}
