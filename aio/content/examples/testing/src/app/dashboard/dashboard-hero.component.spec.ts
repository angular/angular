
// #docplaster
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { addMatchers, click } from '../../testing';
import { Hero } from '../model/hero';

import { DashboardHeroComponent } from './dashboard-hero.component';

beforeEach(addMatchers);

describe('DashboardHeroComponent class only', () => {
  // #docregion class-only
  it('raises the selected event when clicked', () => {
    const comp = new DashboardHeroComponent();
    const hero: Hero = {id: 42, name: 'Test'};
    comp.hero = hero;

    comp.selected.subscribe((selectedHero: Hero) => expect(selectedHero).toBe(hero));
    comp.click();
  });
  // #enddocregion class-only
});

describe('DashboardHeroComponent when tested directly', () => {
  let comp: DashboardHeroComponent;
  let expectedHero: Hero;
  let fixture: ComponentFixture<DashboardHeroComponent>;
  let heroDe: DebugElement;
  let heroEl: HTMLElement;

  beforeEach(waitForAsync(() => {
    // #docregion setup, config-testbed
    TestBed
        .configureTestingModule({declarations: [DashboardHeroComponent]})
        // #enddocregion setup, config-testbed
        .compileComponents();
  }));

  beforeEach(() => {
    // #docregion setup
    fixture = TestBed.createComponent(DashboardHeroComponent);
    comp = fixture.componentInstance;

    // find the hero's DebugElement and element
    heroDe = fixture.debugElement.query(By.css('.hero'));
    heroEl = heroDe.nativeElement;

    // mock the hero supplied by the parent component
    expectedHero = {id: 42, name: 'Test Name'};

    // simulate the parent setting the input property with that hero
    comp.hero = expectedHero;

    // trigger initial data binding
    fixture.detectChanges();
    // #enddocregion setup
  });

  // #docregion name-test
  it('should display hero name in uppercase', () => {
    const expectedPipedName = expectedHero.name.toUpperCase();
    expect(heroEl.textContent).toContain(expectedPipedName);
  });
  // #enddocregion name-test

  // #docregion click-test
  it('should raise selected event when clicked (triggerEventHandler)', () => {
    let selectedHero: Hero;
    comp.selected.subscribe((hero: Hero) => selectedHero = hero);

    // #docregion trigger-event-handler
    heroDe.triggerEventHandler('click', null);
    // #enddocregion trigger-event-handler
    expect(selectedHero).toBe(expectedHero);
  });
  // #enddocregion click-test

  // #docregion click-test-2
  it('should raise selected event when clicked (element.click)', () => {
    let selectedHero: Hero;
    comp.selected.subscribe((hero: Hero) => selectedHero = hero);

    heroEl.click();
    expect(selectedHero).toBe(expectedHero);
  });
  // #enddocregion click-test-2

  // #docregion click-test-3
  it('should raise selected event when clicked (click helper)', () => {
    let selectedHero: Hero;
    comp.selected.subscribe((hero: Hero) => selectedHero = hero);

    click(heroDe);  // click helper with DebugElement
    click(heroEl);  // click helper with native element

    expect(selectedHero).toBe(expectedHero);
  });
  // #enddocregion click-test-3
});

//////////////////

describe('DashboardHeroComponent when inside a test host', () => {
  let testHost: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let heroEl: HTMLElement;

  beforeEach(waitForAsync(() => {
    // #docregion test-host-setup
    TestBed
        .configureTestingModule({declarations: [DashboardHeroComponent, TestHostComponent]})
        // #enddocregion test-host-setup
        .compileComponents();
  }));

  beforeEach(() => {
    // #docregion test-host-setup
    // create TestHostComponent instead of DashboardHeroComponent
    fixture = TestBed.createComponent(TestHostComponent);
    testHost = fixture.componentInstance;
    heroEl = fixture.nativeElement.querySelector('.hero');
    fixture.detectChanges();  // trigger initial data binding
    // #enddocregion test-host-setup
  });

  // #docregion test-host-tests
  it('should display hero name', () => {
    const expectedPipedName = testHost.hero.name.toUpperCase();
    expect(heroEl.textContent).toContain(expectedPipedName);
  });

  it('should raise selected event when clicked', () => {
    click(heroEl);
    // selected hero should be the same data bound hero
    expect(testHost.selectedHero).toBe(testHost.hero);
  });
  // #enddocregion test-host-tests
});

////// Test Host Component //////
import { Component } from '@angular/core';

// #docregion test-host
@Component({
  template: `
    <dashboard-hero
      [hero]="hero" (selected)="onSelected($event)">
    </dashboard-hero>`
})
class TestHostComponent {
  hero: Hero = {id: 42, name: 'Test Name'};
  selectedHero: Hero;
  onSelected(hero: Hero) {
    this.selectedHero = hero;
  }
}
// #enddocregion test-host
