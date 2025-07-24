/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  FetchBackend,
  HTTP_INTERCEPTORS,
  HttpBackend,
  HttpClient,
  HttpClientModule,
  HttpEvent,
  HttpEventType,
  HttpHandler,
  HttpHeaders,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
  provideHttpClient,
  withFetch,
} from '@angular/common/http';
import {importProvidersFrom, Injectable} from '@angular/core';
import {TestBed, waitForAsync} from '@angular/core/testing';
import {HttpClientBackendService, HttpClientInMemoryWebApiModule} from 'angular-in-memory-web-api';
import {Observable, zip, of} from 'rxjs';
import {concatMap, map, tap} from 'rxjs/operators';

import {Hero} from './fixtures/hero';
import {HeroInMemDataOverrideService} from './fixtures/hero-in-mem-data-override-service';
import {HeroInMemDataService} from './fixtures/hero-in-mem-data-service';
import {HeroService} from './fixtures/hero-service';
import {HttpClientHeroService} from './fixtures/http-client-hero-service';

describe('HttpClient Backend Service', () => {
  const delay = 1; // some minimal simulated latency delay

  describe('raw Angular HttpClient', () => {
    let http: HttpClient;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [
          HttpClientModule,
          HttpClientInMemoryWebApiModule.forRoot(HeroInMemDataService, {delay}),
        ],
      });

      http = TestBed.inject(HttpClient);
    });

    it('can get heroes', waitForAsync(() => {
      http
        .get<Hero[]>('api/heroes')
        .subscribe(
          (heroes) => expect(heroes.length).toBeGreaterThan(0, 'should have heroes'),
          failRequest,
        );
    }));

    it('GET should be a "cold" observable', waitForAsync(() => {
      const httpBackend = TestBed.inject<any>(HttpBackend);
      const spy = spyOn(httpBackend, 'collectionHandler').and.callThrough();
      const get$ = http.get<Hero[]>('api/heroes');

      // spy on `collectionHandler` should not be called before subscribe
      expect(spy).not.toHaveBeenCalled();

      get$.subscribe((heroes) => {
        expect(spy).toHaveBeenCalled();
        expect(heroes.length).toBeGreaterThan(0, 'should have heroes');
      }, failRequest);
    }));

    it('GET should wait until after delay to respond', waitForAsync(() => {
      // to make test fail, set `delay=0` above
      let gotResponse = false;

      http.get<Hero[]>('api/heroes').subscribe((heroes) => {
        gotResponse = true;
        expect(heroes.length).toBeGreaterThan(0, 'should have heroes');
      }, failRequest);

      expect(gotResponse).toBe(false, 'should delay before response');
    }));

    it('Should only initialize the db once', waitForAsync(() => {
      const httpBackend = TestBed.inject<any>(HttpBackend);
      const spy = spyOn(httpBackend, 'resetDb').and.callThrough();

      // Simultaneous backend.handler calls
      // Only the first should initialize by calling `resetDb`
      // All should wait until the db is "ready"
      // then they share the same db instance.
      http.get<Hero[]>('api/heroes').subscribe();
      http.get<Hero[]>('api/heroes').subscribe();
      http.get<Hero[]>('api/heroes').subscribe();
      http.get<Hero[]>('api/heroes').subscribe();

      expect(spy.calls.count()).toBe(1);
    }));

    it('can get heroes (w/ a different base path)', waitForAsync(() => {
      http.get<Hero[]>('some-base-path/heroes').subscribe((heroes) => {
        expect(heroes.length).toBeGreaterThan(0, 'should have heroes');
      }, failRequest);
    }));

    it('should 404 when GET unknown collection (after delay)', waitForAsync(() => {
      let gotError = false;
      const url = 'api/unknown-collection';
      http.get<Hero[]>(url).subscribe(
        () => fail(`should not have found data for '${url}'`),
        (err) => {
          gotError = true;
          expect(err.status).toBe(404, 'should have 404 status');
        },
      );

      expect(gotError).toBe(false, 'should not get error until after delay');
    }));

    it('should return the hero w/id=1 for GET app/heroes/1', waitForAsync(() => {
      http
        .get<Hero>('api/heroes/1')
        .subscribe((hero) => expect(hero).toBeDefined('should find hero with id=1'), failRequest);
    }));

    // test where id is string that looks like a number
    it('should return the stringer w/id="10" for GET app/stringers/10', waitForAsync(() => {
      http
        .get<Hero>('api/stringers/10')
        .subscribe(
          (hero) => expect(hero).toBeDefined('should find string with id="10"'),
          failRequest,
        );
    }));

    it('should return 1-item array for GET app/heroes/?id=1', waitForAsync(() => {
      http
        .get<Hero[]>('api/heroes/?id=1')
        .subscribe(
          (heroes) => expect(heroes.length).toBe(1, 'should find one hero w/id=1'),
          failRequest,
        );
    }));

    it('should return 1-item array for GET app/heroes?id=1', waitForAsync(() => {
      http
        .get<Hero[]>('api/heroes?id=1')
        .subscribe(
          (heroes) => expect(heroes.length).toBe(1, 'should find one hero w/id=1'),
          failRequest,
        );
    }));

    it('should return undefined for GET app/heroes?id=not-found-id', waitForAsync(() => {
      http
        .get<Hero[]>('api/heroes?id=123456')
        .subscribe((heroes) => expect(heroes.length).toBe(0), failRequest);
    }));

    it('should return 404 for GET app/heroes/not-found-id', waitForAsync(() => {
      const url = 'api/heroes/123456';
      http.get<Hero[]>(url).subscribe(
        () => fail(`should not have found data for '${url}'`),
        (err) => expect(err.status).toBe(404, 'should have 404 status'),
      );
    }));

    it('can generate the id when add a hero with no id', waitForAsync(() => {
      const hero = new Hero(undefined, 'SuperDooper');
      http.post<Hero>('api/heroes', hero).subscribe((replyHero) => {
        expect(replyHero.id).toBeDefined('added hero should have an id');
        expect(replyHero).not.toBe(hero, 'reply hero should not be the request hero');
      }, failRequest);
    }));

    it('can get nobodies (empty collection)', waitForAsync(() => {
      http.get<Hero[]>('api/nobodies').subscribe((nobodies) => {
        expect(nobodies.length).toBe(0, 'should have no nobodies');
      }, failRequest);
    }));

    it('can add a nobody with an id to empty nobodies collection', waitForAsync(() => {
      const id = 'g-u-i-d';

      http
        .post('api/nobodies', {id, name: 'Noman'})
        .pipe(concatMap(() => http.get<{id: string; name: string}[]>('api/nobodies')))
        .subscribe((nobodies) => {
          expect(nobodies.length).toBe(1, 'should a nobody');
          expect(nobodies[0].name).toBe('Noman', 'should be "Noman"');
          expect(nobodies[0].id).toBe(id, 'should preserve the submitted, ' + id);
        }, failRequest);
    }));

    it('should fail when add a nobody without an id to empty nobodies collection', waitForAsync(() => {
      http.post('api/nobodies', {name: 'Noman'}).subscribe(
        () => fail(`should not have been able to add 'Norman' to 'nobodies'`),
        (err) => {
          expect(err.status).toBe(422, 'should have 422 status');
          expect(err.body.error).toContain('id type is non-numeric');
        },
      );
    }));

    describe('can reset the database', () => {
      it('to empty (object db)', waitForAsync(() => resetDatabaseTest('object')));

      it('to empty (observable db)', waitForAsync(() => resetDatabaseTest('observable')));

      it('to empty (promise db)', waitForAsync(() => resetDatabaseTest('promise')));

      function resetDatabaseTest(returnType: string) {
        // Observable of the number of heroes and nobodies
        const sizes$ = zip(
          http.get<Hero[]>('api/heroes'),
          http.get<Hero[]>('api/nobodies'),
          http.get<Hero[]>('api/stringers'),
        ).pipe(map(([h, n, s]) => ({heroes: h.length, nobodies: n.length, stringers: s.length})));

        // Add a nobody so that we have one
        http
          .post('api/nobodies', {id: 42, name: 'Noman'})
          .pipe(
            // Reset database with "clear" option
            concatMap(() => http.post('commands/resetDb', {clear: true, returnType})),
            // get the number of heroes and nobodies
            concatMap(() => sizes$),
          )
          .subscribe((sizes) => {
            expect(sizes.heroes).toBe(0, 'reset should have cleared the heroes');
            expect(sizes.nobodies).toBe(0, 'reset should have cleared the nobodies');
            expect(sizes.stringers).toBe(0, 'reset should have cleared the stringers');
          }, failRequest);
      }
    });
  });

  describe('raw Angular HttpClient w/ override service', () => {
    let http: HttpClient;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [
          HttpClientModule,
          HttpClientInMemoryWebApiModule.forRoot(HeroInMemDataOverrideService, {delay}),
        ],
      });

      http = TestBed.inject(HttpClient);
    });

    it('can get heroes', waitForAsync(() => {
      http
        .get<Hero[]>('api/heroes')
        .subscribe(
          (heroes) => expect(heroes.length).toBeGreaterThan(0, 'should have heroes'),
          failRequest,
        );
    }));

    it('can translate `foo/heroes` to `heroes` via `parsedRequestUrl` override', waitForAsync(() => {
      http
        .get<Hero[]>('api/foo/heroes')
        .subscribe(
          (heroes) => expect(heroes.length).toBeGreaterThan(0, 'should have heroes'),
          failRequest,
        );
    }));

    it('can get villains', waitForAsync(() => {
      http
        .get<Hero[]>('api/villains')
        .subscribe(
          (villains) => expect(villains.length).toBeGreaterThan(0, 'should have villains'),
          failRequest,
        );
    }));

    it('should 404 when POST to villains', waitForAsync(() => {
      const url = 'api/villains';
      http.post<Hero[]>(url, {id: 42, name: 'Dr. Evil'}).subscribe(
        () => fail(`should not have POSTed data for '${url}'`),
        (err) => expect(err.status).toBe(404, 'should have 404 status'),
      );
    }));

    it('should 404 when GET unknown collection', waitForAsync(() => {
      const url = 'api/unknown-collection';
      http.get<Hero[]>(url).subscribe(
        () => fail(`should not have found data for '${url}'`),
        (err) => expect(err.status).toBe(404, 'should have 404 status'),
      );
    }));

    it('should use genId override to add new hero, "Maxinius"', waitForAsync(() => {
      http
        .post('api/heroes', {name: 'Maxinius'})
        .pipe(concatMap(() => http.get<Hero[]>('api/heroes?name=Maxi')))
        .subscribe((heroes) => {
          expect(heroes.length).toBe(1, 'should have found "Maxinius"');
          expect(heroes[0].name).toBe('Maxinius');
          expect(heroes[0].id).toBeGreaterThan(1000);
        }, failRequest);
    }));

    it('should use genId override guid generator for a new nobody without an id', waitForAsync(() => {
      http
        .post('api/nobodies', {name: 'Noman'})
        .pipe(concatMap(() => http.get<{id: string; name: string}[]>('api/nobodies')))
        .subscribe((nobodies) => {
          expect(nobodies.length).toBe(1, 'should a nobody');
          expect(nobodies[0].name).toBe('Noman', 'should be "Noman"');
          expect(typeof nobodies[0].id).toBe('string', 'should create a string (guid) id');
        }, failRequest);
    }));

    describe('can reset the database', () => {
      it('to empty (object db)', waitForAsync(() => resetDatabaseTest('object')));

      it('to empty (observable db)', waitForAsync(() => resetDatabaseTest('observable')));

      it('to empty (promise db)', waitForAsync(() => resetDatabaseTest('promise')));

      function resetDatabaseTest(returnType: string) {
        // Observable of the number of heroes, nobodies and villains
        const sizes$ = zip(
          http.get<Hero[]>('api/heroes'),
          http.get<Hero[]>('api/nobodies'),
          http.get<Hero[]>('api/stringers'),
          http.get<Hero[]>('api/villains'),
        ).pipe(
          map(([h, n, s, v]) => ({
            heroes: h.length,
            nobodies: n.length,
            stringers: s.length,
            villains: v.length,
          })),
        );

        // Add a nobody so that we have one
        http
          .post('api/nobodies', {id: 42, name: 'Noman'})
          .pipe(
            // Reset database with "clear" option
            concatMap(() => http.post('commands/resetDb', {clear: true, returnType})),
            // count all the collections
            concatMap(() => sizes$),
          )
          .subscribe((sizes) => {
            expect(sizes.heroes).toBe(0, 'reset should have cleared the heroes');
            expect(sizes.nobodies).toBe(0, 'reset should have cleared the nobodies');
            expect(sizes.stringers).toBe(0, 'reset should have cleared the stringers');
            expect(sizes.villains).toBeGreaterThan(0, 'reset should NOT clear villains');
          }, failRequest);
      }
    });
  });

  describe('HttpClient HeroService', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [
          HttpClientModule,
          HttpClientInMemoryWebApiModule.forRoot(HeroInMemDataService, {delay}),
        ],
        providers: [{provide: HeroService, useClass: HttpClientHeroService}],
      });
    });

    describe('HeroService core', () => {
      let heroService: HeroService;

      beforeEach(() => {
        heroService = TestBed.inject(HeroService);
      });

      it('can get heroes', waitForAsync(() => {
        heroService.getHeroes().subscribe((heroes) => {
          expect(heroes.length).toBeGreaterThan(0, 'should have heroes');
        }, failRequest);
      }));

      it('can get hero w/ id=1', waitForAsync(() => {
        heroService.getHero(1).subscribe(
          (hero) => {
            expect(hero.name).toBe('Windstorm');
          },
          () => fail('getHero failed'),
        );
      }));

      it('should 404 when hero id not found', waitForAsync(() => {
        const id = 123456;
        heroService.getHero(id).subscribe(
          () => fail(`should not have found hero for id='${id}'`),
          (err) => {
            expect(err.status).toBe(404, 'should have 404 status');
          },
        );
      }));

      it('can add a hero', waitForAsync(() => {
        heroService
          .addHero('FunkyBob')
          .pipe(
            tap((hero) => expect(hero.name).toBe('FunkyBob')),
            // Get the new hero by its generated id
            concatMap((hero) => heroService.getHero(hero.id)),
          )
          .subscribe(
            (hero) => {
              expect(hero.name).toBe('FunkyBob');
            },
            () => failRequest('re-fetch of new hero failed'),
          );
      }), 10000);

      it('can delete a hero', waitForAsync(() => {
        const id = 1;
        heroService.deleteHero(id).subscribe((_: {}) => expect(_).toBeDefined(), failRequest);
      }));

      it('should allow delete of non-existent hero', waitForAsync(() => {
        const id = 123456;
        heroService.deleteHero(id).subscribe((_: {}) => expect(_).toBeDefined(), failRequest);
      }));

      it('can search for heroes by name containing "a"', waitForAsync(() => {
        heroService.searchHeroes('a').subscribe((heroes: Hero[]) => {
          expect(heroes.length).toBe(3, 'should find 3 heroes with letter "a"');
        }, failRequest);
      }));

      it('can update existing hero', waitForAsync(() => {
        const id = 1;
        heroService
          .getHero(id)
          .pipe(
            concatMap((hero) => {
              hero.name = 'Thunderstorm';
              return heroService.updateHero(hero);
            }),
            concatMap(() => heroService.getHero(id)),
          )
          .subscribe(
            (hero) => expect(hero.name).toBe('Thunderstorm'),
            () => fail('re-fetch of updated hero failed'),
          );
      }), 10000);

      it('should create new hero when try to update non-existent hero', waitForAsync(() => {
        const falseHero = new Hero(12321, 'DryMan');
        heroService
          .updateHero(falseHero)
          .subscribe((hero) => expect(hero.name).toBe(falseHero.name), failRequest);
      }));
    });
  });

  describe('HttpClient interceptor', () => {
    let http: HttpClient;
    let interceptors: HttpInterceptor[];
    let httpBackend: HttpClientBackendService;

    /**
     * Test interceptor adds a request header and a response header
     */
    @Injectable()
    class TestHeaderInterceptor implements HttpInterceptor {
      intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const reqClone = req.clone({setHeaders: {'x-test-req': 'req-test-header'}});

        return next.handle(reqClone).pipe(
          map((event) => {
            if (event instanceof HttpResponse) {
              event = event.clone({headers: event.headers.set('x-test-res', 'res-test-header')});
            }
            return event;
          }),
        );
      }
    }

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [
          HttpClientModule,
          HttpClientInMemoryWebApiModule.forRoot(HeroInMemDataService, {delay}),
        ],
        providers: [
          // Add test interceptor just for this test suite
          {provide: HTTP_INTERCEPTORS, useClass: TestHeaderInterceptor, multi: true},
        ],
      });

      http = TestBed.inject(HttpClient);
      httpBackend = TestBed.inject<any>(HttpBackend);
      interceptors = TestBed.inject<any>(HTTP_INTERCEPTORS);
    });

    // sanity test
    it('TestingModule should provide the test interceptor', () => {
      const ti = interceptors.find((i) => i instanceof TestHeaderInterceptor);
      expect(ti).toBeDefined();
    });

    it('should have GET request header from test interceptor', waitForAsync(() => {
      const handle = spyOn(httpBackend, 'handle').and.callThrough();

      http.get<Hero[]>('api/heroes').subscribe((heroes) => {
        // HttpRequest is first arg of the first call to in-mem backend `handle`
        const req: HttpRequest<Hero[]> = handle.calls.argsFor(0)[0];
        const reqHeader = req.headers.get('x-test-req');
        expect(reqHeader).toBe('req-test-header');

        expect(heroes.length).toBeGreaterThan(0, 'should have heroes');
      }, failRequest);
    }));

    it('should have GET response header from test interceptor', waitForAsync(() => {
      let gotResponse = false;
      const req = new HttpRequest<any>('GET', 'api/heroes');
      http.request<Hero[]>(req).subscribe(
        (event) => {
          if (event.type === HttpEventType.Response) {
            gotResponse = true;

            const resHeader = event.headers.get('x-test-res');
            expect(resHeader).toBe('res-test-header');

            const heroes = event.body as Hero[];
            expect(heroes.length).toBeGreaterThan(0, 'should have heroes');
          }
        },
        failRequest,
        () => expect(gotResponse).toBe(true, 'should have seen Response event'),
      );
    }));
  });

  describe('HttpClient passThru', () => {
    let http: HttpClient;
    let httpBackend: HttpClientBackendService;
    let createPassThruBackend: jasmine.Spy;
    const mockPassThroughResponse = of({
      status: 200,
      headers: new HttpHeaders({'Content-Type': 'application/json'}),
      body: JSON.stringify([{id: 42, name: 'Dude'}]),
    } as HttpEvent<any>);

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [
          HttpClientModule,
          HttpClientInMemoryWebApiModule.forRoot(HeroInMemDataService, {
            delay,
            passThruUnknownUrl: true,
          }),
        ],
      });

      http = TestBed.inject(HttpClient);
      httpBackend = TestBed.inject<any>(HttpBackend);
      createPassThruBackend = spyOn(<any>httpBackend, 'createPassThruBackend').and.callThrough();
      spyOn(httpBackend, 'handle').and.returnValue(mockPassThroughResponse);
    });

    it('can get heroes (no passthru)', waitForAsync(() => {
      http.get<Hero[]>('api/heroes').subscribe((heroes) => {
        expect(createPassThruBackend).not.toHaveBeenCalled();
        expect(heroes.length).toBeGreaterThan(0, 'should have heroes');
      }, failRequest);
    }));

    // `passthru` is NOT a collection in the data store
    // so requests for it should pass thru to the "real" server

    it('can GET passthru', waitForAsync(() => {
      http.get<any[]>('api/passthru').subscribe((passthru) => {
        expect(passthru.length).toBeGreaterThan(0, 'should have passthru data');
      }, failRequest);
    }));

    it('can ADD to passthru', waitForAsync(() => {
      http.post<any>('api/passthru', {name: 'Dude'}).subscribe((passthru) => {
        expect(passthru).toBeDefined('should have passthru data');
        expect(passthru.id).toBe(42, 'passthru object should have id 42');
      }, failRequest);
    }));
  });

  describe('Http dataEncapsulation = true', () => {
    let http: HttpClient;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [
          HttpClientModule,
          HttpClientInMemoryWebApiModule.forRoot(HeroInMemDataService, {
            delay,
            dataEncapsulation: true,
          }),
        ],
      });

      http = TestBed.inject(HttpClient);
    });

    it('can get heroes (encapsulated)', waitForAsync(() => {
      http
        .get<{data: any}>('api/heroes')
        .pipe(map((data) => data.data as Hero[]))
        .subscribe(
          (heroes) => expect(heroes.length).toBeGreaterThan(0, 'should have data.heroes'),
          failRequest,
        );
    }));
  });

  describe('when using the FetchBackend', () => {
    it('should be the an InMemory Service', () => {
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(withFetch()),
          importProvidersFrom(
            HttpClientInMemoryWebApiModule.forRoot(HeroInMemDataService, {delay}),
          ),
          {provide: HeroService, useClass: HttpClientHeroService},
        ],
      });

      expect(TestBed.inject(HttpBackend)).toBeInstanceOf(HttpClientBackendService);
    });

    it('should be a FetchBackend', () => {
      // In this test, providers order matters
      TestBed.configureTestingModule({
        providers: [
          importProvidersFrom(
            HttpClientInMemoryWebApiModule.forRoot(HeroInMemDataService, {delay}),
          ),
          provideHttpClient(withFetch()),
          {provide: HeroService, useClass: HttpClientHeroService},
        ],
      });

      expect(TestBed.inject(HttpBackend)).toBeInstanceOf(FetchBackend);
    });
  });
});

/**
 * Fail a Jasmine test such that it displays the error object,
 * typically passed in the error path of an Observable.subscribe()
 */
function failRequest(err: any) {
  fail(JSON.stringify(err));
}
