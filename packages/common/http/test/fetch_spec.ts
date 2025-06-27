/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HttpEvent, HttpEventType, HttpRequest, HttpResponse} from '../index';
import {TestBed} from '@angular/core/testing';
import {Observable, of, Subject} from 'rxjs';
import {catchError, retry, scan, skip, take, toArray} from 'rxjs/operators';

import {
  HttpClient,
  HttpDownloadProgressEvent,
  HttpErrorResponse,
  HttpHeaderResponse,
  HttpParams,
  HttpStatusCode,
  provideHttpClient,
  withFetch,
} from '../public_api';
import {FetchBackend, FetchFactory} from '../src/fetch';

function trackEvents(obs: Observable<any>): Promise<any[]> {
  return obs
    .pipe(
      // We don't want the promise to fail on HttpErrorResponse
      catchError((e) => of(e)),
      scan((acc, event) => {
        acc.push(event);
        return acc;
      }, [] as any[]),
    )
    .toPromise() as Promise<any[]>;
}

const TEST_POST = new HttpRequest('POST', '/test', 'some body', {
  responseType: 'text',
  timeout: 1000,
});

const TEST_POST_WITH_JSON_BODY = new HttpRequest(
  'POST',
  '/test',
  {'some': 'body'},
  {
    responseType: 'text',
  },
);

const XSSI_PREFIX = ")]}'\n";

describe('FetchBackend', async () => {
  let fetchMock: MockFetchFactory = null!;
  let backend: FetchBackend = null!;
  let fetchSpy: jasmine.Spy<typeof fetch>;

  function callFetchAndFlush(req: HttpRequest<any>): void {
    backend.handle(req).pipe(take(1)).subscribe();
    fetchMock.mockFlush(HttpStatusCode.Ok, 'OK', 'some response');
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{provide: FetchFactory, useClass: MockFetchFactory}, FetchBackend],
    });

    fetchMock = TestBed.inject(FetchFactory) as MockFetchFactory;
    fetchSpy = spyOn(fetchMock, 'fetch').and.callThrough();
    backend = TestBed.inject(FetchBackend);
  });

  it('emits status immediately', () => {
    let event!: HttpEvent<any>;
    // subscribe is sync
    backend
      .handle(TEST_POST)
      .pipe(take(1))
      .subscribe((e) => (event = e));
    fetchMock.mockFlush(HttpStatusCode.Ok, 'OK', 'some response');
    expect(event.type).toBe(HttpEventType.Sent);
  });

  it('should not call fetch without a subscribe', () => {
    const handle = backend.handle(TEST_POST);
    expect(fetchSpy).not.toHaveBeenCalled();
    handle.subscribe();
    fetchMock.mockFlush(HttpStatusCode.Ok, 'OK', 'some response');
    expect(fetchSpy).toHaveBeenCalled();
  });

  it('should be able to retry', (done) => {
    const handle = backend.handle(TEST_POST);
    // Skipping both HttpSentEvent (from the 1st subscription + retry)
    handle.pipe(retry(1), skip(2)).subscribe((response) => {
      expect(response.type).toBe(HttpEventType.Response);
      expect((response as HttpResponse<any>).body).toBe('some response');
      done();
    });
    fetchMock.mockErrorEvent('Error 1');
    fetchMock.resetFetchPromise();

    fetchMock.mockFlush(HttpStatusCode.Ok, 'OK', 'some response');
  });

  it('sets method, url, and responseType correctly', () => {
    callFetchAndFlush(TEST_POST);
    expect(fetchMock.request.method).toBe('POST');
    expect(fetchMock.request.url).toBe('/test');
  });

  it('use query params from request', () => {
    const requestWithQuery = new HttpRequest('GET', '/test', 'some body', {
      params: new HttpParams({fromObject: {query: 'foobar'}}),
      responseType: 'text',
    });
    callFetchAndFlush(requestWithQuery);
    expect(fetchMock.request.method).toBe('GET');
    expect(fetchMock.request.url).toBe('/test?query=foobar');
  });

  it('sets outgoing body correctly', () => {
    callFetchAndFlush(TEST_POST);
    expect(fetchMock.request.body).toBe('some body');
  });

  it('sets outgoing body correctly when request payload is json', () => {
    callFetchAndFlush(TEST_POST_WITH_JSON_BODY);
    expect(fetchMock.request.body).toBe('{"some":"body"}');
  });

  it('sets outgoing headers, including default headers', () => {
    const post = TEST_POST.clone({
      setHeaders: {
        'Test': 'Test header',
      },
    });
    callFetchAndFlush(post);
    expect(fetchMock.request.headers).toEqual({
      'Test': 'Test header',
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'text/plain',
    });
  });

  it('sets outgoing headers, including overriding defaults', () => {
    const setHeaders = {
      'Test': 'Test header',
      'Accept': 'text/html',
      'Content-Type': 'text/css',
    };
    callFetchAndFlush(TEST_POST.clone({setHeaders}));
    expect(fetchMock.request.headers).toEqual(setHeaders);
  });

  it('should be case insensitive for Content-Type & Accept', () => {
    const setHeaders = {
      'accept': 'text/html',
      'content-type': 'text/css',
    };
    callFetchAndFlush(TEST_POST.clone({setHeaders}));
    expect(fetchMock.request.headers).toEqual(setHeaders);
  });

  it('passes withCredentials through', () => {
    callFetchAndFlush(TEST_POST.clone({withCredentials: true}));
    expect(fetchMock.request.credentials).toBe('include');
  });

  it('handles a text response', async () => {
    const promise = trackEvents(backend.handle(TEST_POST));
    fetchMock.mockFlush(HttpStatusCode.Ok, 'OK', 'some response');
    const events = await promise;
    expect(events.length).toBe(2);
    expect(events[1].type).toBe(HttpEventType.Response);
    expect(events[1] instanceof HttpResponse).toBeTruthy();
    const res = events[1] as HttpResponse<string>;
    expect(res.body).toBe('some response');
    expect(res.status).toBe(HttpStatusCode.Ok);
    expect(res.statusText).toBe('OK');
  });

  it('handles a json response', async () => {
    const promise = trackEvents(backend.handle(TEST_POST.clone({responseType: 'json'})));
    fetchMock.mockFlush(HttpStatusCode.Ok, 'OK', JSON.stringify({data: 'some data'}));
    const events = await promise;
    expect(events.length).toBe(2);
    const res = events[1] as HttpResponse<{data: string}>;
    expect(res.body!.data).toBe('some data');
  });

  it('handles a blank json response', async () => {
    const promise = trackEvents(backend.handle(TEST_POST.clone({responseType: 'json'})));
    fetchMock.mockFlush(HttpStatusCode.Ok, 'OK', '');
    const events = await promise;
    expect(events.length).toBe(2);
    const res = events[1] as HttpResponse<{data: string}>;
    expect(res.body).toBeNull();
  });

  it('handles a json error response', async () => {
    const promise = trackEvents(backend.handle(TEST_POST.clone({responseType: 'json'})));
    fetchMock.mockFlush(
      HttpStatusCode.InternalServerError,
      'Error',
      JSON.stringify({data: 'some data'}),
    );
    const events = await promise;
    expect(events.length).toBe(2);
    const res = events[1] as any as HttpErrorResponse;
    expect(res.error.data).toBe('some data');
  });

  it('handles a json error response with XSSI prefix', async () => {
    const promise = trackEvents(backend.handle(TEST_POST.clone({responseType: 'json'})));
    fetchMock.mockFlush(
      HttpStatusCode.InternalServerError,
      'Error',
      XSSI_PREFIX + JSON.stringify({data: 'some data'}),
    );
    const events = await promise;
    expect(events.length).toBe(2);
    const res = events[1] as any as HttpErrorResponse;
    expect(res.error.data).toBe('some data');
  });

  it('handles a json string response', async () => {
    const promise = trackEvents(backend.handle(TEST_POST.clone({responseType: 'json'})));
    fetchMock.mockFlush(HttpStatusCode.Ok, 'OK', JSON.stringify('this is a string'));
    const events = await promise;
    expect(events.length).toBe(2);
    const res = events[1] as HttpResponse<string>;
    expect(res.body).toEqual('this is a string');
  });

  it('handles a json response with an XSSI prefix', async () => {
    const promise = trackEvents(backend.handle(TEST_POST.clone({responseType: 'json'})));
    fetchMock.mockFlush(HttpStatusCode.Ok, 'OK', XSSI_PREFIX + JSON.stringify({data: 'some data'}));
    const events = await promise;
    expect(events.length).toBe(2);
    const res = events[1] as HttpResponse<{data: string}>;
    expect(res.body!.data).toBe('some data');
  });

  it('handles a blob with a mime type', async () => {
    const promise = trackEvents(backend.handle(TEST_POST.clone({responseType: 'blob'})));
    const type = 'application/pdf';
    fetchMock.mockFlush(HttpStatusCode.Ok, 'OK', new Blob(), {'Content-Type': type});
    const events = await promise;
    expect(events.length).toBe(2);
    const res = events[1] as HttpResponse<Blob>;
    expect(res.body?.type).toBe(type);
  });

  it('emits unsuccessful responses via the error path', (done) => {
    backend.handle(TEST_POST).subscribe({
      error: (err: HttpErrorResponse) => {
        expect(err instanceof HttpErrorResponse).toBe(true);
        expect(err.error).toBe('this is the error');
        done();
      },
    });
    fetchMock.mockFlush(HttpStatusCode.BadRequest, 'Bad Request', 'this is the error');
  });

  it('emits real errors via the error path', (done) => {
    // Skipping the HttpEventType.Sent that is sent first
    backend
      .handle(TEST_POST)
      .pipe(skip(1))
      .subscribe({
        error: (err: HttpErrorResponse) => {
          expect(err instanceof HttpErrorResponse).toBe(true);
          expect(err.error instanceof Error).toBeTrue();
          expect(err.url).toBe('/test');
          done();
        },
      });
    fetchMock.mockErrorEvent(new Error('blah'));
  });

  it('emits an error when browser cancels a request', (done) => {
    backend.handle(TEST_POST).subscribe({
      error: (err: HttpErrorResponse) => {
        expect(err instanceof HttpErrorResponse).toBe(true);
        expect(err.error instanceof DOMException).toBeTrue();
        expect((err.error as DOMException).name).toBe('AbortError');
        done();
      },
    });
    fetchMock.mockAbortEvent();
  });

  it('should pass keepalive option to fetch', () => {
    const req = new HttpRequest('GET', '/test', {keepalive: true});
    backend.handle(req).subscribe();

    expect(fetchSpy).toHaveBeenCalledWith(
      '/test',
      jasmine.objectContaining({
        keepalive: true,
      }),
    );

    fetchMock.mockFlush(HttpStatusCode.Ok, 'OK');
  });

  it('should pass priority option to fetch', () => {
    const req = new HttpRequest('GET', '/test', {priority: 'high'});
    backend.handle(req).subscribe();

    expect(fetchSpy).toHaveBeenCalledWith(
      '/test',
      jasmine.objectContaining({
        priority: 'high',
      }),
    );

    fetchMock.mockFlush(HttpStatusCode.Ok, 'OK');
  });

  it('should pass cache option to fetch', () => {
    const req = new HttpRequest('GET', '/test', {cache: 'only-if-cached'});
    backend.handle(req).subscribe();

    expect(fetchSpy).toHaveBeenCalledWith(
      '/test',
      jasmine.objectContaining({
        cache: 'only-if-cached',
      }),
    );
    fetchMock.mockFlush(HttpStatusCode.Ok, 'OK');
  });

  it('emits an error when a request times out', (done) => {
    backend.handle(TEST_POST).subscribe({
      error: (err: HttpErrorResponse) => {
        expect(err instanceof HttpErrorResponse).toBe(true);
        expect(err.error instanceof DOMException).toBeTrue();
        expect((err.error as DOMException).name).toBe('TimeoutError');
        done();
      },
    });
    fetchMock.mockTimeoutEvent();
  });

  it('should pass mode option to fetch', () => {
    const req = new HttpRequest('GET', '/test', {mode: 'cors'});
    backend.handle(req).subscribe();

    expect(fetchSpy).toHaveBeenCalledWith(
      '/test',
      jasmine.objectContaining({
        mode: 'cors',
      }),
    );

    fetchMock.mockFlush(HttpStatusCode.Ok, 'OK');
  });

  it('should pass redirect option to fetch', () => {
    const req = new HttpRequest('GET', '/test', {redirect: 'follow'});
    backend.handle(req).subscribe();

    expect(fetchSpy).toHaveBeenCalledWith(
      '/test',
      jasmine.objectContaining({
        redirect: 'follow',
      }),
    );

    fetchMock.mockFlush(HttpStatusCode.Ok, 'OK');
  });

  describe('progress events', () => {
    it('are emitted for download progress', (done) => {
      backend
        .handle(TEST_POST.clone({reportProgress: true}))
        .pipe(toArray())
        .subscribe((events) => {
          expect(events.map((event) => event.type)).toEqual([
            HttpEventType.Sent,
            HttpEventType.ResponseHeader,
            HttpEventType.DownloadProgress,
            HttpEventType.DownloadProgress,
            HttpEventType.DownloadProgress,
            HttpEventType.Response,
          ]);
          const [progress1, progress2, response] = [
            events[2] as HttpDownloadProgressEvent,
            events[3] as HttpDownloadProgressEvent,
            events[5] as HttpResponse<string>,
          ];
          expect(progress1.partialText).toBe('down');
          expect(progress1.loaded).toBe(4);
          expect(progress1.total).toBe(10);
          expect(progress2.partialText).toBe('download');
          expect(progress2.loaded).toBe(8);
          expect(progress2.total).toBe(10);
          expect(response.body).toBe('downloaded');
          done();
        });
      fetchMock.mockProgressEvent(4);
      fetchMock.mockProgressEvent(8);
      fetchMock.mockFlush(HttpStatusCode.Ok, 'OK', 'downloaded');
    });

    it('include ResponseHeader with headers and status', (done) => {
      backend
        .handle(TEST_POST.clone({reportProgress: true}))
        .pipe(toArray())
        .subscribe((events) => {
          expect(events.map((event) => event.type)).toEqual([
            HttpEventType.Sent,
            HttpEventType.ResponseHeader,
            HttpEventType.DownloadProgress,
            HttpEventType.DownloadProgress,
            HttpEventType.Response,
          ]);
          const partial = events[1] as HttpHeaderResponse;
          expect(partial.type).toEqual(HttpEventType.ResponseHeader);
          expect(partial.headers.get('Content-Type')).toEqual('text/plain');
          expect(partial.headers.get('Test')).toEqual('Test header');
          done();
        });
      fetchMock.response.headers = {'Test': 'Test header', 'Content-Type': 'text/plain'};
      fetchMock.mockProgressEvent(200);
      fetchMock.mockFlush(HttpStatusCode.Ok, 'OK', 'Done');
    });
  });
  describe('gets response URL', async () => {
    it('from the response URL', (done) => {
      backend
        .handle(TEST_POST)
        .pipe(toArray())
        .subscribe((events) => {
          expect(events.length).toBe(2);
          expect(events[1].type).toBe(HttpEventType.Response);
          const response = events[1] as HttpResponse<string>;
          expect(response.url).toBe('/response/url');
          done();
        });
      fetchMock.response.url = '/response/url';
      fetchMock.mockFlush(HttpStatusCode.Ok, 'OK', 'Test');
    });

    it('from X-Request-URL header if the response URL is not present', (done) => {
      backend
        .handle(TEST_POST)
        .pipe(toArray())
        .subscribe((events) => {
          expect(events.length).toBe(2);
          expect(events[1].type).toBe(HttpEventType.Response);
          const response = events[1] as HttpResponse<string>;
          expect(response.url).toBe('/response/url');
          done();
        });
      fetchMock.response.headers = {'X-Request-URL': '/response/url'};
      fetchMock.mockFlush(HttpStatusCode.Ok, 'OK', 'Test');
    });

    it('falls back on Request.url if neither are available', (done) => {
      backend
        .handle(TEST_POST)
        .pipe(toArray())
        .subscribe((events) => {
          expect(events.length).toBe(2);
          expect(events[1].type).toBe(HttpEventType.Response);
          const response = events[1] as HttpResponse<string>;
          expect(response.url).toBe('/test');
          done();
        });
      fetchMock.mockFlush(HttpStatusCode.Ok, 'OK', 'Test');
    });
  });
  describe('corrects for quirks', async () => {
    it('by normalizing 0 status to 200 if a body is present', (done) => {
      backend
        .handle(TEST_POST)
        .pipe(toArray())
        .subscribe((events) => {
          expect(events.length).toBe(2);
          expect(events[1].type).toBe(HttpEventType.Response);
          const response = events[1] as HttpResponse<string>;
          expect(response.status).toBe(HttpStatusCode.Ok);
          done();
        });
      fetchMock.mockFlush(0, 'CORS 0 status', 'Test');
    });
    it('by leaving 0 status as 0 if a body is not present', (done) => {
      backend
        .handle(TEST_POST)
        .pipe(toArray())
        .subscribe({
          error: (error: HttpErrorResponse) => {
            expect(error.status).toBe(0);
            done();
          },
        });
      fetchMock.mockFlush(0, 'CORS 0 status');
    });
  });

  describe('dynamic global fetch', () => {
    beforeEach(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [provideHttpClient(withFetch())],
      });
    });

    it('should use the current implementation of the global fetch', async () => {
      const originalFetch = globalThis.fetch;

      try {
        const fakeFetch = jasmine
          .createSpy('', () => Promise.resolve(new Response(JSON.stringify({foo: 'bar'}))))
          .and.callThrough();
        globalThis.fetch = fakeFetch;

        const client = TestBed.inject(HttpClient);
        expect(fakeFetch).not.toHaveBeenCalled();
        let response = await client.get<unknown>('').toPromise();
        expect(fakeFetch).toHaveBeenCalled();
        expect(response).toEqual({foo: 'bar'});

        // We dynamicaly change the implementation of fetch
        const fakeFetch2 = jasmine
          .createSpy('', () => Promise.resolve(new Response(JSON.stringify({foo: 'baz'}))))
          .and.callThrough();
        globalThis.fetch = fakeFetch2;
        response = await client.get<unknown>('').toPromise();
        expect(response).toEqual({foo: 'baz'});
      } finally {
        // We need to restore the original fetch implementation, else the tests might become flaky
        globalThis.fetch = originalFetch;
      }
    });
  });
});

export class MockFetchFactory extends FetchFactory {
  public readonly response = new MockFetchResponse();
  public readonly request = new MockFetchRequest();
  private resolve!: Function;
  private reject!: Function;

  private clearWarningTimeout?: VoidFunction;

  private promise = new Promise<Response>((resolve, reject) => {
    this.resolve = resolve;
    this.reject = reject;
  });

  override fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    this.request.method = init?.method;
    this.request.url = input;
    this.request.body = init?.body;
    this.request.headers = init?.headers;
    this.request.credentials = init?.credentials;

    if (init?.signal) {
      init?.signal.addEventListener('abort', () => {
        this.reject();
        this.clearWarningTimeout?.();
      });
    }

    // Fetch uses a Macrotask to keep the NgZone unstable during the fetch
    // If the promise is not resolved/rejected the unit will succeed but the test suite will
    // fail with a timeout
    const timeoutId = setTimeout(() => {
      console.error('*********  You forgot to resolve/reject the promise ********* ');
      this.reject();
    }, 5000);
    this.clearWarningTimeout = () => clearTimeout(timeoutId);

    return this.promise;
  };

  mockFlush(
    status: number,
    statusText: string,
    body?: string | Blob,
    headers?: Record<string, string>,
  ): void {
    this.clearWarningTimeout?.();
    if (typeof body === 'string') {
      this.response.setupBodyStream(body);
    } else {
      this.response.setBody(body);
    }
    const response = new Response(this.response.stream, {
      statusText,
      headers: {...this.response.headers, ...(headers ?? {})},
    });

    // Have to be set outside the constructor because it might throw
    // RangeError: init["status"] must be in the range of 200 to 599, inclusive
    Object.defineProperty(response, 'status', {value: status});

    if (this.response.url) {
      // url is readonly
      Object.defineProperty(response, 'url', {value: this.response.url});
    }
    this.resolve(response);
  }

  mockProgressEvent(loaded: number): void {
    this.response.progress.push(loaded);
  }

  mockErrorEvent(error: any) {
    this.reject(error);
  }

  mockAbortEvent() {
    this.reject(new DOMException('', 'AbortError'));
  }

  mockTimeoutEvent() {
    this.reject(new DOMException('', 'TimeoutError'));
  }

  resetFetchPromise() {
    this.promise = new Promise<Response>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

class MockFetchRequest {
  public url!: RequestInfo | URL;
  public method?: string;
  public body: any;
  public credentials?: RequestCredentials;
  public headers?: HeadersInit;
}

class MockFetchResponse {
  public url?: string;
  public headers: Record<string, string> = {};

  public progress: number[] = [];

  private sub$ = new Subject<any>();
  public stream = new ReadableStream({
    start: (controller) => {
      this.sub$.subscribe({
        next: (val) => {
          controller.enqueue(new TextEncoder().encode(val));
        },
        complete: () => {
          controller.close();
        },
      });
    },
  });

  public setBody(body: any) {
    this.sub$.next(body);
    this.sub$.complete();
  }

  public setupBodyStream(body?: string) {
    if (body && this.progress.length) {
      this.headers['content-length'] = `${body.length}`;
      let shift = 0;
      this.progress.forEach((loaded) => {
        this.sub$.next(body.substring(shift, loaded));
        shift = loaded;
      });
      this.sub$.next(body.substring(shift, body.length));
    } else {
      this.sub$.next(body);
    }

    this.sub$.complete();
  }
}
