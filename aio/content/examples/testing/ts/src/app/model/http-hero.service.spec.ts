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

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/toPromise';

import { Hero } from './hero';
import { HttpHeroService as HeroService } from './http-hero.service';

const makeHeroData = () => [
  { id: 1, name: 'Windstorm' },
  { id: 2, name: 'Bombasto' },
  { id: 3, name: 'Magneta' },
  { id: 4, name: 'Tornado' }
] as Hero[];

////////  Tests  /////////////
describe('Http-HeroService (mockBackend)', () => {

  beforeEach( async(() => {
    TestBed.configureTestingModule({
      imports: [ HttpModule ],
      providers: [
        HeroService,
        { provide: XHRBackend, useClass: MockBackend }
      ]
    })
    .compileComponents();
  }));

  it('can instantiate service when inject service',
    inject([HeroService], (service: HeroService) => {
      expect(service instanceof HeroService).toBe(true);
  }));



  it('can instantiate service with "new"', inject([Http], (http: Http) => {
    expect(http).not.toBeNull('http should be provided');
    let service = new HeroService(http);
    expect(service instanceof HeroService).toBe(true, 'new service should be ok');
  }));


  it('can provide the mockBackend as XHRBackend',
    inject([XHRBackend], (backend: MockBackend) => {
      expect(backend).not.toBeNull('backend should be provided');
  }));

  describe('when getHeroes', () => {
      let backend: MockBackend;
      let service: HeroService;
      let fakeHeroes: Hero[];
      let response: Response;

      beforeEach(inject([Http, XHRBackend], (http: Http, be: MockBackend) => {
        backend = be;
        service = new HeroService(http);
        fakeHeroes = makeHeroData();
        let options = new ResponseOptions({status: 200, body: {data: fakeHeroes}});
        response = new Response(options);
      }));

      it('should have expected fake heroes (then)', async(inject([], () => {
        backend.connections.subscribe((c: MockConnection) => c.mockRespond(response));

        service.getHeroes().toPromise()
        // .then(() => Promise.reject('deliberate'))
          .then(heroes => {
            expect(heroes.length).toBe(fakeHeroes.length,
              'should have expected no. of heroes');
          });
      })));

      it('should have expected fake heroes (Observable.do)', async(inject([], () => {
        backend.connections.subscribe((c: MockConnection) => c.mockRespond(response));

        service.getHeroes()
          .do(heroes => {
            expect(heroes.length).toBe(fakeHeroes.length,
              'should have expected no. of heroes');
          })
          .toPromise();
      })));


      it('should be OK returning no heroes', async(inject([], () => {
        let resp = new Response(new ResponseOptions({status: 200, body: {data: []}}));
        backend.connections.subscribe((c: MockConnection) => c.mockRespond(resp));

        service.getHeroes()
          .do(heroes => {
            expect(heroes.length).toBe(0, 'should have no heroes');
          })
          .toPromise();
      })));

      it('should treat 404 as an Observable error', async(inject([], () => {
        let resp = new Response(new ResponseOptions({status: 404}));
        backend.connections.subscribe((c: MockConnection) => c.mockRespond(resp));

        service.getHeroes()
          .do(heroes => {
            fail('should not respond with heroes');
          })
          .catch(err => {
            expect(err).toMatch(/Bad response status/, 'should catch bad response status code');
            return Observable.of(null); // failure is the expected test result
          })
          .toPromise();
      })));
  });
});
