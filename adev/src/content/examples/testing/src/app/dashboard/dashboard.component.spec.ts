import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {TestBed, waitForAsync} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {NavigationEnd, provideRouter, Router} from '@angular/router';
import {RouterTestingHarness} from '@angular/router/testing';
import {firstValueFrom} from 'rxjs';
import {filter} from 'rxjs/operators';

import {addMatchers, click} from '../../testing';
import {HeroService} from '../model/hero.service';
import {getTestHeroes} from '../model/testing/test-heroes';

import {DashboardComponent} from './dashboard.component';
import {appConfig} from '../app.config';
import {HeroDetailComponent} from '../hero/hero-detail.component';

beforeEach(addMatchers);

let comp: DashboardComponent;
let harness: RouterTestingHarness;

////////  Deep  ////////////////

describe('DashboardComponent (deep)', () => {
  compileAndCreate();

  tests(clickForDeep);

  function clickForDeep() {
    // get first <div class="hero">
    const heroEl: HTMLElement = harness.routeNativeElement!.querySelector('.hero')!;
    click(heroEl);
    return firstValueFrom(
      TestBed.inject(Router).events.pipe(filter((e) => e instanceof NavigationEnd)),
    );
  }
});

////////  Shallow ////////////////

describe('DashboardComponent (shallow)', () => {
  beforeEach(() => {
    TestBed.configureTestingModule(
      Object.assign({}, appConfig, {
        imports: [DashboardComponent, HeroDetailComponent],
        providers: [provideRouter([{path: 'heroes/:id', component: HeroDetailComponent}])],
        schemas: [NO_ERRORS_SCHEMA],
      }),
    );
  });

  compileAndCreate();

  tests(clickForShallow);

  function clickForShallow() {
    // get first <dashboard-hero> DebugElement
    const heroDe = harness.routeDebugElement!.query(By.css('dashboard-hero'));
    heroDe.triggerEventHandler('selected', comp.heroes[0]);
    return Promise.resolve();
  }
});

/** Add TestBed providers, compile, and create DashboardComponent */
function compileAndCreate() {
  beforeEach(async () => {
    // #docregion router-harness
    TestBed.configureTestingModule(
      Object.assign({}, appConfig, {
        imports: [DashboardComponent],
        providers: [
          provideRouter([{path: '**', component: DashboardComponent}]),
          provideHttpClient(),
          provideHttpClientTesting(),
          HeroService,
        ],
      }),
    );
    harness = await RouterTestingHarness.create();
    comp = await harness.navigateByUrl('/', DashboardComponent);
    TestBed.inject(HttpTestingController).expectOne('api/heroes').flush(getTestHeroes());
    // #enddocregion router-harness
  });
}

/**
 * The (almost) same tests for both.
 * Only change: the way that the first hero is clicked
 */
function tests(heroClick: () => Promise<unknown>) {
  describe('after get dashboard heroes', () => {
    let router: Router;

    // Trigger component so it gets heroes and binds to them
    beforeEach(waitForAsync(() => {
      router = TestBed.inject(Router);
      harness.detectChanges(); // runs ngOnInit -> getHeroes
    }));

    it('should HAVE heroes', () => {
      expect(comp.heroes.length)
        .withContext('should have heroes after service promise resolves')
        .toBeGreaterThan(0);
    });

    it('should DISPLAY heroes', () => {
      // Find and examine the displayed heroes
      // Look for them in the DOM by css class
      const heroes = harness.routeNativeElement!.querySelectorAll('dashboard-hero');
      expect(heroes.length).withContext('should display 4 heroes').toBe(4);
    });

    // #docregion navigate-test
    it('should tell navigate when hero clicked', async () => {
      await heroClick(); // trigger click on first inner <div class="hero">

      // expecting to navigate to id of the component's first hero
      const id = comp.heroes[0].id;
      expect(TestBed.inject(Router).url)
        .withContext('should nav to HeroDetail for first hero')
        .toEqual(`/heroes/${id}`);
    });
    // #enddocregion navigate-test
  });
}
