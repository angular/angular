/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/// <reference types="chrome"/>

import {Platform} from '@angular/cdk/platform';
import {TestBed} from '@angular/core/testing';
import {Frame} from '../../../ng-devtools';
import {ChromeApplicationOperations} from './chrome-application-operations';

describe('ChromeApplicationOperations', () => {
  let operations: ChromeApplicationOperations;
  let evalSpy: jasmine.Spy;
  let runtimeListeners: Array<(message: any, sender: chrome.runtime.MessageSender) => void>;

  beforeEach(() => {
    evalSpy = jasmine.createSpy('eval');
    runtimeListeners = [];
    // Mock chrome global
    (globalThis as any).chrome = {
      devtools: {
        inspectedWindow: {
          tabId: 42,
          eval: evalSpy,
        },
      },
      runtime: {
        id: 'test-ext-id',
        onMessage: {
          addListener: jasmine.createSpy('addListener').and.callFake((fn: any) => {
            runtimeListeners.push(fn);
          }),
          removeListener: jasmine.createSpy('removeListener').and.callFake((fn: any) => {
            runtimeListeners = runtimeListeners.filter((l) => l !== fn);
          }),
        },
      },
    };

    TestBed.configureTestingModule({
      providers: [ChromeApplicationOperations, {provide: Platform, useValue: {FIREFOX: false}}],
    });
    operations = TestBed.inject(ChromeApplicationOperations);
  });

  afterEach(() => {
    delete (globalThis as any).chrome;
  });

  describe('viewSource', () => {
    it('should call chrome.devtools.inspectedWindow.eval with correct string', () => {
      const target: Frame = {
        name: 'test1',
        id: 0,
        url: new URL('http://localhost:4200/url'),
      } as any;
      operations.viewSource([0, 0], target, 0);

      expect(evalSpy).toHaveBeenCalledWith(
        'inspect(inspectedApplication.findConstructorByPosition("[0,0]", 0))',
        {frameURL: 'http://localhost:4200/url'},
      );
    });
  });

  describe('onSignalBreakpointsCleared', () => {
    it('invokes callback when signalBreakpointsCleared message is received for inspected tab from extension', () => {
      const callback = jasmine.createSpy('callback');
      const unsubscribe = operations.onSignalBreakpointsCleared(callback);

      // Unrelated tabId should be ignored
      runtimeListeners[0](
        {action: 'signalBreakpointsCleared', tabId: 99},
        {id: 'test-ext-id', tab: undefined},
      );
      expect(callback).not.toHaveBeenCalled();

      // Message from content script (sender.tab defined) should be ignored
      runtimeListeners[0](
        {action: 'signalBreakpointsCleared', tabId: 42},
        {id: 'test-ext-id', tab: {id: 42} as chrome.tabs.Tab},
      );
      expect(callback).not.toHaveBeenCalled();

      // Valid message for inspected tabId from extension background
      runtimeListeners[0](
        {action: 'signalBreakpointsCleared', tabId: 42},
        {id: 'test-ext-id', tab: undefined},
      );
      expect(callback).toHaveBeenCalledTimes(1);

      unsubscribe();
      expect(runtimeListeners.length).toBe(0);
    });
  });
});
