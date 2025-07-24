/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, PLATFORM_ID} from '@angular/core';
import {ENVIRONMENT, WINDOW, LOCAL_STORAGE, MockLocalStorage} from '@angular/docs';
import {AnalyticsService} from './analytics.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let injector: Injector;
  let gtagSpy: jasmine.Spy;
  let gtagAppendNodeSpy: jasmine.Spy;
  let windowOnErrorHandler: (event: ErrorEvent) => void;

  let mockWindow: any;
  let mockLocalStorage = new MockLocalStorage();

  beforeEach(() => {
    gtagSpy = jasmine.createSpy('gtag');
    gtagAppendNodeSpy = jasmine.createSpy('gtag.js script head attach');

    mockWindow = {
      name: 'Some name',
      document: {
        head: {appendChild: gtagAppendNodeSpy},
        createElement: (tag: string) => document.createElement(tag),
        querySelector: (_gtagIdSelector: string) => null,
      },
      addEventListener: (_name: string, handler: typeof windowOnErrorHandler) =>
        (windowOnErrorHandler = handler),
    };

    injector = Injector.create({
      providers: [
        {provide: ENVIRONMENT, useValue: {}},
        {provide: AnalyticsService, deps: [WINDOW]},
        {provide: WINDOW, useFactory: () => mockWindow, deps: []},
        {provide: LOCAL_STORAGE, useValue: mockLocalStorage},
        {provide: PLATFORM_ID, useValue: 'browser'}, // Simulate browser platform
      ],
    });

    service = injector.get(AnalyticsService);

    // The `gtag` function is attached to the `Window`, so we can spy on it
    // after the service has been initialized.
    gtagSpy = spyOn(mockWindow, 'gtag');
  });

  describe('error reporting', () => {
    it('should subscribe to window uncaught errors and report them', () => {
      spyOn(service, 'reportError');

      windowOnErrorHandler(
        new ErrorEvent('error', {
          error: new Error('Test Error'),
        }),
      );

      expect(service.reportError).toHaveBeenCalledTimes(1);
      expect(service.reportError).toHaveBeenCalledWith(
        jasmine.stringContaining('Test Error\n'),
        true,
      );
    });

    it('should report errors to analytics by dispatching `gtag` and `ga` events', () => {
      gtagSpy.calls.reset();

      windowOnErrorHandler(
        new ErrorEvent('error', {
          error: new Error('Test Error'),
        }),
      );

      expect(gtagSpy).toHaveBeenCalledTimes(1);
      expect(gtagSpy).toHaveBeenCalledWith(
        'event',
        'exception',
        jasmine.objectContaining({
          description: jasmine.stringContaining('Test Error\n'),
          fatal: true,
        }),
      );
    });
  });
});
