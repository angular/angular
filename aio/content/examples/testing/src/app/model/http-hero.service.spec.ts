/**
 * Test the HeroService when implemented with the OLD HttpModule
 */
import {
   async, inject, TestBed
} from '@angular/core/testing';

import {
  HttpClient
} from '@angular/common/http';

import {
  HttpClientTestingModule, HttpTestingController
} from '@angular/common/http/testing';

import { of } from 'rxjs';

import { Hero } from './hero';
import { HttpHeroService } from './http-hero.service';

const makeHeroData = () => [
  { id: 1, name: 'Windstorm' },
  { id: 2, name: 'Bombasto' },
  { id: 3, name: 'Magneta' },
  { id: 4, name: 'Tornado' }
] as Hero[];

////////  Tests  /////////////
describe('HttpHeroService (using old HttpModule)', () => {
  let backend: HttpTestingController;
  let service: HttpHeroService;

  beforeEach( () => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule ],
      providers: [HttpHeroService]
    });
  });

  it('can instantiate service via DI', () => {
      service = TestBed.get(HttpHeroService);
      expect(service instanceof HttpHeroService).toBe(true);
  });

  it('can instantiate service with "new"', () => {
    const http = TestBed.get(HttpClient);
    expect(http).not.toBeNull('httpclient should be provided');
    let service = new HttpHeroService(http);
    expect(service instanceof HttpHeroService).toBe(true, 'new service should be ok');
  });

  describe('when getHeroes', () => {
    let fakeHeroes: Hero[];
    let http: HttpClient;
    let response: Object;

    beforeEach(() => {

      backend = TestBed.get(HttpTestingController);
      http = TestBed.get(HttpClient);

      service = new HttpHeroService(http);
      fakeHeroes = makeHeroData();
      response = {status: 200, body: {data: fakeHeroes}};
    });

    afterEach(() => {
      backend.verify();
    });

    it('should have expected fake heroes (then)', () => {
      service.getHeroes().toPromise()
      // .then(() => Promise.reject('deliberate'))
        .then(heroes => {
          expect(heroes.length).toBe(fakeHeroes.length,
            'should have expected no. of heroes');
        })
        .catch(fail);

      const req = backend.expectOne(service._heroesUrl);
      req.flush(response);
    });

    it('should have expected fake heroes (Observable tap)', () => {
      service.getHeroes().subscribe(
        heroes => {
          expect(heroes.length).toBe(fakeHeroes.length,
            'should have expected no. of heroes');
        },
        fail
      );

      const req = backend.expectOne(service._heroesUrl);
      req.flush(response);
    });


    it('should be OK returning no heroes', () => {
      service.getHeroes().subscribe(
        heroes => {
          expect(heroes.length).toBe(0, 'should have no heroes');
        },
        fail
      );

      const req = backend.expectOne(service._heroesUrl);
      req.flush([]);
    });

    it('should treat 404 as an Observable error', () => {
      service.getHeroes().subscribe(
        heroes => fail('should not respond with heroes'),
        err => {
          expect(err).toMatch(/Bad response status/, 'should catch bad response status code');
          return of(null); // failure is the expected test result
        });

      const req = backend.expectOne(service._heroesUrl);
      req.flush([], {status: 404});
    });
  });
});
