/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HttpClient, HttpRequest, HttpErrorResponse} from '../../index';
import {HttpClientTestingBackend} from '../../testing/src/backend';
import {TestRequest} from '../src/request';
import {isBrowser} from '@angular/private/testing';
import {Observer} from 'rxjs';

describe('HttpClient TestRequest', () => {
  it('accepts a null body', () => {
    const mock = new HttpClientTestingBackend();
    const client = new HttpClient(mock);

    let resp: any;
    client.post('/some-url', {test: 'test'}).subscribe((body) => {
      resp = body;
    });

    const req = mock.expectOne('/some-url');
    req.flush(null);

    expect(resp).toBeNull();
  });

  it('throws if no request matches', () => {
    const mock = new HttpClientTestingBackend();
    const client = new HttpClient(mock);

    let resp: any;
    client.get('/some-other-url').subscribe((body) => {
      resp = body;
    });

    try {
      // expect different URL
      mock.expectOne('/some-url').flush(null);
      fail();
    } catch (error) {
      expect((error as Error).message).toBe(
        'Expected one matching request for criteria "Match URL: /some-url", found none.' +
          ' Requests received are: GET /some-other-url.',
      );
    }
  });

  it('throws if no request matches the exact parameters', () => {
    const mock = new HttpClientTestingBackend();
    const client = new HttpClient(mock);

    let resp: any;
    const params = {query: 'hello'};
    client.get('/some-url', {params}).subscribe((body) => {
      resp = body;
    });

    try {
      // expect different query parameters
      mock.expectOne('/some-url?query=world').flush(null);
      fail();
    } catch (error) {
      expect((error as Error).message).toBe(
        'Expected one matching request for criteria "Match URL: /some-url?query=world", found none.' +
          ' Requests received are: GET /some-url?query=hello.',
      );
    }
  });

  it('throws if no request matches with several requests received', () => {
    const mock = new HttpClientTestingBackend();
    const client = new HttpClient(mock);

    let resp: any;
    client.get('/some-other-url?query=world').subscribe((body) => {
      resp = body;
    });
    client.post('/and-another-url', {}).subscribe((body) => {
      resp = body;
    });

    try {
      // expect different URL
      mock.expectOne('/some-url').flush(null);
      fail();
    } catch (error) {
      expect((error as Error).message).toBe(
        'Expected one matching request for criteria "Match URL: /some-url", found none.' +
          ' Requests received are: GET /some-other-url?query=world, POST /and-another-url.',
      );
    }
  });

  it('throws if there are open requests when verify is called', () => {
    const mock = new HttpClientTestingBackend();
    const client = new HttpClient(mock);

    client.get('/some-other-url?query=world').subscribe();
    client.post('/and-another-url', {}).subscribe();

    try {
      mock.verify();
      fail();
    } catch (error) {
      expect((error as any).message).toBe(
        'Expected no open requests, found 2:' +
          ' GET /some-other-url?query=world, POST /and-another-url',
      );
    }
  });

  describe('successful errors', () => {
    let request: TestRequest;
    let observer: Observer<any>;
    let lastError: any;

    beforeEach(() => {
      const httpRequest = new HttpRequest('GET', '/test');
      observer = {
        next: jasmine.createSpy('next'),
        error: (err: any) => {
          lastError = err;
        },
        complete: jasmine.createSpy('complete'),
      };
      request = new TestRequest(httpRequest, observer);
    });

    if (isBrowser) {
      it('should allow creating HttpErrorResponse with successful status', () => {
        const error = new ProgressEvent('error');
        request.error(error, {status: 200, statusText: 'OK'});

        expect(lastError).toBeDefined();
        expect(lastError).toBeInstanceOf(HttpErrorResponse);
        expect(lastError.status).toBe(200);
        expect(lastError.statusText).toBe('OK');
      });

      it('should allow creating HttpErrorResponse with any status code', () => {
        const error = new ProgressEvent('error');
        request.error(error, {status: 404, statusText: 'Not Found'});

        expect(lastError).toBeDefined();
        expect(lastError).toBeInstanceOf(HttpErrorResponse);
        expect(lastError.status).toBe(404);
        expect(lastError.statusText).toBe('Not Found');
      });
    } else {
      it('dummy test for node tests', () => {
        expect(true).toBe(true);
      });
    }
  });
});
