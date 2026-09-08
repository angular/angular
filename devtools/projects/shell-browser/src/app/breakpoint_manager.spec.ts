/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/// <reference types="chrome"/>

import {SignalNodePosition} from '../../../protocol';
import {BreakpointManager} from './breakpoint_manager';
import {FakeChromeDebugger} from './fake_chrome_debugger';

const EXTENSION_ID = 'test-extension-id';
const EXTENSION_URL_PREFIX = `chrome-extension://${EXTENSION_ID}/`;

interface Deferred<T = any> {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
}

function createDeferred<T = any>(): Deferred<T> {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: any) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return {promise, resolve, reject};
}

describe('BreakpointManager', () => {
  let manager: BreakpointManager;
  let fakeDebugger: FakeChromeDebugger;
  let mockRuntime: any;
  let runtimeMessageListeners: Function[] = [];

  const validPosition: SignalNodePosition = {
    element: [0, 1],
    signalId: 's1',
  };

  const validSender: chrome.runtime.MessageSender = {
    id: EXTENSION_ID,
    url: `${EXTENSION_URL_PREFIX}app/devtools.html`,
    origin: `chrome-extension://${EXTENSION_ID}`,
    tab: undefined,
  };

  beforeEach(() => {
    fakeDebugger = new FakeChromeDebugger();
    runtimeMessageListeners = [];

    mockRuntime = {
      id: EXTENSION_ID,
      getURL: (path: string) => `${EXTENSION_URL_PREFIX}${path}`,
      onMessage: {
        addListener: (fn: Function) => runtimeMessageListeners.push(fn),
      },
    };

    manager = new BreakpointManager(fakeDebugger as unknown as typeof chrome.debugger, mockRuntime);
    manager.initialize();
  });

  describe('sender validation (security)', () => {
    it('accepts messages from valid DevTools extension panel sender', () => {
      const sendResponse = jasmine.createSpy('sendResponse');
      const message = {
        action: 'getActiveSignalBreakpoints',
        tabId: 123,
      };

      const result = runtimeMessageListeners[0](message, validSender, sendResponse);
      expect(result).toBeFalse();
      expect(sendResponse).toHaveBeenCalledWith({success: true, activePositions: []});
    });

    it('rejects messages originating from content scripts (where sender.tab is defined)', () => {
      const sendResponse = jasmine.createSpy('sendResponse');
      const contentScriptSender: chrome.runtime.MessageSender = {
        id: EXTENSION_ID,
        url: 'https://example.test/angular-app',
        tab: {id: 456} as chrome.tabs.Tab,
      };
      const message = {
        action: 'setSignalBreakpoint',
        tabId: 123,
        position: validPosition,
      };

      const result = runtimeMessageListeners[0](message, contentScriptSender, sendResponse);
      expect(result).toBeFalse();
      expect(sendResponse).not.toHaveBeenCalled();
      expect(fakeDebugger.attachedTargets.has(123)).toBeFalse();
    });

    it('rejects messages from mismatched extension ID', () => {
      const sendResponse = jasmine.createSpy('sendResponse');
      const spoofedSender: chrome.runtime.MessageSender = {
        id: 'different-extension-id',
        url: 'chrome-extension://different-extension-id/page.html',
        tab: undefined,
      };
      const message = {
        action: 'setSignalBreakpoint',
        tabId: 123,
        position: validPosition,
      };

      const result = runtimeMessageListeners[0](message, spoofedSender, sendResponse);
      expect(result).toBeFalse();
      expect(sendResponse).not.toHaveBeenCalled();
    });

    it('rejects messages with non-extension URL', () => {
      const sendResponse = jasmine.createSpy('sendResponse');
      const externalSender: chrome.runtime.MessageSender = {
        id: EXTENSION_ID,
        url: 'https://malicious.test',
        tab: undefined,
      };
      const message = {
        action: 'getActiveSignalBreakpoints',
        tabId: 123,
      };

      const result = runtimeMessageListeners[0](message, externalSender, sendResponse);
      expect(result).toBeFalse();
      expect(sendResponse).not.toHaveBeenCalled();
    });

    it('rejects messages with mismatched sender.origin', () => {
      const sendResponse = jasmine.createSpy('sendResponse');
      const spoofedOriginSender: chrome.runtime.MessageSender = {
        id: EXTENSION_ID,
        url: `${EXTENSION_URL_PREFIX}app/devtools.html`,
        origin: 'https://malicious.test',
        tab: undefined,
      };
      const message = {
        action: 'getActiveSignalBreakpoints',
        tabId: 123,
      };

      const result = runtimeMessageListeners[0](message, spoofedOriginSender, sendResponse);
      expect(result).toBeFalse();
      expect(sendResponse).not.toHaveBeenCalled();
    });

    it('rejects messages where sender.origin is undefined', () => {
      const sendResponse = jasmine.createSpy('sendResponse');
      const undefinedOriginSender: chrome.runtime.MessageSender = {
        id: EXTENSION_ID,
        url: `${EXTENSION_URL_PREFIX}app/devtools.html`,
        origin: undefined,
        tab: undefined,
      };
      const message = {
        action: 'getActiveSignalBreakpoints',
        tabId: 123,
      };

      const result = runtimeMessageListeners[0](message, undefinedOriginSender, sendResponse);
      expect(result).toBeFalse();
      expect(sendResponse).not.toHaveBeenCalled();
    });

    it('derives extensionOrigin from runtimeApi.id when getURL is unavailable', () => {
      const minimalRuntime: any = {
        id: EXTENSION_ID,
        onMessage: {addListener: () => {}},
      };
      const bm = new BreakpointManager(fakeDebugger as any, minimalRuntime);
      expect((bm as any).extensionOrigin).toBe(`chrome-extension://${EXTENSION_ID}`);
    });

    it('rejects messages with invalid or non-numeric tabId', () => {
      const sendResponse = jasmine.createSpy('sendResponse');
      const message = {
        action: 'getActiveSignalBreakpoints',
        tabId: 'invalid-tab-id',
      };

      const result = runtimeMessageListeners[0](message, validSender, sendResponse);
      expect(result).toBeFalse();
      expect(sendResponse).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid tab ID',
      });
    });

    it('ignores unrelated messages and returns false', () => {
      const sendResponse = jasmine.createSpy('sendResponse');
      const message = {
        action: 'unrelatedAction',
      };

      const result = runtimeMessageListeners[0](message, validSender, sendResponse);
      expect(result).toBeFalse();
      expect(sendResponse).not.toHaveBeenCalled();
    });
  });

  describe('runtime message handling', () => {
    it('successfully sets a breakpoint via setSignalBreakpoint message', async () => {
      const deferred = createDeferred<{success: boolean; result?: any}>();
      const sendResponse = jasmine.createSpy('sendResponse').and.callFake(deferred.resolve);

      const message = {
        action: 'setSignalBreakpoint',
        tabId: 123,
        position: validPosition,
      };

      const handled = runtimeMessageListeners[0](message, validSender, sendResponse);
      expect(handled).toBeTrue();

      const response = await deferred.promise;
      expect(response.success).toBeTrue();
      expect(response.result).toEqual({breakpointId: jasmine.any(String)});
      expect(manager.getActiveBreakpoints(123)).toEqual([validPosition]);
      expect(fakeDebugger.attachedTargets.has(123)).toBeTrue();
    });

    it('successfully removes a breakpoint via removeSignalBreakpoint message', async () => {
      await manager.setBreakpoint(123, validPosition);
      expect(manager.getActiveBreakpoints(123).length).toBe(1);

      const deferred = createDeferred<{success: boolean}>();
      const sendResponse = jasmine.createSpy('sendResponse').and.callFake(deferred.resolve);

      const message = {
        action: 'removeSignalBreakpoint',
        tabId: 123,
        position: validPosition,
      };

      const handled = runtimeMessageListeners[0](message, validSender, sendResponse);
      expect(handled).toBeTrue();

      const response = await deferred.promise;
      expect(response.success).toBeTrue();
      expect(manager.getActiveBreakpoints(123).length).toBe(0);
      expect(fakeDebugger.attachedTargets.has(123)).toBeFalse();
    });

    it('returns error response when setSignalBreakpoint fails', async () => {
      fakeDebugger.sendCommand.and.rejectWith(new Error('CDP evaluation error'));

      const deferred = createDeferred<{success: boolean; error?: string}>();
      const sendResponse = jasmine.createSpy('sendResponse').and.callFake(deferred.resolve);

      const message = {
        action: 'setSignalBreakpoint',
        tabId: 123,
        position: validPosition,
      };

      const handled = runtimeMessageListeners[0](message, validSender, sendResponse);
      expect(handled).toBeTrue();

      const response = await deferred.promise;
      expect(response.success).toBeFalse();
      expect(response.error).toContain('CDP evaluation error');
    });

    it('returns error response when removeSignalBreakpoint fails for non-existent breakpoint', async () => {
      const deferred = createDeferred<{success: boolean; error?: string}>();
      const sendResponse = jasmine.createSpy('sendResponse').and.callFake(deferred.resolve);

      const message = {
        action: 'removeSignalBreakpoint',
        tabId: 123,
        position: validPosition,
      };

      const handled = runtimeMessageListeners[0](message, validSender, sendResponse);
      expect(handled).toBeTrue();

      const response = await deferred.promise;
      expect(response.success).toBeFalse();
      expect(response.error).toContain('No active breakpoints for this tab');
    });
  });

  describe('debugger detach and cleanup', () => {
    it('detaches debugger when the last breakpoint for a tab is removed', async () => {
      const tabId = 123;
      await manager.setBreakpoint(tabId, validPosition);
      expect(manager.getActiveBreakpoints(tabId).length).toBe(1);

      await manager.removeBreakpoint(tabId, validPosition);
      expect(manager.getActiveBreakpoints(tabId).length).toBe(0);
      expect(fakeDebugger.attachedTargets.has(tabId)).toBeFalse();
    });

    it('cleans up active breakpoints when debugger is detached externally', async () => {
      const tabId = 123;
      await manager.setBreakpoint(tabId, validPosition);
      expect(manager.getActiveBreakpoints(tabId).length).toBe(1);

      // Simulate external detach event (e.g. user closes tab or cancels infobar)
      fakeDebugger.emitDetach({tabId});

      expect(manager.getActiveBreakpoints(tabId).length).toBe(0);
    });

    it('cleans up active breakpoint entry even if removeBreakpoint command fails', async () => {
      const tabId = 123;
      fakeDebugger.shouldFailRemoveBreakpoint = true;

      await manager.setBreakpoint(tabId, validPosition);
      expect(manager.getActiveBreakpoints(tabId).length).toBe(1);

      await expectAsync(manager.removeBreakpoint(tabId, validPosition)).toBeRejectedWithError(
        'CDP internal failure',
      );
      // The finally block ensures the local breakpoint map is still cleaned up
      expect(manager.getActiveBreakpoints(tabId).length).toBe(0);
    });

    it('handles benign already-detached error when removing breakpoint', async () => {
      const tabId = 123;
      fakeDebugger.shouldFailRemoveBreakpoint = true;
      fakeDebugger.failRemoveBreakpointError = new Error('Debugger is not attached to that target');

      await manager.setBreakpoint(tabId, validPosition);
      await manager.removeBreakpoint(tabId, validPosition);
      expect(manager.getActiveBreakpoints(tabId).length).toBe(0);
    });

    it('logs unexpected errors when detaching the debugger fails', async () => {
      spyOn(console, 'warn');
      const tabId = 123;
      fakeDebugger.shouldFailDetach = true;

      await manager.setBreakpoint(tabId, validPosition);
      await manager.removeBreakpoint(tabId, validPosition);

      expect(console.warn).toHaveBeenCalledWith(
        'Unexpected error while detaching debugger:',
        jasmine.any(Error),
      );
    });

    it('namespaces script URLs by tabId', async () => {
      const tab1 = 101;
      const tab2 = 102;

      // Script parsed on tab 1
      fakeDebugger.emitEvent({tabId: tab1}, 'Debugger.scriptParsed', {
        scriptId: 'script-common',
        url: 'http://app1.test/bundle.js',
      });

      // Script with same ID parsed on tab 2
      fakeDebugger.emitEvent({tabId: tab2}, 'Debugger.scriptParsed', {
        scriptId: 'script-common',
        url: 'http://app2.test/bundle.js',
      });

      fakeDebugger.mockScriptId = 'script-common';

      await manager.setBreakpoint(tab1, validPosition);
      expect(fakeDebugger.sendCommand).toHaveBeenCalledWith(
        {tabId: tab1},
        'Debugger.setBreakpointByUrl',
        jasmine.objectContaining({url: 'http://app1.test/bundle.js'}),
      );

      await manager.setBreakpoint(tab2, validPosition);
      expect(fakeDebugger.sendCommand).toHaveBeenCalledWith(
        {tabId: tab2},
        'Debugger.setBreakpointByUrl',
        jasmine.objectContaining({url: 'http://app2.test/bundle.js'}),
      );
    });
  });
});
