import {ComponentFixture, TestBed, fakeAsync} from '@angular/core/testing';
import {Component, DebugElement} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MatBadge, MatBadgeModule} from './index';
import {ThemePalette} from '@angular/material/core';

describe('MatBadge', () => {
  let fixture: ComponentFixture<any>;
  let testComponent: BadgeTestApp;
  let badgeNativeElement: HTMLElement;
  let badgeDebugElement: DebugElement;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatBadgeModule],
      declarations: [BadgeTestApp],
    }).compileComponents();

    fixture = TestBed.createComponent(BadgeTestApp);
    testComponent = fixture.debugElement.componentInstance;
    fixture.detectChanges();

    badgeDebugElement = fixture.debugElement.query(By.directive(MatBadge));
    badgeNativeElement = badgeDebugElement.nativeElement;
  }));

  it('should update the badge based on attribute', () => {
    let badgeContentDebugElement = badgeNativeElement.querySelector('.mat-badge-content')!;

    expect(badgeContentDebugElement.textContent).toContain('1');

    testComponent.badgeContent = '22';
    fixture.detectChanges();

    badgeContentDebugElement = badgeNativeElement.querySelector('.mat-badge-content')!;
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

  it('should toggle `aria-describedby` depending on whether the badge has a description', () => {
    const badgeContent = badgeNativeElement.querySelector('.mat-badge-content')!;

    expect(badgeContent.getAttribute('aria-describedby')).toBeFalsy();

    testComponent.badgeDescription = 'Describing a badge';
    fixture.detectChanges();

    expect(badgeContent.getAttribute('aria-describedby')).toBeTruthy();

    testComponent.badgeDescription = '';
    fixture.detectChanges();

    expect(badgeContent.getAttribute('aria-describedby')).toBeFalsy();
  });

  it('should toggle visibility based on whether the badge has content', () => {
    const classList = badgeNativeElement.classList;

    expect(classList.contains('mat-badge-hidden')).toBe(false);

    testComponent.badgeContent = '';
    fixture.detectChanges();

    expect(classList.contains('mat-badge-hidden')).toBe(true);

    testComponent.badgeContent = 'hello';
    fixture.detectChanges();

    expect(classList.contains('mat-badge-hidden')).toBe(false);

    testComponent.badgeContent = ' ';
    fixture.detectChanges();

    expect(classList.contains('mat-badge-hidden')).toBe(true);

    testComponent.badgeContent = 0;
    fixture.detectChanges();

    expect(classList.contains('mat-badge-hidden')).toBe(false);
  });

});

/** Test component that contains a MatBadge. */
@Component({
  template: `
    <span [matBadge]="badgeContent"
          [matBadgeColor]="badgeColor"
          [matBadgePosition]="badgeDirection"
          [matBadgeHidden]="badgeHidden"
          [matBadgeSize]="badgeSize"
          [matBadgeOverlap]="badgeOverlap"
          [matBadgeDescription]="badgeDescription">
      home
    </span>
  `
})
class BadgeTestApp {
  badgeColor: ThemePalette;
  badgeContent: string | number = '1';
  badgeDirection = 'above after';
  badgeHidden = false;
  badgeSize = 'medium';
  badgeOverlap = false;
  badgeDescription: string;
}
