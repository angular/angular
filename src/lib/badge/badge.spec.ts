import {ComponentFixture, TestBed, fakeAsync} from '@angular/core/testing';
import {Component, DebugElement, ViewEncapsulation} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MatBadge, MatBadgeModule} from './index';
import {ThemePalette} from '@angular/material/core';

describe('MatBadge', () => {
  let fixture: ComponentFixture<any>;
  let testComponent: BadgeTestApp;
  let badgeNativeElement: HTMLElement;
  let badgeDebugElement: DebugElement;

  beforeEach(fakeAsync(() => {
    TestBed
        .configureTestingModule({
          imports: [MatBadgeModule],
          declarations: [BadgeTestApp, PreExistingBadge, NestedBadge],
        })
        .compileComponents();

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

  it('should apply view encapsulation on create badge content', () => {
    const badge = badgeNativeElement.querySelector('.mat-badge-content')!;
    let encapsulationAttr: Attr | undefined;

    for (let i = 0; i < badge.attributes.length; i++) {
      if (badge.attributes[i].name.startsWith('_ngcontent-')) {
        encapsulationAttr = badge.attributes[i];
        break;
      }
    }

    expect(encapsulationAttr).toBeTruthy();
  });

  it('should toggle a class depending on the badge disabled state', () => {
    const element: HTMLElement = badgeDebugElement.nativeElement;

    expect(element.classList).not.toContain('mat-badge-disabled');

    testComponent.badgeDisabled = true;
    fixture.detectChanges();

    expect(element.classList).toContain('mat-badge-disabled');
  });

  it('should update the aria-label if the description changes', () => {
    const badgeContent = badgeNativeElement.querySelector('.mat-badge-content')!;

    fixture.componentInstance.badgeDescription = 'initial content';
    fixture.detectChanges();

    expect(badgeContent.getAttribute('aria-label')).toBe('initial content');

    fixture.componentInstance.badgeDescription = 'changed content';
    fixture.detectChanges();

    expect(badgeContent.getAttribute('aria-label')).toBe('changed content');

    fixture.componentInstance.badgeDescription = '';
    fixture.detectChanges();

    expect(badgeContent.hasAttribute('aria-label')).toBe(false);
  });

  it('should clear any pre-existing badges', () => {
    const preExistingFixture = TestBed.createComponent(PreExistingBadge);
    preExistingFixture.detectChanges();

    expect(preExistingFixture.nativeElement.querySelectorAll('.mat-badge-content').length).toBe(1);
  });

  it('should not clear badge content from child elements', () => {
    const preExistingFixture = TestBed.createComponent(NestedBadge);
    preExistingFixture.detectChanges();

    expect(preExistingFixture.nativeElement.querySelectorAll('.mat-badge-content').length).toBe(2);
  });

});

/** Test component that contains a MatBadge. */
@Component({
  // Explicitly set the view encapsulation since we have a test that checks for it.
  encapsulation: ViewEncapsulation.Emulated,
  styles: ['span { color: hotpink; }'],
  template: `
    <span [matBadge]="badgeContent"
          [matBadgeColor]="badgeColor"
          [matBadgePosition]="badgeDirection"
          [matBadgeHidden]="badgeHidden"
          [matBadgeSize]="badgeSize"
          [matBadgeOverlap]="badgeOverlap"
          [matBadgeDescription]="badgeDescription"
          [matBadgeDisabled]="badgeDisabled">
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
  badgeDisabled = false;
}


@Component({
  template: `
    <span matBadge="Hello">
      home
      <div class="mat-badge-content">Pre-existing badge</div>
    </span>
  `
})
class PreExistingBadge {
}


@Component({
  template: `
    <span matBadge="Hello">
      home
      <span matBadge="Hi">Something</span>
    </span>
  `
})
class NestedBadge {
}
