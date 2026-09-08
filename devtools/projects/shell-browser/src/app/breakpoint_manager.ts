/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/// <reference types="chrome"/>

import {SignalNodePosition} from '../../../protocol';
import {stringifyAndEscape} from './comm-utils';

/**
 * Chrome DevTools Protocol (CDP) version requested when attaching the debugger.
 * '1.3' is the standard, stable protocol version supporting the Runtime and Debugger
 * domains across all modern Chromium browsers.
 */
export const CDP_PROTOCOL_VERSION = '1.3';

interface ActiveBreakpointEntry {
  position: SignalNodePosition;
  breakpointId: string;
}

interface SetBreakpointResult {
  breakpointId: string;
  locations?: Array<{
    scriptId: string;
    lineNumber: number;
    columnNumber?: number;
  }>;
}

interface InternalProperty {
  name: string;
  value?: {
    value?: {
      scriptId: string;
      lineNumber: number;
      columnNumber: number;
    };
  };
}

interface ScriptParsedParams {
  scriptId: string;
  url: string;
}

function serializePosition(position: SignalNodePosition): string {
  return `${position.element.join('/')}#${position.signalId}`;
}

function isValidPosition(position: unknown): position is SignalNodePosition {
  return (
    typeof position === 'object' &&
    position !== null &&
    Array.isArray((position as SignalNodePosition).element) &&
    (position as SignalNodePosition).element.every((idx) => typeof idx === 'number') &&
    typeof (position as SignalNodePosition).signalId === 'string'
  );
}

function isDetached(err: unknown): boolean {
  const msg = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
  return (
    msg.includes('not attached') ||
    msg.includes('already detached') ||
    msg.includes('target closed') ||
    msg.includes('detached')
  );
}

/**
 * Deterministic element/signal position key: `${element.join('/')}#${signalId}`
 */
export type SignalKey = string;
export type TabId = number;
export type ScriptId = string;
export type ScriptUrl = string;

export class BreakpointManager {
  /**
   * Tracks active CDP signal breakpoints per browser tab.
   * - Outer Map Key: tabId (TabId) — Chrome tab ID being inspected.
   * - Inner Map Key: positionKey (SignalKey) — Deterministic element/signal key (${element.join('/')}#${signalId}).
   * - Inner Map Value: ActiveBreakpointEntry — Contains original SignalNodePosition and CDP breakpointId.
   */
  private readonly activeBreakpoints = new Map<TabId, Map<SignalKey, ActiveBreakpointEntry>>();

  /**
   * Maps tabId -> (scriptId -> script URL).
   * Keyed by tabId to prevent cross-tab collisions and allow clean lifecycle management.
   */
  private readonly scriptMap = new Map<TabId, Map<ScriptId, ScriptUrl>>();

  constructor(
    private readonly debuggerApi: typeof chrome.debugger = chrome.debugger,
    private readonly runtimeApi: typeof chrome.runtime = chrome.runtime,
  ) {}

  static initialize(
    debuggerApi: typeof chrome.debugger = chrome.debugger,
    runtimeApi: typeof chrome.runtime = chrome.runtime,
  ): BreakpointManager {
    const manager = new BreakpointManager(debuggerApi, runtimeApi);
    manager.initialize();
    return manager;
  }

  private get extensionOrigin(): string {
    if (typeof this.runtimeApi.getURL === 'function') {
      const url = this.runtimeApi.getURL('');
      return url.endsWith('/') ? url.slice(0, -1) : url;
    }
    if (this.runtimeApi.id) {
      return `chrome-extension://${this.runtimeApi.id}`;
    }
    return typeof self !== 'undefined' ? self.origin : '';
  }

  initialize(): void {
    this.debuggerApi.onEvent.addListener(this.handleDebuggerEvent);
    this.debuggerApi.onDetach.addListener(this.handleDebuggerDetach);
    this.runtimeApi.onMessage.addListener(this.handleRuntimeMessage);
  }

  private readonly handleDebuggerEvent = (
    source: chrome.debugger.Debuggee,
    method: string,
    params?: unknown,
  ): void => {
    if (method === 'Debugger.scriptParsed' && params && source.tabId !== undefined) {
      const {scriptId, url} = params as ScriptParsedParams;
      if (scriptId && url) {
        let tabScripts = this.scriptMap.get(source.tabId);
        if (!tabScripts) {
          tabScripts = new Map();
          this.scriptMap.set(source.tabId, tabScripts);
        }
        tabScripts.set(scriptId, url);
      }
    }
  };

  private readonly handleDebuggerDetach = (source: chrome.debugger.Debuggee): void => {
    if (source.tabId !== undefined) {
      this.activeBreakpoints.delete(source.tabId);
      this.scriptMap.delete(source.tabId);
    }
  };

  /**
   * Validates that the message sender originates from this extension's internal DevTools panel.
   * Disallows messages from injected content scripts (which have sender.tab defined)
   * and external pages.
   */
  private isValidSender(sender: chrome.runtime.MessageSender): boolean {
    // 1. Ensure the sender extension ID matches our own extension ID
    if (sender.id !== this.runtimeApi.id) {
      return false;
    }
    // 2. Ensure the message originates from an extension internal context (DevTools panel),
    //    and not an injected content script or webpage where sender.tab is defined.
    if (sender.tab !== undefined) {
      return false;
    }
    // 3. Ensure the message originates from this extension's origin
    if (!sender.origin || sender.origin !== this.extensionOrigin) {
      return false;
    }
    return true;
  }

  private readonly handleRuntimeMessage = (
    message: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void,
  ): boolean => {
    if (
      message?.action !== 'setSignalBreakpoint' &&
      message?.action !== 'removeSignalBreakpoint' &&
      message?.action !== 'getActiveSignalBreakpoints'
    ) {
      return false;
    }

    if (!this.isValidSender(sender)) {
      console.warn('Rejected unauthorized breakpoint message from sender:', sender);
      return false;
    }

    const {tabId} = message;
    if (typeof tabId !== 'number' || !Number.isInteger(tabId) || tabId < 0) {
      sendResponse({success: false, error: 'Invalid tab ID'});
      return false;
    }

    if (message.action === 'setSignalBreakpoint') {
      const {position} = message;
      this.setBreakpoint(tabId, position)
        .then((result) => sendResponse({success: true, result}))
        .catch((err) => {
          console.error('CDP Error:', err);
          sendResponse({success: false, error: err.message || err});
        });
      return true;
    } else if (message.action === 'removeSignalBreakpoint') {
      const {position} = message;
      this.removeBreakpoint(tabId, position)
        .then((result) => sendResponse({success: true, result}))
        .catch((err) => {
          console.error('CDP Error:', err);
          sendResponse({success: false, error: err.message || err});
        });
      return true;
    } else if (message.action === 'getActiveSignalBreakpoints') {
      const activePositions = this.getActiveBreakpoints(tabId);
      sendResponse({success: true, activePositions});
      return false;
    }
    return false;
  };

  getActiveBreakpoints(tabId: number): SignalNodePosition[] {
    const tabBreakpoints = this.activeBreakpoints.get(tabId);
    return tabBreakpoints ? Array.from(tabBreakpoints.values(), (entry) => entry.position) : [];
  }

  private async ensureAttached(target: {tabId: number}): Promise<void> {
    try {
      await this.debuggerApi.attach(target, CDP_PROTOCOL_VERSION);
    } catch (err: any) {
      const msg = err?.message ? String(err.message).toLowerCase() : String(err).toLowerCase();
      if (!msg.includes('already attached')) {
        throw err;
      }
    }
  }

  async setBreakpoint(tabId: number, position: SignalNodePosition): Promise<SetBreakpointResult> {
    if (!isValidPosition(position)) {
      throw new Error('Invalid signal position payload');
    }

    const target = {tabId};
    await this.ensureAttached(target);

    await this.debuggerApi.sendCommand(target, 'Debugger.enable');

    const expression = `inspectedApplication.findSignalNodeByPosition(${stringifyAndEscape(position)})`;
    const evalResult: any = await this.debuggerApi.sendCommand(target, 'Runtime.evaluate', {
      expression,
      objectGroup: 'angular-devtools',
    });

    if (evalResult?.exceptionDetails) {
      throw new Error('Evaluation failed: ' + evalResult.exceptionDetails.exception.description);
    }

    const objectId = evalResult?.result?.objectId;
    if (!objectId) {
      throw new Error('Could not find function object');
    }

    const propsResult: any = await this.debuggerApi.sendCommand(target, 'Runtime.getProperties', {
      objectId,
    });

    const internalProps: InternalProperty[] = propsResult?.internalProperties ?? [];
    const locationProp = internalProps.find((p) => p.name === '[[FunctionLocation]]');
    const location = locationProp?.value?.value;

    if (!location) {
      throw new Error('Could not find [[FunctionLocation]]');
    }

    const {scriptId, lineNumber, columnNumber} = location;

    let bpResult: SetBreakpointResult | undefined;
    const url = this.scriptMap.get(tabId)?.get(scriptId);

    if (!url) {
      console.warn('Could not find URL for scriptId:', scriptId, 'falling back to scriptId');
      bpResult = (await this.debuggerApi.sendCommand(target, 'Debugger.setBreakpoint', {
        location: {scriptId, lineNumber, columnNumber},
      })) as SetBreakpointResult;
    } else {
      bpResult = (await this.debuggerApi.sendCommand(target, 'Debugger.setBreakpointByUrl', {
        url,
        lineNumber,
        columnNumber,
      })) as SetBreakpointResult;
    }

    if (!bpResult?.breakpointId) {
      throw new Error('Failed to set breakpoint via CDP: no breakpoint ID was returned.');
    }

    if (!this.activeBreakpoints.has(tabId)) {
      this.activeBreakpoints.set(tabId, new Map());
    }
    const posKey = serializePosition(position);
    this.activeBreakpoints.get(tabId)!.set(posKey, {
      position,
      breakpointId: bpResult.breakpointId,
    });

    return bpResult;
  }

  async removeBreakpoint(tabId: number, position: SignalNodePosition): Promise<void> {
    if (!isValidPosition(position)) {
      throw new Error('Invalid signal position payload');
    }

    const target = {tabId};
    const tabBps = this.activeBreakpoints.get(tabId);
    if (!tabBps) {
      throw new Error('No active breakpoints for this tab');
    }
    const posKey = serializePosition(position);
    const entry = tabBps.get(posKey);
    if (!entry) {
      throw new Error('No active breakpoint found for this signal');
    }

    try {
      await this.debuggerApi.sendCommand(target, 'Debugger.removeBreakpoint', {
        breakpointId: entry.breakpointId,
      });
    } catch (err: unknown) {
      // If the debugger is already detached or target closed, CDP has already dropped breakpoints
      if (!isDetached(err)) {
        throw err;
      }
    } finally {
      tabBps.delete(posKey);
      if (tabBps.size === 0) {
        this.activeBreakpoints.delete(tabId);
        this.scriptMap.delete(tabId);
        try {
          await this.debuggerApi.detach(target);
        } catch (err: unknown) {
          if (!isDetached(err)) {
            console.warn('Unexpected error while detaching debugger:', err);
          }
        }
      }
    }
  }
}
