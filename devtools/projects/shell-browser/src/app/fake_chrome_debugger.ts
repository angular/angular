/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/// <reference types="chrome"/>

/**
 * In-memory fake implementation of chrome.debugger for stable, reusable tests.
 */
export class FakeChromeDebugger {
  attachedTargets = new Set<number>();
  activeCdpBreakpoints = new Set<string>();
  eventListeners: Array<
    (source: chrome.debugger.Debuggee, method: string, params?: unknown) => void
  > = [];
  detachListeners: Array<(source: chrome.debugger.Debuggee) => void> = [];

  mockScriptId = 's1';
  mockLineNumber = 10;
  mockColumnNumber = 5;
  nextBreakpointId = 1;
  shouldFailRemoveBreakpoint = false;
  failRemoveBreakpointError: Error = new Error('CDP internal failure');
  shouldFailDetach = false;

  async attach(target: chrome.debugger.Debuggee, requiredVersion?: string): Promise<void> {
    if (target.tabId !== undefined) {
      this.attachedTargets.add(target.tabId);
    }
  }

  async detach(target: chrome.debugger.Debuggee): Promise<void> {
    if (this.shouldFailDetach) {
      throw new Error('Unexpected detach failure');
    }
    if (target.tabId !== undefined) {
      this.attachedTargets.delete(target.tabId);
    }
  }

  readonly sendCommand = jasmine
    .createSpy<
      (target: chrome.debugger.Debuggee, method: string, commandParams?: any) => Promise<any>
    >('sendCommand')
    .and.callFake(async (target: chrome.debugger.Debuggee, method: string, commandParams?: any) => {
      switch (method) {
        case 'Debugger.enable':
          return {};
        case 'Runtime.evaluate':
          return {result: {objectId: 'obj-1'}};
        case 'Runtime.getProperties':
          return {
            internalProperties: [
              {
                name: '[[FunctionLocation]]',
                value: {
                  value: {
                    scriptId: this.mockScriptId,
                    lineNumber: this.mockLineNumber,
                    columnNumber: this.mockColumnNumber,
                  },
                },
              },
            ],
          };
        case 'Debugger.setBreakpoint':
        case 'Debugger.setBreakpointByUrl': {
          const bpId = `bp-${this.nextBreakpointId++}`;
          this.activeCdpBreakpoints.add(bpId);
          return {breakpointId: bpId};
        }
        case 'Debugger.removeBreakpoint': {
          if (this.shouldFailRemoveBreakpoint) {
            throw this.failRemoveBreakpointError;
          }
          this.activeCdpBreakpoints.delete(commandParams?.breakpointId);
          return {};
        }
        default:
          return {};
      }
    });

  readonly onEvent = {
    addListener: (fn: any) => this.eventListeners.push(fn),
    removeListener: (fn: any) => {
      this.eventListeners = this.eventListeners.filter((l) => l !== fn);
    },
  };

  readonly onDetach = {
    addListener: (fn: any) => this.detachListeners.push(fn),
    removeListener: (fn: any) => {
      this.detachListeners = this.detachListeners.filter((l) => l !== fn);
    },
  };

  emitEvent(source: chrome.debugger.Debuggee, method: string, params?: unknown) {
    for (const listener of this.eventListeners) {
      listener(source, method, params);
    }
  }

  emitDetach(source: chrome.debugger.Debuggee) {
    for (const listener of this.detachListeners) {
      listener(source);
    }
  }
}
