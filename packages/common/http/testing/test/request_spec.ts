/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HttpClient, HttpRequest, HttpErrorResponse} from '../../index';
import {HttpTestingController, provideHttpClientTesting} from '../index';
import {TestRequest} from '../src/request';
import {provideHttpClient, withNoXsrfProtection} from '../../src/provider';
import {TestBed} from '@angular/core/testing';
import {isBrowser} from '@angular/private/testing';
import {Observer} from 'rxjs';

describe('HttpClient TestRequest', () => {
  let client: HttpClient;
  let backend: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withNoXsrfProtection()), provideHttpClientTesting()],
    });
    client = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    backend.verify();
  });

  it('accepts a null body', () => {
    let resp: any;
    client.post('/some-url', {test: 'test'}).subscribe((body) => {
      resp = body;
    });

    const req = backend.expectOne('/some-url');
    req.flush(null);

    expect(resp).toBeNull();
  });

  it('throws if no request matches', () => {
    let resp: any;
    client.get('/some-other-url').subscribe((body) => {
      resp = body;
    });

    try {
      // expect different URL
      backend.expectOne('/some-url').flush(null);
      fail();
    } catch (error) {
      expect((error as Error).message).toBe(
        'Expected one matching request for criteria "Match URL: /some-url", found none.' +
          ' Requests received are: GET /some-other-url.',
      );
    }

    backend.expectOne('/some-other-url').flush(null);
  });

  it('throws if no request matches the exact parameters', () => {
    let resp: any;
    const params = {query: 'hello'};
    client.get('/some-url', {params}).subscribe((body) => {
      resp = body;
    });

    try {
      // expect different query parameters
      backend.expectOne('/some-url?query=world').flush(null);
      fail();
    } catch (error) {
      expect((error as Error).message).toBe(
        'Expected one matching request for criteria "Match URL: /some-url?query=world", found none.' +
          ' Requests received are: GET /some-url?query=hello.',
      );
    }

    backend.expectOne('/some-url?query=hello').flush(null);
  });

  it('throws if no request matches with several requests received', () => {
    let resp: any;
    client.get('/some-other-url?query=world').subscribe((body) => {
      resp = body;
    });
    client.post('/and-another-url', {}).subscribe((body) => {
      resp = body;
    });

    try {
      // expect different URL
      backend.expectOne('/some-url').flush(null);
      fail();
    } catch (error) {
      expect((error as Error).message).toBe(
        'Expected one matching request for criteria "Match URL: /some-url", found none.' +
          ' Requests received are: GET /some-other-url?query=world, POST /and-another-url.',
      );
    }
    backend.expectOne('/some-other-url?query=world').flush(null);
    backend.expectOne('/and-another-url').flush(null);
  });

  it('throws if there are open requests when verify is called', () => {
    client.get('/some-other-url?query=world').subscribe();
    client.post('/and-another-url', {}).subscribe();

    try {
      backend.verify();
      fail();
    } catch (error) {
      expect((error as any).message).toBe(
        'Expected no open requests, found 2:' +
          ' GET /some-other-url?query=world, POST /and-another-url',
      );
    }
    backend.expectOne('/some-other-url?query=world').flush(null);
    backend.expectOne('/and-another-url').flush(null);
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
