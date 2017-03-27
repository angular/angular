// #docplaster
import { async, inject, ComponentFixture, TestBed
} from '@angular/core/testing';

import { addMatchers, click } from '../../testing';
import { HeroService }        from '../model';
import { FakeHeroService }    from '../model/testing';

import { By }     from '@angular/platform-browser';
import { Router } from '@angular/router';

import { DashboardComponent } from './dashboard.component';
import { DashboardModule }    from './dashboard.module';

// #docregion router-stub
class RouterStub {
  navigateByUrl(url: string) { return url; }
}
// #enddocregion router-stub

beforeEach ( addMatchers );

let comp: DashboardComponent;
let fixture: ComponentFixture<DashboardComponent>;

////////  Deep  ////////////////

describe('DashboardComponent (deep)', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ DashboardModule ]
    });
  });

  compileAndCreate();

  tests(clickForDeep);

  function clickForDeep() {
    // get first <div class="hero"> DebugElement
    const heroEl = fixture.debugElement.query(By.css('.hero'));
    click(heroEl);
  }
});

////////  Shallow ////////////////

import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('DashboardComponent (shallow)', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ DashboardComponent ],
      schemas:      [NO_ERRORS_SCHEMA]
    });
  });

  compileAndCreate();

  tests(clickForShallow);

  function clickForShallow() {
    // get first <dashboard-hero> DebugElement
    const heroEl = fixture.debugElement.query(By.css('dashboard-hero'));
    heroEl.triggerEventHandler('selected', comp.heroes[0]);
  }
});

/** Add TestBed providers, compile, and create DashboardComponent */
function compileAndCreate() {
  // #docregion compile-and-create-body
  beforeEach( async(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: HeroService, useClass: FakeHeroService },
        { provide: Router,      useClass: RouterStub }
      ]
    })
    .compileComponents().then(() => {
      fixture = TestBed.createComponent(DashboardComponent);
      comp = fixture.componentInstance;
    });
    // #enddocregion compile-and-create-body
  }));
}

/**
 * The (almost) same tests for both.
 * Only change: the way that the first hero is clicked
 */
function tests(heroClick: Function) {

  it('should NOT have heroes before ngOnInit', () => {
    expect(comp.heroes.length).toBe(0,
      'should not have heroes before ngOnInit');
  });

  it('should NOT have heroes immediately after ngOnInit', () => {
    fixture.detectChanges(); // runs initial lifecycle hooks

    expect(comp.heroes.length).toBe(0,
      'should not have heroes until service promise resolves');
  });

  describe('after get dashboard heroes', () => {

     // Trigger component so it gets heroes and binds to them
     beforeEach( async(() => {
        fixture.detectChanges(); // runs ngOnInit -> getHeroes
        fixture.whenStable() // No need for the `lastPromise` hack!
          .then(() => fixture.detectChanges()); // bind to heroes
     }));

    it('should HAVE heroes', () => {
      expect(comp.heroes.length).toBeGreaterThan(0,
        'should have heroes after service promise resolves');
    });

    it('should DISPLAY heroes', () => {
      // Find and examine the displayed heroes
      // Look for them in the DOM by css class
      const heroes = fixture.debugElement.queryAll(By.css('dashboard-hero'));
      expect(heroes.length).toBe(4, 'should display 4 heroes');
    });

    // #docregion navigate-test, inject
    it('should tell ROUTER to navigate when hero clicked',
      inject([Router], (router: Router) => { // ...
    // #enddocregion inject

      const spy = spyOn(router, 'navigateByUrl');

      heroClick(); // trigger click on first inner <div class="hero">

      // args passed to router.navigateByUrl()
      const navArgs = spy.calls.first().args[0];

      // expecting to navigate to id of the component's first hero
      const id = comp.heroes[0].id;
      expect(navArgs).toBe('/heroes/' + id,
        'should nav to HeroDetail for first hero');
    // #docregion inject
    }));
    // #enddocregion navigate-test, inject
  });
}

