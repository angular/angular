/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';
import {HttpBackend, HttpRequest, HttpResponse} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import {ReplaySubject} from 'rxjs/ReplaySubject';
import {Subject} from 'rxjs/Subject';

export class MockRequest {
  private _cancelled: Promise<void>;
  private _resolveCancelled: Function;

  /**
   * @internal
   */
  _resolved: boolean;

  /**
   * @internal
   */
  _response = new ReplaySubject<HttpResponse>();

  constructor(private _request: HttpRequest) {
    this._cancelled = new Promise<void>(resolve => this._resolveCancelled = resolve);
  }

  /**
   * The actual {@link HttpRequest} that was made.
   */
  get request(): HttpRequest { return this._request; }

  /**
   * A `Promise` that resolves if this request is cancelled.
   */
  get cancelled(): Promise<void> { return this._cancelled; }

  /**
   * Respond to the request with an {@link HttpResponse}.
   */
  respond(response: HttpResponse) {
    this._resolved = true;
    if (response.ok) {
      this._response.next(response);
      this._response.complete();
    } else {
      this._response.error(this._response);
    }
  }

  /**
   * @internal
   */
  _cancel(): void {
    this._resolveCancelled();
    this._resolved = true;
  }
}

/**
 * A mock backend for testing the {@link Http} service.
 *
 * This class can be injected in tests, and should be used to override providers
 * to other backends, such as {@link XHRBackend}.
 *
 * ### Example
 *
 * ```typescript
 * import {Injectable} from '@angular/core';
 * import {async, fakeAsync, tick} from '@angular/core/testing';
 * import {Http} from '@angular/http';
 * import {MockBackend, MockRequest} from '@angular/http/testing';
 *
 * const HERO_ONE = 'HeroNrOne';
 * const HERO_TWO = 'WillBeAlwaysTheSecond';
 *
 * @Injectable()
 * class HeroService {
 *   constructor(private http: Http) {}
 *
 *   getHeroes(): Observable<String[]> {
 *     return this.http.jsonGet('myservices.de/api/heroes')
 *         .toPromise()
 *         .then(json => json.data)
 *         .catch(e => this.handleError(e));
 *   }
 *
 *   private handleError(error: any): Promise<any> {
 *     console.error('An error occurred', error);
 *     return Promise.reject(error.message || error);
 *   }
 * }
 *
 * describe('MockBackend HeroService Example', () => {
 *   let backend: MockBackend;
 *   let service: HeroService;
 *   let lastReq: MockRequest;
 *   beforeEach(() => {
 *     backend = new MockBackend();
 *     service = new HeroService(new Http(backend));
 *     backend.mockRequests.subscribe(mock => lastReq = mock);
 *   });
 *
 *   it('getHeroes() should query current service url', () => {
 *     this.heroService.getHeroes();
 *     expect(lastReq).toBeDefined('no http service connection at all?');
 *     expect(lastReq.request.url).toMatch(/api\/heroes$/, 'url invalid');
 *   });
 *
 *   it('getHeroes() should return some heroes', fakeAsync(() => {
 *        let result: String[];
 *        this.heroService.getHeroes().then((heroes: String[]) => result = heroes);
 *        lastReq.respond(new HttpResponse({
 *          body: JSON.stringify({data: [HERO_ONE, HERO_TWO]}),
 *        }));
 *        tick();
 *        expect(result.length).toEqual(2, 'should contain given amount of heroes');
 *        expect(result[0]).toEqual(HERO_ONE, ' HERO_ONE should be the first hero');
 *        expect(result[1]).toEqual(HERO_TWO, ' HERO_TWO should be the second hero');
 *      }));
 *
 *   it('getHeroes() while server is down', fakeAsync(() => {
 *        let result: String[];
 *        let catchedError: any;
 *        this.heroService.getHeroes()
 *            .then((heroes: String[]) => result = heroes)
 *            .catch((error: any) => catchedError = error);
 *        mockReq.mockRespond(new HttpResponse({
 *          status: 404,
 *          statusText: 'URL not Found',
 *        }));
 *        tick();
 *        expect(result).toBeUndefined();
 *        expect(catchedError).toBeDefined();
 *      }));
 * });
 * ```
 *
 * This method only exists in the mock implementation, not in real Backends.
 */
@Injectable()
export class MockBackend implements HttpBackend {
  /**
   * `Observable` of {@link MockRequest}s representing requests which have been
   * received by this backend. Can be subscribed to in order to respond to requests.
   *
   * ### Example
   *
   * ```typescript
   * import {fakeAsync, tick} from '@angular/core/testing';
   * import {Http, RequestOptions} from '@angular/http';
   * import {Response, ResponseOptions} from '@angular/http';
   * import {MockBackend, MockRequest} from '@angular/http/testing';
   *
   * it('should get a response', fakeAsync(() => {
   *      let req: MockRequest; // this will be captured by MockBackend.
   *      let text: string;     // this will be set from mock response
   *      let backend = new MockBackend();
   *      let http = new Http(backend);
   *      backend.mockRequests.subscribe(mock => req = mock);
   *      http.request('something.json').mergeMap(res => res.text()).subscribe(body => text = body);
   *      tick();
   *      connection.respond(new HttpResponse({body: 'Something'}));
   *      tick();
   *      expect(text).toBe('Something');
   *    }));
   * ```
   *
   * This property only exists in the mock implementation, not in real Backends.
   */
  mockRequests: Subject<MockRequest>;  //<MockConnection>

  /**
   * An array representation of `connections`. This array will be updated with each connection that
   * is created by this backend.
   *
   * This property only exists in the mock implementation, not in real Backends.
   */
  mockRequestsArray: MockRequest[];

  constructor() {
    this.mockRequestsArray = [];
    this.mockRequests = new Subject();
  }

  /**
   * Checks all connections, and raises an exception if any connection has not received a response.
   *
   * This method only exists in the mock implementation, not in real Backends.
   */
  verifyNoPendingRequests(): void {
    const pending = this.mockRequestsArray.filter(req => !req._resolved);
    if (pending.length > 0) {
      throw new Error(`${pending} pending connections to be resolved`);
    }
  }

  /**
   * Can be used in conjunction with `verifyNoPendingRequests` to resolve any not-yet-resolve
   * connections, if it's expected that there are connections that have not yet received a response.
   *
   * This method only exists in the mock implementation, not in real Backends.
   */
  resolveAllConnections(): void {
    this.mockRequestsArray.filter(req => !req._resolved)
        .forEach(req => req.respond(new HttpResponse({status: 204})));
  }

  handle(req: HttpRequest): Observable<HttpResponse> {
    const mockReq = new MockRequest(req);
    this.mockRequestsArray.push(mockReq);
    this.mockRequests.next(mockReq);
    return new Observable<HttpResponse>((observer: Observer<HttpResponse>) => {
      const sub = mockReq._response.subscribe(observer);
      return () => {
        sub.unsubscribe();
        mockReq._cancel();
      };
    });
  }
}
