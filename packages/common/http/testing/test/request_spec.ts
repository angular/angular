/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HttpClient} from '@angular/common/http';
import {HttpClientTestingBackend} from '@angular/common/http/testing/src/backend';
import {HttpParams} from '../../src/params';

describe('HttpClient TestRequest', () => {
  it('accepts a null body', () => {
    const mock = new HttpClientTestingBackend();
    const client = new HttpClient(mock);

    let resp: any;
    client.post('/some-url', {test: 'test'}).subscribe(body => { resp = body; });

    const req = mock.expectOne('/some-url');
    req.flush(null);

    expect(resp).toBeNull();
  });

  it('to throw and error including a hint with the url with params when no exact match was found',
     () => {
       const makeRequestFn = () => {
         const mock = new HttpClientTestingBackend();
         const client = new HttpClient(mock);
         const params =
             new HttpParams().set('paramName1', 'paramValue1').set('paramName2', 'paramValue2');
         let resp: any;
         client.get('/url-with-params', {params}).subscribe(body => { resp = body; });
         const req = mock.expectOne('/url-with-params');
         req.flush(null);

         mock.verify();
       };

       expect(makeRequestFn)
           .toThrowError(
               'Expected one matching request for criteria "Match URL: /url-with-params", found none. HINT: A partial match was found "/url-with-params?paramName1=paramValue1&paramName2=paramValue2". Make sure you also include the query params.');
     });
});
