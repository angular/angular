// #docregion
// #docplaster
// #docregion marble-testing-setup
import { TestBed } from '@angular/core/testing';
import { Http } from '@angular/http';
import { HeroService } from './hero.service';
import { Hero } from './hero';


import { cold } from 'jasmine-marbles';

// #enddocregion marble-testing-setup

import { initTestScheduler, resetTestScheduler, addMatchers } from 'jasmine-marbles';
import { defer } from 'rxjs/observable/defer';

// #docregion marble-testing-setup
describe('Hero Service', () => {
  let heroService: HeroService;
  let hero: Hero = new Hero(1, 'Test');
  let http: any;
// #enddocregion marble-testing-setup
  /**
   * TestScheduler Setup is ONLY FOR DEMO PURPOSES!!
   */
  beforeAll(() => addMatchers());
  beforeEach(() => initTestScheduler());
  afterEach(() => resetTestScheduler());
// #docregion marble-testing-setup

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HeroService,
        {
          provide: Http,
          useFactory: () => jasmine.createSpyObj('Http', ['get'])
        }
      ]
    });

    heroService = TestBed.get(HeroService);
    http = TestBed.get(Http);
  });
// #enddocregion marble-testing-setup

// #docregion retrieve-hero-test
  it('should retrieve a hero by id', () => {
    const data = {
      json: () => ({ data: hero })
    };

    const response$ = cold('--a|', { a: data });

    http.get.and.returnValue(response$);

    const expected$ = cold('--b|', { b: hero });

    expect(heroService.getHero(1)).toBeObservable(expected$);
  });
// #enddocregion retrieve-hero-test

// #docregion retry-heroes-success
  it('should return heroes on a successful retry after a failed attempt', () => {
    const error = 'Error!';
    const data = {
      json: () => ({ data: [hero] })
    };
    const error$ = cold('---#', { }, error);
    const success$ = cold('---a|', { a: data });
    let calls = 0;
    const response$ = defer(() => {
      ++calls;
      if (calls < 2) {
        return error$;
      }

      return success$;
    });

    http.get.and.returnValue(response$);

    const expected$ = cold('------b|', { b: [hero] });

    expect(heroService.getHeroes()).toBeObservable(expected$);
  });
// #enddocregion retry-heroes-success

// #docregion retry-heroes-failure
  it('should return an empty array after retrying 3 times to retrieve heroes', () => {
    const error = 'Error!';
    const error$ = cold('---#', { }, error);
    let calls = 0;
    const response$ = defer(() => {
      calls++;

      return error$;
    });

    http.get.and.returnValue(response$);

    const expected$ = cold('------------(b|)', { b: [] });

    expect(heroService.getHeroes()).toBeObservable(expected$);
    expect(calls).toBe(4);
  });
// #enddocregion retry-heroes-failure
// #docregion marble-testing-setup
});
// #enddocregion
