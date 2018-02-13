import {ComponentFixture, TestBed, async} from '@angular/core/testing';
import {Component, DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MatBadge, MatBadgeModule} from './index';
import {ThemePalette} from '@angular/material/core';

describe('MatBadge', () => {
  let fixture: ComponentFixture<any>;
  let testComponent: BadgeWithTextContent;
  let badgeNativeElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatBadgeModule],
      declarations: [BadgeWithTextContent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BadgeWithTextContent);
    testComponent = fixture.debugElement.componentInstance;
    fixture.detectChanges();
  });

  describe('MatBadge Text', () => {
    let badgeDebugElement: DebugElement;

    beforeEach(() => {
      badgeDebugElement = fixture.debugElement.query(By.directive(MatBadge));
      badgeNativeElement = badgeDebugElement.nativeElement;
      fixture.detectChanges();
    });

    it('should update the badge based on attribute', () => {
      let badgeContentDebugElement = badgeNativeElement.querySelector('.mat-badge-content');

      expect(badgeContentDebugElement.textContent).toContain('1');

      testComponent.badgeContent = '22';
      fixture.detectChanges();

      badgeContentDebugElement = badgeNativeElement.querySelector('.mat-badge-content');
      expect(badgeContentDebugElement.textContent).toContain('22');
    });

    it('should apply class based on color attribute', () => {
      testComponent.badgeColor = 'primary';
      fixture.detectChanges();
      expect(badgeNativeElement.classList.contains('mat-badge-primary')).toBe(true);

      testComponent.badgeColor = 'accent';
      fixture.detectChanges();
      expect(badgeNativeElement.classList.contains('mat-badge-accent')).toBe(true);

      testComponent.badgeColor = 'warn';
      fixture.detectChanges();
      expect(badgeNativeElement.classList.contains('mat-badge-warn')).toBe(true);

      testComponent.badgeColor = undefined;
      fixture.detectChanges();

      expect(badgeNativeElement.classList).not.toContain('mat-badge-accent');
    });

    it('should update the badge position on direction change', () => {
      expect(badgeNativeElement.classList.contains('mat-badge-above')).toBe(true);
      expect(badgeNativeElement.classList.contains('mat-badge-after')).toBe(true);

      testComponent.badgeDirection = 'below before';
      fixture.detectChanges();

      expect(badgeNativeElement.classList.contains('mat-badge-below')).toBe(true);
      expect(badgeNativeElement.classList.contains('mat-badge-before')).toBe(true);
    });

    it('should change visibility to hidden', () => {
      expect(badgeNativeElement.classList.contains('mat-badge-hidden')).toBe(false);

      testComponent.badgeHidden = true;
      fixture.detectChanges();

      expect(badgeNativeElement.classList.contains('mat-badge-hidden')).toBe(true);
    });

    it('should change badge sizes', () => {
      expect(badgeNativeElement.classList.contains('mat-badge-medium')).toBe(true);

      testComponent.badgeSize = 'small';
      fixture.detectChanges();

      expect(badgeNativeElement.classList.contains('mat-badge-small')).toBe(true);

      testComponent.badgeSize = 'large';
      fixture.detectChanges();

      expect(badgeNativeElement.classList.contains('mat-badge-large')).toBe(true);
    });

    it('should change badge overlap', () => {
      expect(badgeNativeElement.classList.contains('mat-badge-overlap')).toBe(false);

      testComponent.badgeOverlap = true;
      fixture.detectChanges();

      expect(badgeNativeElement.classList.contains('mat-badge-overlap')).toBe(true);
    });
  });

});

/** Test component that contains a MatBadge. */
@Component({
  selector: 'test-app',
  template: `
    <span [matBadge]="badgeContent"
          [matBadgeColor]="badgeColor"
          [matBadgePosition]="badgeDirection"
          [matBadgeHidden]="badgeHidden"
          [matBadgeSize]="badgeSize"
          [matBadgeOverlap]="badgeOverlap">
      home
    </span>
  `
})
class BadgeWithTextContent {
  badgeColor: ThemePalette;
  badgeContent = '1';
  badgeDirection = 'above after';
  badgeHidden = false;
  badgeSize = 'medium';
  badgeOverlap = false;
}
