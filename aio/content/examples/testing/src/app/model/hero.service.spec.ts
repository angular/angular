import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

// Other imports
import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';

import { asyncData, asyncError } from '../../testing/async-observable-helpers';

import { Hero } from './hero';
import { HeroService } from './hero.service';

describe ('HeroesService (with spies)', () => {
  // #docregion test-with-spies
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let heroService: HeroService;

  beforeEach(() => {
    // TODO: spy on other methods too
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);
    heroService = new HeroService(httpClientSpy);
  });

  it('should return expected heroes (HttpClient called once)', (done: DoneFn) => {
    const expectedHeroes: Hero[] =
      [{ id: 1, name: 'A' }, { id: 2, name: 'B' }];

    httpClientSpy.get.and.returnValue(asyncData(expectedHeroes));

    heroService.getHeroes().subscribe({
      next: heroes => {
        expect(heroes)
          .withContext('expected heroes')
          .toEqual(expectedHeroes);
        done();
      },
      error: done.fail
    });
    expect(httpClientSpy.get.calls.count())
      .withContext('one call')
      .toBe(1);
  });

  it('should return an error when the server returns a 404', (done: DoneFn) => {
    const errorResponse = new HttpErrorResponse({
      error: 'test 404 error',
      status: 404, statusText: 'Not Found'
    });

    httpClientSpy.get.and.returnValue(asyncError(errorResponse));

    heroService.getHeroes().subscribe({
      next: heroes => done.fail('expected an error, not heroes'),
      error: error  => {
        expect(error.message).toContain('test 404 error');
        done();
      }
    });
  });
  // #enddocregion test-with-spies

});

describe('HeroesService (with mocks)', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let heroService: HeroService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      // Import the HttpClient mocking services
      imports: [ HttpClientTestingModule ],
      // Provide the service-under-test
      providers: [ HeroService ]
    });

    // Inject the http, test controller, and service-under-test
    // as they will be referenced by each test.
    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    heroService = TestBed.inject(HeroService);
  });

  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  /// HeroService method tests begin ///
  describe('#getHeroes', () => {
    let expectedHeroes: Hero[];

    beforeEach(() => {
      heroService = TestBed.inject(HeroService);
      expectedHeroes = [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
       ] as Hero[];
    });

    it('should return expected heroes (called once)', () => {
      heroService.getHeroes().subscribe({
        next: heroes => expect(heroes)
          .withContext('should return expected heroes')
          .toEqual(expectedHeroes),
        error: fail
      });

      // HeroService should have made one request to GET heroes from expected URL
      const req = httpTestingController.expectOne(heroService.heroesUrl);
      expect(req.request.method).toEqual('GET');

      // Respond with the mock heroes
      req.flush(expectedHeroes);
    });

    it('should be OK returning no heroes', () => {
      heroService.getHeroes().subscribe({
        next: heroes => expect(heroes.length)
          .withContext('should have empty heroes array')
          .toEqual(0),
        error: fail
      });

      const req = httpTestingController.expectOne(heroService.heroesUrl);
      req.flush([]); // Respond with no heroes
    });

    it('should turn 404 into a user-friendly error', () => {
      const msg = 'Deliberate 404';
      heroService.getHeroes().subscribe({
        next: heroes => fail('expected to fail'),
        error: error => expect(error.message).toContain(msg)
      });

      const req = httpTestingController.expectOne(heroService.heroesUrl);

      // respond with a 404 and the error message in the body
      req.flush(msg, {status: 404, statusText: 'Not Found'});
    });

    it('should return expected heroes (called multiple times)', () => {
      heroService.getHeroes().subscribe();
      heroService.getHeroes().subscribe();
      heroService.getHeroes().subscribe({
        next: heroes => expect(heroes)
          .withContext('should return expected heroes')
          .toEqual(expectedHeroes),
        error: fail
      });

      const requests = httpTestingController.match(heroService.heroesUrl);
      expect(requests.length)
        .withContext('calls to getHeroes()')
        .toEqual(3);

      // Respond to each request with different mock hero results
      requests[0].flush([]);
      requests[1].flush([{id: 1, name: 'bob'}]);
      requests[2].flush(expectedHeroes);
    });
  });

  describe('#updateHero', () => {
    // Expecting the query form of URL so should not 404 when id not found
    const makeUrl = (id: number) => `${heroService.heroesUrl}/?id=${id}`;

    it('should update a hero and return it', () => {

      const updateHero: Hero = { id: 1, name: 'A' };

      heroService.updateHero(updateHero).subscribe({
        next: data => expect(data)
          .withContext('should return the hero')
          .toEqual(updateHero),
        error: fail
      });

      // HeroService should have made one request to PUT hero
      const req = httpTestingController.expectOne(heroService.heroesUrl);
      expect(req.request.method).toEqual('PUT');
      expect(req.request.body).toEqual(updateHero);

      // Expect server to return the hero after PUT
      const expectedResponse = new HttpResponse(
        { status: 200, statusText: 'OK', body: updateHero });
      req.event(expectedResponse);
    });

    it('should turn 404 error into user-facing error', () => {
      const msg = 'Deliberate 404';
      const updateHero: Hero = { id: 1, name: 'A' };
      heroService.updateHero(updateHero).subscribe({
        next: heroes => fail('expected to fail'),
        error: error => expect(error.message).toContain(msg)
      });

      const req = httpTestingController.expectOne(heroService.heroesUrl);

      // respond with a 404 and the error message in the body
      req.flush(msg, {status: 404, statusText: 'Not Found'});
    });

    it('should turn network error into user-facing error', done => {
      // Create mock ProgressEvent with type `error`, raised when something goes wrong at
      // the network level. Connection timeout, DNS error, offline, etc.
      const errorEvent = new ProgressEvent('error');

      const updateHero: Hero = { id: 1, name: 'A' };
      heroService.updateHero(updateHero).subscribe({
        next: heroes => fail('expected to fail'),
        error: error => {
          expect(error).toBe(errorEvent);
          done();
        }
      });

      const req = httpTestingController.expectOne(heroService.heroesUrl);

      // Respond with mock error
      req.error(errorEvent);
    });
  });

  // TODO: test other HeroService methods
});
