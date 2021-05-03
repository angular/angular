// #docplaster
import { ComponentFixture, inject, TestBed, waitForAsync } from '@angular/core/testing';

import { addMatchers, asyncData, click } from '../../testing';
import { HeroService } from '../model/hero.service';
import { getTestHeroes } from '../model/testing/test-heroes';

import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { DashboardComponent } from './dashboard.component';
import { DashboardModule } from './dashboard.module';

beforeEach(addMatchers);

let comp: DashboardComponent;
let fixture: ComponentFixture<DashboardComponent>;

////////  Deep  ////////////////

describe('DashboardComponent (deep)', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({imports: [DashboardModule]});
  });

  compileAndCreate();

  tests(clickForDeep);

  function clickForDeep() {
    // get first <div class="hero">
    const heroEl: HTMLElement = fixture.nativeElement.querySelector('.hero');
    click(heroEl);
  }
});

////////  Shallow ////////////////

import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('DashboardComponent (shallow)', () => {
  beforeEach(() => {
    TestBed.configureTestingModule(
        {declarations: [DashboardComponent], schemas: [NO_ERRORS_SCHEMA]});
  });

  compileAndCreate();

  tests(clickForShallow);

  function clickForShallow() {
    // get first <dashboard-hero> DebugElement
    const heroDe = fixture.debugElement.query(By.css('dashboard-hero'));
    heroDe.triggerEventHandler('selected', comp.heroes[0]);
  }
});

/** Add TestBed providers, compile, and create DashboardComponent */
function compileAndCreate() {
  beforeEach(waitForAsync(() => {
    // #docregion router-spy
    const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
    const heroServiceSpy = jasmine.createSpyObj('HeroService', ['getHeroes']);

    TestBed
        .configureTestingModule({
          providers: [
            {provide: HeroService, useValue: heroServiceSpy}, {provide: Router, useValue: routerSpy}
          ]
        })
        // #enddocregion router-spy
        .compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(DashboardComponent);
          comp = fixture.componentInstance;

          // getHeroes spy returns observable of test heroes
          heroServiceSpy.getHeroes.and.returnValue(asyncData(getTestHeroes()));
        });
  }));
}

/**
 * The (almost) same tests for both.
 * Only change: the way that the first hero is clicked
 */
function tests(heroClick: () => void) {

  it('should NOT have heroes before ngOnInit', () => {
    expect(comp.heroes.length).toBe(0, 'should not have heroes before ngOnInit');
  });

  it('should NOT have heroes immediately after ngOnInit', () => {
    fixture.detectChanges();  // runs initial lifecycle hooks

    expect(comp.heroes.length).toBe(0, 'should not have heroes until service promise resolves');
  });

  describe('after get dashboard heroes', () => {
    let router: Router;

     // Trigger component so it gets heroes and binds to them
    beforeEach(waitForAsync(() => {
      router = fixture.debugElement.injector.get(Router);
      fixture.detectChanges(); // runs ngOnInit -> getHeroes
      fixture.whenStable() // No need for the `lastPromise` hack!
        .then(() => fixture.detectChanges()); // bind to heroes
    }));

    it('should HAVE heroes', () => {
      expect(comp.heroes.length)
          .toBeGreaterThan(0, 'should have heroes after service promise resolves');
    });

    it('should DISPLAY heroes', () => {
      // Find and examine the displayed heroes
      // Look for them in the DOM by css class
      const heroes = fixture.nativeElement.querySelectorAll('dashboard-hero');
      expect(heroes.length).toBe(4, 'should display 4 heroes');
    });

    // #docregion navigate-test
    it('should tell ROUTER to navigate when hero clicked', () => {
      heroClick();  // trigger click on first inner <div class="hero">

      // args passed to router.navigateByUrl() spy
      const spy = router.navigateByUrl as jasmine.Spy;
      const navArgs = spy.calls.first().args[0];

      // expecting to navigate to id of the component's first hero
      const id = comp.heroes[0].id;
      expect(navArgs).toBe('/heroes/' + id, 'should nav to HeroDetail for first hero');
    });
    // #enddocregion navigate-test
  });
}
