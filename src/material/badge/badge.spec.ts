import {ComponentFixture, TestBed, fakeAsync} from '@angular/core/testing';
import {Component, DebugElement, ViewEncapsulation, ViewChild} from '@angular/core';
import {By} from '@angular/platform-browser';
import {MatBadge, MatBadgeModule} from './index';
import {ThemePalette} from '@angular/material/core';

describe('MatBadge', () => {
  let fixture: ComponentFixture<any>;
  let testComponent: BadgeTestApp;
  let badgeHostNativeElement: HTMLElement;
  let badgeHostDebugElement: DebugElement;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      imports: [MatBadgeModule],
      declarations: [BadgeTestApp, PreExistingBadge, NestedBadge, BadgeOnTemplate],
    }).compileComponents();

    fixture = TestBed.createComponent(BadgeTestApp);
    testComponent = fixture.debugElement.componentInstance;
    fixture.detectChanges();

    badgeHostDebugElement = fixture.debugElement.query(By.directive(MatBadge))!;
    badgeHostNativeElement = badgeHostDebugElement.nativeElement;
  }));

  it('should update the badge based on attribute', () => {
    const badgeElement = badgeHostNativeElement.querySelector('.mat-badge-content')!;
    expect(badgeElement.textContent).toContain('1');

    testComponent.badgeContent = '22';
    fixture.detectChanges();
    expect(badgeElement.textContent).toContain('22');
  });

  it('should be able to pass in falsy values to the badge content', () => {
    const badgeElement = badgeHostNativeElement.querySelector('.mat-badge-content')!;
    expect(badgeElement.textContent).toContain('1');

    testComponent.badgeContent = 0;
    fixture.detectChanges();
    expect(badgeElement.textContent).toContain('0');
  });

  it('should treat null and undefined as empty strings in the badge content', () => {
    const badgeElement = badgeHostNativeElement.querySelector('.mat-badge-content')!;
    expect(badgeElement.textContent).toContain('1');

    testComponent.badgeContent = null;
    fixture.detectChanges();
    expect(badgeElement.textContent?.trim()).toBe('');

    testComponent.badgeContent = undefined;
    fixture.detectChanges();
    expect(badgeElement.textContent?.trim()).toBe('');
  });

  it('should apply class based on color attribute', () => {
    testComponent.badgeColor = 'primary';
    fixture.detectChanges();
    expect(badgeHostNativeElement.classList.contains('mat-badge-primary')).toBe(true);

    testComponent.badgeColor = 'accent';
    fixture.detectChanges();
    expect(badgeHostNativeElement.classList.contains('mat-badge-accent')).toBe(true);

    testComponent.badgeColor = 'warn';
    fixture.detectChanges();
    expect(badgeHostNativeElement.classList.contains('mat-badge-warn')).toBe(true);

    testComponent.badgeColor = undefined;
    fixture.detectChanges();

    expect(badgeHostNativeElement.classList).not.toContain('mat-badge-accent');
  });

  it('should update the badge position on direction change', () => {
    expect(badgeHostNativeElement.classList.contains('mat-badge-above')).toBe(true);
    expect(badgeHostNativeElement.classList.contains('mat-badge-after')).toBe(true);

    testComponent.badgeDirection = 'below before';
    fixture.detectChanges();

    expect(badgeHostNativeElement.classList.contains('mat-badge-below')).toBe(true);
    expect(badgeHostNativeElement.classList.contains('mat-badge-before')).toBe(true);
  });

  it('should change visibility to hidden', () => {
    expect(badgeHostNativeElement.classList.contains('mat-badge-hidden')).toBe(false);

    testComponent.badgeHidden = true;
    fixture.detectChanges();

    expect(badgeHostNativeElement.classList.contains('mat-badge-hidden')).toBe(true);
  });

  it('should change badge sizes', () => {
    expect(badgeHostNativeElement.classList.contains('mat-badge-medium')).toBe(true);

    testComponent.badgeSize = 'small';
    fixture.detectChanges();

    expect(badgeHostNativeElement.classList.contains('mat-badge-small')).toBe(true);

    testComponent.badgeSize = 'large';
    fixture.detectChanges();

    expect(badgeHostNativeElement.classList.contains('mat-badge-large')).toBe(true);
  });

  it('should change badge overlap', () => {
    expect(badgeHostNativeElement.classList.contains('mat-badge-overlap')).toBe(false);

    testComponent.badgeOverlap = true;
    fixture.detectChanges();

    expect(badgeHostNativeElement.classList.contains('mat-badge-overlap')).toBe(true);
  });

  it('should toggle `aria-describedby` depending on whether the badge has a description', () => {
    expect(badgeHostNativeElement.hasAttribute('aria-describedby')).toBeFalse();

    testComponent.badgeDescription = 'Describing a badge';
    fixture.detectChanges();

    const describedById = badgeHostNativeElement.getAttribute('aria-describedby') || '';
    const description = document.getElementById(describedById)?.textContent;
    expect(description).toBe('Describing a badge');

    testComponent.badgeDescription = '';
    fixture.detectChanges();

    expect(badgeHostNativeElement.hasAttribute('aria-describedby')).toBeFalse();
  });

  it('should toggle visibility based on whether the badge has content', () => {
    const classList = badgeHostNativeElement.classList;

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
    const badge = badgeHostNativeElement.querySelector('.mat-badge-content')!;
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
    const element: HTMLElement = badgeHostDebugElement.nativeElement;

    expect(element.classList).not.toContain('mat-badge-disabled');

    testComponent.badgeDisabled = true;
    fixture.detectChanges();

    expect(element.classList).toContain('mat-badge-disabled');
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

  it('should expose the badge element', () => {
    const badgeElement = badgeHostNativeElement.querySelector('.mat-badge-content')!;
    expect(fixture.componentInstance.badgeInstance.getBadgeElement()).toBe(badgeElement);
  });

  it('should throw if badge is not attached to an element node', () => {
    expect(() => {
      TestBed.createComponent(BadgeOnTemplate);
    }).toThrowError(/matBadge must be attached to an element node/);
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
  `,
})
class BadgeTestApp {
  @ViewChild(MatBadge) badgeInstance: MatBadge;
  badgeColor: ThemePalette;
  badgeContent: string | number | undefined | null = '1';
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
  `,
})
class PreExistingBadge {}

@Component({
  template: `
    <span matBadge="Hello">
      home
      <span matBadge="Hi">Something</span>
    </span>
  `,
})
class NestedBadge {}

@Component({
  template: `<ng-template matBadge="1">Notifications</ng-template>`,
})
class BadgeOnTemplate {}
