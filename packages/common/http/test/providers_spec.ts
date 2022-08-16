/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {PLATFORM_ID, Provider} from '@angular/core';
import {TestBed} from '@angular/core/testing';

import {provideHttpDisabledXsrfProtection, provideHttpJsonpSupport, provideHttpXsrfProtection} from '../src/providers';
import {HttpTestingController, provideHttpTesting} from '../testing';


describe('provideHttpXsrfProtection()', () => {
  afterEach(() => {
    setCookie('XSRF-TOKEN=abcdefg');
  });

  it('uses the default cookie when configured', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpTesting(),
        enableCookieSupportForTest(),
      ],
    });
    setCookie('XSRF-TOKEN=abcdefg');

    const {ctrl, client} = getHttpInTest();

    client.post('/test', 'Test', {responseType: 'text'}).subscribe();
    const req = ctrl.expectOne({url: '/test', method: 'POST'});
    expect(req.request.headers.get('X-XSRF-TOKEN')).toEqual('abcdefg');
    req.flush('');

    ctrl.verify();
  });

  it('allows an overridden cookie and header name', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpTesting(),
        provideHttpXsrfProtection({
          xsrfCookieName: 'CustomCookie',
          xsrfHeaderName: 'Custom-Header',
        }),
        enableCookieSupportForTest(),
      ],
    });
    setCookie('CustomCookie=abcdefg');

    const {ctrl, client} = getHttpInTest();

    client.post('/test', 'Test', {responseType: 'text'}).subscribe();
    const req = ctrl.expectOne({url: '/test', method: 'POST'});
    expect(req.request.headers.get('Custom-Header')).toEqual('abcdefg');
    req.flush('');

    ctrl.verify();
  });

  it('allows disabling via provideHttpDisabledXsrfProtection()', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpTesting(),
        provideHttpDisabledXsrfProtection(),
        enableCookieSupportForTest(),
      ],
    });
    setCookie('CustomCookie=abcdefg');

    const {ctrl, client} = getHttpInTest();

    client.post('/test', 'Test', {responseType: 'text'}).subscribe();
    const req = ctrl.expectOne({url: '/test', method: 'POST'});
    expect(req.request.headers.has('Custom-Header')).toBeFalse();
    req.flush('');

    ctrl.verify();
  });
});

describe('provideJsonpInterceptor()', () => {
  it('enables jsonp() support', () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpTesting(),
        provideHttpJsonpSupport(),
      ],
    });

    const {ctrl, client} = getHttpInTest();
    client.jsonp('http://jsonp.com', 'myCallback').subscribe();

    // It's enough to assert that the request didn't reach the testing backend. If the interceptor
    // weren't active, the request would be passed through and this assertion would fail.
    ctrl.expectNone('http://jsonp.com');

    ctrl.verify();
  });
});


function setCookie(cookie: string): void {
  Object.defineProperty(TestBed.inject(DOCUMENT), 'cookie', {
    get: () => cookie,
    configurable: true,
  });
}

function enableCookieSupportForTest(): Provider[] {
  return [
    // We've mocked out `document.cookie` so that it actually works. This allows us to pretend
    // to be the browser platform instead of 'server', so we can test the real xsrf
    // interceptor fully. Otherwise, the xsrf token would be `null`.
    {provide: PLATFORM_ID, useValue: 'browser'},
  ];
}

function getHttpInTest(): {ctrl: HttpTestingController, client: HttpClient} {
  return {
    ctrl: TestBed.inject(HttpTestingController),
    client: TestBed.inject(HttpClient),
  };
}
