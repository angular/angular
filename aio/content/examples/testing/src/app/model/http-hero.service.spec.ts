/**
 * Test the HeroService when implemented with the OLD HttpModule
 */
import {
   async, inject, TestBed
} from '@angular/core/testing';

import {
  MockBackend,
  MockConnection
} from '@angular/http/testing';

import {
  HttpModule, Http, XHRBackend, Response, ResponseOptions
} from '@angular/http';

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
  let backend: MockBackend;
  let service: HttpHeroService;

  beforeEach( () => {
    TestBed.configureTestingModule({
      imports: [ HttpModule ],
      providers: [
        HttpHeroService,
        { provide: XHRBackend, useClass: MockBackend }
      ]
    });
  });

  it('can instantiate service via DI', () => {
      service = TestBed.get(HttpHeroService);
      expect(service instanceof HttpHeroService).toBe(true);
  });

  it('can instantiate service with "new"', () => {
    const http = TestBed.get(Http);
    expect(http).not.toBeNull('http should be provided');
    let service = new HttpHeroService(http);
    expect(service instanceof HttpHeroService).toBe(true, 'new service should be ok');
  });

  it('can provide the mockBackend as XHRBackend', () => {
    const backend = TestBed.get(XHRBackend);
    expect(backend).not.toBeNull('backend should be provided');
  });

  describe('when getHeroes', () => {
    let fakeHeroes: Hero[];
    let http: Http;
    let response: Response;

    beforeEach(() => {

      backend = TestBed.get(XHRBackend);
      http = TestBed.get(Http);

      service = new HttpHeroService(http);
      fakeHeroes = makeHeroData();
      let options = new ResponseOptions({status: 200, body: {data: fakeHeroes}});
      response = new Response(options);
    });

    it('should have expected fake heroes (then)', () => {
      backend.connections.subscribe((c: MockConnection) => c.mockRespond(response));

      service.getHeroes().toPromise()
      // .then(() => Promise.reject('deliberate'))
        .then(heroes => {
          expect(heroes.length).toBe(fakeHeroes.length,
            'should have expected no. of heroes');
        })
        .catch(fail);
    });

    it('should have expected fake heroes (Observable tap)', () => {
      backend.connections.subscribe((c: MockConnection) => c.mockRespond(response));

      service.getHeroes().subscribe(
        heroes => {
          expect(heroes.length).toBe(fakeHeroes.length,
            'should have expected no. of heroes');
        },
        fail
      );
    });


    it('should be OK returning no heroes', () => {
      let resp = new Response(new ResponseOptions({status: 200, body: {data: []}}));
      backend.connections.subscribe((c: MockConnection) => c.mockRespond(resp));

      service.getHeroes().subscribe(
        heroes => {
          expect(heroes.length).toBe(0, 'should have no heroes');
        },
        fail
      );
    });

    it('should treat 404 as an Observable error', () => {
      let resp = new Response(new ResponseOptions({status: 404}));
      backend.connections.subscribe((c: MockConnection) => c.mockRespond(resp));

      service.getHeroes().subscribe(
        heroes => fail('should not respond with heroes'),
        err => {
          expect(err).toMatch(/Bad response status/, 'should catch bad response status code');
          return of(null); // failure is the expected test result
        });
    });
  });
});
