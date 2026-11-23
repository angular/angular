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
import {TestBed} from '@angular/core/testing';
import {HttpClientBackendService, HttpClientInMemoryWebApiModule} from 'angular-in-memory-web-api';
import {firstValueFrom, Observable, of, zip} from 'rxjs';
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

    it('can get heroes', async () => {
      const heroes = await firstValueFrom(http.get<Hero[]>('api/heroes'));
      expect(heroes.length).toBeGreaterThan(0, 'should have heroes');
    });

    it('GET should be a "cold" observable', async () => {
      const httpBackend = TestBed.inject<any>(HttpBackend);
      const spy = spyOn(httpBackend, 'collectionHandler').and.callThrough();
      const get$ = http.get<Hero[]>('api/heroes');

      // spy on `collectionHandler` should not be called before subscribe
      expect(spy).not.toHaveBeenCalled();

      const heroes = await firstValueFrom(get$);
      expect(spy).toHaveBeenCalled();
      expect(heroes.length).toBeGreaterThan(0, 'should have heroes');
    });

    it('GET should wait until after delay to respond', async () => {
      // to make test fail, set `delay=0` above
      let gotResponse = false;

      const p = firstValueFrom(
        http.get<Hero[]>('api/heroes').pipe(
          tap((heroes) => {
            gotResponse = true;
            expect(heroes.length).toBeGreaterThan(0, 'should have heroes');
          }),
        ),
      );

      expect(gotResponse).toBe(false, 'should delay before response');
      await p;
    });

    it('Should only initialize the db once', async () => {
      const httpBackend = TestBed.inject<any>(HttpBackend);
      const spy = spyOn(httpBackend, 'resetDb').and.callThrough();

      // Simultaneous backend.handler calls
      // Only the first should initialize by calling `resetDb`
      // All should wait until the db is "ready"
      // then they share the same db instance.
      const p1 = firstValueFrom(http.get<Hero[]>('api/heroes'));
      const p2 = firstValueFrom(http.get<Hero[]>('api/heroes'));
      const p3 = firstValueFrom(http.get<Hero[]>('api/heroes'));
      const p4 = firstValueFrom(http.get<Hero[]>('api/heroes'));

      expect(spy.calls.count()).toBe(1);
      await Promise.all([p1, p2, p3, p4]);
    });

    it('can get heroes (w/ a different base path)', async () => {
      const heroes = await firstValueFrom(http.get<Hero[]>('some-base-path/heroes'));
      expect(heroes.length).toBeGreaterThan(0, 'should have heroes');
    });

    it('should 404 when GET unknown collection (after delay)', async () => {
      let gotError = false;
      const url = 'api/unknown-collection';
      const p = new Promise<void>((resolve) => {
        http.get<Hero[]>(url).subscribe(
          () => {
            fail(`should not have found data for '${url}'`);
            resolve();
          },
          (err) => {
            gotError = true;
            expect(err.status).toBe(404, 'should have 404 status');
            resolve();
          },
        );
      });

      expect(gotError).toBe(false, 'should not get error until after delay');
      await p;
    });

    it('should return the hero w/id=1 for GET app/heroes/1', async () => {
      const hero = await firstValueFrom(http.get<Hero>('api/heroes/1'));
      expect(hero).toBeDefined('should find hero with id=1');
    });

    // test where id is string that looks like a number
    it('should return the stringer w/id="10" for GET app/stringers/10', async () => {
      const hero = await firstValueFrom(http.get<Hero>('api/stringers/10'));
      expect(hero).toBeDefined('should find string with id="10"');
    });

    it('should return 1-item array for GET app/heroes/?id=1', async () => {
      const heroes = await firstValueFrom(http.get<Hero[]>('api/heroes/?id=1'));
      expect(heroes.length).toBe(1, 'should find one hero w/id=1');
    });

    it('should return 1-item array for GET app/heroes?id=1', async () => {
      const heroes = await firstValueFrom(http.get<Hero[]>('api/heroes?id=1'));
      expect(heroes.length).toBe(1, 'should find one hero w/id=1');
    });

    it('should return undefined for GET app/heroes?id=not-found-id', async () => {
      const heroes = await firstValueFrom(http.get<Hero[]>('api/heroes?id=123456'));
      expect(heroes.length).toBe(0);
    });

    it('should return 404 for GET app/heroes/not-found-id', async () => {
      const url = 'api/heroes/123456';
      try {
        await firstValueFrom(http.get<Hero[]>(url));
        fail(`should not have found data for '${url}'`);
      } catch (err: any) {
        expect(err.status).toBe(404, 'should have 404 status');
      }
    });

    it('can generate the id when add a hero with no id', async () => {
      const hero = new Hero(undefined, 'SuperDooper');
      const replyHero = await firstValueFrom(http.post<Hero>('api/heroes', hero));
      expect(replyHero.id).toBeDefined('added hero should have an id');
      expect(replyHero).not.toBe(hero, 'reply hero should not be the request hero');
    });

    it('can get nobodies (empty collection)', async () => {
      const nobodies = await firstValueFrom(http.get<Hero[]>('api/nobodies'));
      expect(nobodies.length).toBe(0, 'should have no nobodies');
    });

    it('can add a nobody with an id to empty nobodies collection', async () => {
      const id = 'g-u-i-d';

      const nobodies = await firstValueFrom(
        http
          .post('api/nobodies', {id, name: 'Noman'})
          .pipe(concatMap(() => http.get<{id: string; name: string}[]>('api/nobodies'))),
      );
      expect(nobodies.length).toBe(1, 'should a nobody');
      expect(nobodies[0].name).toBe('Noman', 'should be "Noman"');
      expect(nobodies[0].id).toBe(id, 'should preserve the submitted, ' + id);
    });

    it('should fail when add a nobody without an id to empty nobodies collection', async () => {
      try {
        await firstValueFrom(http.post('api/nobodies', {name: 'Noman'}));
        fail(`should not have been able to add 'Norman' to 'nobodies'`);
      } catch (err: any) {
        expect(err.status).toBe(422, 'should have 422 status');
        expect(err.body.error).toContain('id type is non-numeric');
      }
    });

    describe('can reset the database', () => {
      it('to empty (object db)', () => resetDatabaseTest('object'));

      it('to empty (observable db)', () => resetDatabaseTest('observable'));

      it('to empty (promise db)', () => resetDatabaseTest('promise'));

      async function resetDatabaseTest(returnType: string) {
        // Observable of the number of heroes and nobodies
        const sizes$ = zip(
          http.get<Hero[]>('api/heroes'),
          http.get<Hero[]>('api/nobodies'),
          http.get<Hero[]>('api/stringers'),
        ).pipe(map(([h, n, s]) => ({heroes: h.length, nobodies: n.length, stringers: s.length})));

        // Add a nobody so that we have one
        const sizes = await firstValueFrom(
          http.post('api/nobodies', {id: 42, name: 'Noman'}).pipe(
            // Reset database with "clear" option
            concatMap(() => http.post('commands/resetDb', {clear: true, returnType})),
            // get the number of heroes and nobodies
            concatMap(() => sizes$),
          ),
        );
        expect(sizes.heroes).toBe(0, 'reset should have cleared the heroes');
        expect(sizes.nobodies).toBe(0, 'reset should have cleared the nobodies');
        expect(sizes.stringers).toBe(0, 'reset should have cleared the stringers');
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

    it('can get heroes', async () => {
      const heroes = await firstValueFrom(http.get<Hero[]>('api/heroes'));
      expect(heroes.length).toBeGreaterThan(0, 'should have heroes');
    });

    it('can translate `foo/heroes` to `heroes` via `parsedRequestUrl` override', async () => {
      const heroes = await firstValueFrom(http.get<Hero[]>('api/foo/heroes'));
      expect(heroes.length).toBeGreaterThan(0, 'should have heroes');
    });

    it('can get villains', async () => {
      const villains = await firstValueFrom(http.get<Hero[]>('api/villains'));
      expect(villains.length).toBeGreaterThan(0, 'should have villains');
    });

    it('should 404 when POST to villains', async () => {
      const url = 'api/villains';
      try {
        await firstValueFrom(http.post<Hero[]>(url, {id: 42, name: 'Dr. Evil'}));
        fail(`should not have POSTed data for '${url}'`);
      } catch (err: any) {
        expect(err.status).toBe(404, 'should have 404 status');
      }
    });

    it('should 404 when GET unknown collection', async () => {
      const url = 'api/unknown-collection';
      try {
        await firstValueFrom(http.get<Hero[]>(url));
        fail(`should not have found data for '${url}'`);
      } catch (err: any) {
        expect(err.status).toBe(404, 'should have 404 status');
      }
    });

    it('should use genId override to add new hero, "Maxinius"', async () => {
      const heroes = await firstValueFrom(
        http
          .post('api/heroes', {name: 'Maxinius'})
          .pipe(concatMap(() => http.get<Hero[]>('api/heroes?name=Maxi'))),
      );
      expect(heroes.length).toBe(1, 'should have found "Maxinius"');
      expect(heroes[0].name).toBe('Maxinius');
      expect(heroes[0].id).toBeGreaterThan(1000);
    });

    it('should use genId override guid generator for a new nobody without an id', async () => {
      const nobodies = await firstValueFrom(
        http
          .post('api/nobodies', {name: 'Noman'})
          .pipe(concatMap(() => http.get<{id: string; name: string}[]>('api/nobodies'))),
      );
      expect(nobodies.length).toBe(1, 'should a nobody');
      expect(nobodies[0].name).toBe('Noman', 'should be "Noman"');
      expect(typeof nobodies[0].id).toBe('string', 'should create a string (guid) id');
    });

    describe('can reset the database', () => {
      it('to empty (object db)', () => resetDatabaseTest('object'));

      it('to empty (observable db)', () => resetDatabaseTest('observable'));

      it('to empty (promise db)', () => resetDatabaseTest('promise'));

      async function resetDatabaseTest(returnType: string) {
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
        const sizes = await firstValueFrom(
          http.post('api/nobodies', {id: 42, name: 'Noman'}).pipe(
            // Reset database with "clear" option
            concatMap(() => http.post('commands/resetDb', {clear: true, returnType})),
            // count all the collections
            concatMap(() => sizes$),
          ),
        );
        expect(sizes.heroes).toBe(0, 'reset should have cleared the heroes');
        expect(sizes.nobodies).toBe(0, 'reset should have cleared the nobodies');
        expect(sizes.stringers).toBe(0, 'reset should have cleared the stringers');
        expect(sizes.villains).toBeGreaterThan(0, 'reset should NOT clear villains');
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

      it('can get heroes', async () => {
        const heroes = await firstValueFrom(heroService.getHeroes());
        expect(heroes.length).toBeGreaterThan(0, 'should have heroes');
      });

      it('can get hero w/ id=1', async () => {
        const hero = await firstValueFrom(heroService.getHero(1));
        expect(hero.name).toBe('Windstorm');
      });

      it('should 404 when hero id not found', async () => {
        const id = 123456;
        try {
          await firstValueFrom(heroService.getHero(id));
          fail(`should not have found hero for id='${id}'`);
        } catch (err: any) {
          expect(err.status).toBe(404, 'should have 404 status');
        }
      });

      it('can add a hero', async () => {
        const hero = await firstValueFrom(
          heroService.addHero('FunkyBob').pipe(
            tap((hero) => expect(hero.name).toBe('FunkyBob')),
            // Get the new hero by its generated id
            concatMap((hero) => heroService.getHero(hero.id)),
          ),
        );
        expect(hero.name).toBe('FunkyBob');
      }, 10000);

      it('can delete a hero', async () => {
        const id = 1;
        const res = await firstValueFrom(heroService.deleteHero(id));
        expect(res).toBeDefined();
      });

      it('should allow delete of non-existent hero', async () => {
        const id = 123456;
        const res = await firstValueFrom(heroService.deleteHero(id));
        expect(res).toBeDefined();
      });

      it('can search for heroes by name containing "a"', async () => {
        const heroes = await firstValueFrom(heroService.searchHeroes('a'));
        expect(heroes.length).toBe(3, 'should find 3 heroes with letter "a"');
      });

      it('can update existing hero', async () => {
        const id = 1;
        const hero = await firstValueFrom(
          heroService.getHero(id).pipe(
            concatMap((hero) => {
              hero.name = 'Thunderstorm';
              return heroService.updateHero(hero);
            }),
            concatMap(() => heroService.getHero(id)),
          ),
        );
        expect(hero.name).toBe('Thunderstorm');
      }, 10000);

      it('should create new hero when try to update non-existent hero', async () => {
        const falseHero = new Hero(12321, 'DryMan');
        const hero = await firstValueFrom(heroService.updateHero(falseHero));
        expect(hero.name).toBe(falseHero.name);
      });
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

    it('should have GET request header from test interceptor', async () => {
      const handle = spyOn(httpBackend, 'handle').and.callThrough();

      const heroes = await firstValueFrom(http.get<Hero[]>('api/heroes'));
      // HttpRequest is first arg of the first call to in-mem backend `handle`
      const req: HttpRequest<Hero[]> = handle.calls.argsFor(0)[0];
      const reqHeader = req.headers.get('x-test-req');
      expect(reqHeader).toBe('req-test-header');

      expect(heroes.length).toBeGreaterThan(0, 'should have heroes');
    });

    it('should have GET response header from test interceptor', async () => {
      let gotResponse = false;
      const req = new HttpRequest<any>('GET', 'api/heroes');
      await new Promise<void>((resolve, reject) => {
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
          (err) => {
            failRequest(err);
            reject(err);
          },
          () => {
            expect(gotResponse).toBe(true, 'should have seen Response event');
            resolve();
          },
        );
      });
    });
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

    it('can get heroes (no passthru)', async () => {
      await new Promise<void>((resolve) => {
        http.get<Hero[]>('api/heroes').subscribe({
          next: (heroes) => {
            expect(createPassThruBackend).not.toHaveBeenCalled();
            expect(heroes.length).toBeGreaterThan(0, 'should have heroes');
          },
          error: failRequest,
          complete: resolve,
        });
      });
    });

    // `passthru` is NOT a collection in the data store
    // so requests for it should pass thru to the "real" server

    it('can GET passthru', async () => {
      await new Promise<void>((resolve) => {
        http.get<any[]>('api/passthru').subscribe({
          next: (passthru) => {
            expect(passthru.length).toBeGreaterThan(0, 'should have passthru data');
          },
          error: failRequest,
          complete: resolve,
        });
      });
    });

    it('can ADD to passthru', async () => {
      await new Promise<void>((resolve) => {
        http.post<any>('api/passthru', {name: 'Dude'}).subscribe({
          next: (passthru) => {
            expect(passthru).toBeDefined('should have passthru data');
            expect(passthru.id).toBe(42, 'passthru object should have id 42');
          },
          error: failRequest,
          complete: resolve,
        });
      });
    });
  });

  describe('HttpClient passThru creation', () => {
    it('should create the passThru backend', () => {
      TestBed.configureTestingModule({
        imports: [
          HttpClientInMemoryWebApiModule.forRoot(HeroInMemDataService, {
            delay,
            passThruUnknownUrl: true,
          }),
        ],
      });
      const httpBackend = TestBed.inject<any>(HttpBackend);
      expect(() => httpBackend.createPassThruBackend()).not.toThrow();
    });
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

    it('can get heroes (encapsulated)', async () => {
      const heroes = await firstValueFrom(
        http.get<{data: any}>('api/heroes').pipe(map((data) => data.data as Hero[])),
      );
      expect(heroes.length).toBeGreaterThan(0, 'should have data.heroes');
    });
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
