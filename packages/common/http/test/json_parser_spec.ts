/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '@angular/core/testing';
import {XhrFactory} from '../../index';
import {HttpJsonParser} from '../src/json_parser';
import {HttpRequest} from '../src/request';
import {HttpEventType, HttpJsonParseError} from '../src/response';
import {HttpXhrBackend} from '../src/xhr';
import {FetchBackend, FetchFactory} from '../src/fetch';
import {MockXhrFactory} from './xhr_mock';
import {provideHttpClient, withJsonParser, withFetch} from '../src/provider';

class CustomJsonParser implements HttpJsonParser {
  parse(text: string): any {
    const data = JSON.parse(text);
    data.custom = true;
    return data;
  }
}

export class MockFetchFactory extends FetchFactory {
  private lastResolve: (res: Response) => void = null!;
  override fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    return new Promise((resolve) => {
      this.lastResolve = resolve;
    });
  };

  mockFlush(
    status: number,
    statusText: string,
    body: string,
    headers: Record<string, string> = {},
  ) {
    this.lastResolve({
      status,
      statusText,
      headers: new Headers(headers),
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(body));
          controller.close();
        },
      }),
      url: '/test',
      ok: status >= 200 && status < 300,
    } as Response);
  }
}

describe('HttpJsonParser', () => {
  describe('HttpXhrBackend', () => {
    let factory: MockXhrFactory = null!;
    let backend: HttpXhrBackend = null!;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(withJsonParser(CustomJsonParser)),
          {provide: XhrFactory, useClass: MockXhrFactory},
        ],
      });
      factory = TestBed.inject(XhrFactory) as MockXhrFactory;
      backend = TestBed.inject(HttpXhrBackend);
    });

    it('uses the custom JSON parser', (done) => {
      const req = new HttpRequest('GET', '/test', {responseType: 'json'});
      backend.handle(req).subscribe((event) => {
        if (event.type === HttpEventType.Response) {
          expect(event.body).toEqual({data: 'test', custom: true});
          done();
        }
      });
      factory.mock.mockFlush(200, 'OK', '{"data": "test"}');
    });

    it('strips XSSI prefix before calling the custom parser', (done) => {
      const req = new HttpRequest('GET', '/test', {responseType: 'json'});
      backend.handle(req).subscribe((event) => {
        if (event.type === HttpEventType.Response) {
          expect(event.body).toEqual({data: 'test', custom: true});
          done();
        }
      });
      factory.mock.mockFlush(200, 'OK', ")]}',\n" + '{"data": "test"}');
    });

    it('returns null for empty response body', (done) => {
      const req = new HttpRequest('GET', '/test', {responseType: 'json'});
      backend.handle(req).subscribe((event) => {
        if (event.type === HttpEventType.Response) {
          expect(event.body).toBeNull();
          done();
        }
      });
      factory.mock.mockFlush(200, 'OK', '');
    });

    it('handles parsing errors by returning an HttpErrorResponse with HttpJsonParseError', (done) => {
      const req = new HttpRequest('GET', '/test', {responseType: 'json'});
      backend.handle(req).subscribe({
        error: (error) => {
          expect(error.error.text).toBe('invalid json');
          expect(error.error.error instanceof SyntaxError).toBeTrue();
          done();
        },
      });
      factory.mock.mockFlush(200, 'OK', 'invalid json');
    });
  });

  describe('FetchBackend', () => {
    let factory: MockFetchFactory = null!;
    let backend: FetchBackend = null!;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(withFetch(), withJsonParser(CustomJsonParser)),
          {provide: FetchFactory, useClass: MockFetchFactory},
        ],
      });
      factory = TestBed.inject(FetchFactory) as MockFetchFactory;
      backend = TestBed.inject(FetchBackend);
    });

    it('uses the custom JSON parser', (done) => {
      const req = new HttpRequest('GET', '/test', {responseType: 'json'});
      backend.handle(req).subscribe((event) => {
        if (event.type === HttpEventType.Response) {
          expect(event.body).toEqual({data: 'test', custom: true});
          done();
        }
      });
      factory.mockFlush(200, 'OK', '{"data": "test"}');
    });

    it('strips XSSI prefix before calling the custom parser', (done) => {
      const req = new HttpRequest('GET', '/test', {responseType: 'json'});
      backend.handle(req).subscribe((event) => {
        if (event.type === HttpEventType.Response) {
          expect(event.body).toEqual({data: 'test', custom: true});
          done();
        }
      });
      factory.mockFlush(200, 'OK', ")]}',\n" + '{"data": "test"}');
    });

    it('returns null for empty response body', (done) => {
      const req = new HttpRequest('GET', '/test', {responseType: 'json'});
      backend.handle(req).subscribe((event) => {
        if (event.type === HttpEventType.Response) {
          expect(event.body).toBeNull();
          done();
        }
      });
      factory.mockFlush(200, 'OK', '');
    });

    it('handles parsing errors by returning an HttpErrorResponse with HttpJsonParseError', (done) => {
      const req = new HttpRequest('GET', '/test', {responseType: 'json'});
      backend.handle(req).subscribe({
        error: (error) => {
          expect(error.error.text).toBe('invalid json');
          expect(error.error.error instanceof SyntaxError).toBeTrue();
          done();
        },
      });
      factory.mockFlush(200, 'OK', 'invalid json');
    });
  });
});
