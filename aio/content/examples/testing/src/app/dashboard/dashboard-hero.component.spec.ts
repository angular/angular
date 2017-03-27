import { async, ComponentFixture, TestBed
} from '@angular/core/testing';

import { By }           from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { addMatchers, click } from '../../testing';

import { Hero } from '../model/hero';
import { DashboardHeroComponent } from './dashboard-hero.component';

beforeEach( addMatchers );

describe('DashboardHeroComponent when tested directly', () => {

  let comp: DashboardHeroComponent;
  let expectedHero: Hero;
  let fixture: ComponentFixture<DashboardHeroComponent>;
  let heroEl: DebugElement;

  // #docregion setup, compile-components
  // async beforeEach
  beforeEach( async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardHeroComponent ],
    })
    .compileComponents(); // compile template and css
  }));
  // #enddocregion compile-components

  // synchronous beforeEach
  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardHeroComponent);
    comp    = fixture.componentInstance;
    heroEl  = fixture.debugElement.query(By.css('.hero')); // find hero element

    // pretend that it was wired to something that supplied a hero
    expectedHero = new Hero(42, 'Test Name');
    comp.hero = expectedHero;
    fixture.detectChanges(); // trigger initial data binding
  });
  // #enddocregion setup

  // #docregion name-test
  it('should display hero name', () => {
    const expectedPipedName = expectedHero.name.toUpperCase();
    expect(heroEl.nativeElement.textContent).toContain(expectedPipedName);
  });
  // #enddocregion name-test

  // #docregion click-test
  it('should raise selected event when clicked', () => {
    let selectedHero: Hero;
    comp.selected.subscribe((hero: Hero) => selectedHero = hero);

  // #docregion trigger-event-handler
    heroEl.triggerEventHandler('click', null);
  // #enddocregion trigger-event-handler
    expect(selectedHero).toBe(expectedHero);
  });
  // #enddocregion click-test

  // #docregion click-test-2
  it('should raise selected event when clicked', () => {
    let selectedHero: Hero;
    comp.selected.subscribe((hero: Hero) => selectedHero = hero);

    click(heroEl);   // triggerEventHandler helper
    expect(selectedHero).toBe(expectedHero);
  });
  // #enddocregion click-test-2
});

//////////////////

describe('DashboardHeroComponent when inside a test host', () => {
  let testHost: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let heroEl: DebugElement;

  // #docregion test-host-setup
  beforeEach( async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardHeroComponent, TestHostComponent ], // declare both
    }).compileComponents();
  }));

  beforeEach(() => {
    // create TestHostComponent instead of DashboardHeroComponent
    fixture  = TestBed.createComponent(TestHostComponent);
    testHost = fixture.componentInstance;
    heroEl   = fixture.debugElement.query(By.css('.hero')); // find hero
    fixture.detectChanges(); // trigger initial data binding
  });
  // #enddocregion test-host-setup

  // #docregion test-host-tests
  it('should display hero name', () => {
    const expectedPipedName = testHost.hero.name.toUpperCase();
    expect(heroEl.nativeElement.textContent).toContain(expectedPipedName);
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
    <dashboard-hero  [hero]="hero"  (selected)="onSelected($event)"></dashboard-hero>`
})
class TestHostComponent {
  hero = new Hero(42, 'Test Name');
  selectedHero: Hero;
  onSelected(hero: Hero) { this.selectedHero = hero; }
}
// #enddocregion test-host
