/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/// <reference types="chrome"/>

import {AngularDetection} from '../../../protocol';
import {TabManager} from './tab_manager';

function getPopUpName(ng: AngularDetection): string {
  if (!ng.isAngular) {
    return 'not-angular.html';
  }
  if (!ng.isIvy || !ng.isSupportedAngularVersion) {
    return 'unsupported.html';
  }
  if (!ng.isDebugMode) {
    return 'production.html';
  }
  return 'supported.html';
}

if (chrome !== undefined && chrome.runtime !== undefined) {
  const isManifestV3 = chrome.runtime.getManifest().manifest_version === 3;

  const browserAction = (() => {
    // Electron does not expose browserAction object,
    // Use empty calls as fallback if they are not defined.
    const noopAction = {setIcon: () => {}, setPopup: () => {}};

    if (isManifestV3) {
      return chrome.action || noopAction;
    }

    return chrome.browserAction || noopAction;
  })();

  // By default use the black and white icon.
  // Replace it only when we detect an Angular app.
  browserAction.setIcon(
    {
      path: {
        16: chrome.runtime.getURL(`assets/icon-bw16.png`),
        48: chrome.runtime.getURL(`assets/icon-bw48.png`),
        128: chrome.runtime.getURL(`assets/icon-bw128.png`),
      },
    },
    () => {},
  );

  chrome.runtime.onMessage.addListener((req: AngularDetection, sender) => {
    if (!req.isAngularDevTools) {
      return;
    }

    if (sender && sender.tab) {
      browserAction.setPopup({
        tabId: sender.tab.id,
        popup: `popups/${getPopUpName(req)}`,
      });
    }

    if (sender && sender.tab && req.isAngular) {
      browserAction.setIcon(
        {
          tabId: sender.tab.id,
          path: {
            16: chrome.runtime.getURL(`assets/icon16.png`),
            48: chrome.runtime.getURL(`assets/icon48.png`),
            128: chrome.runtime.getURL(`assets/icon128.png`),
          },
        },
        () => {},
      );
    }
  });

  const tabs = {};
  TabManager.initialize(tabs);

  const scriptMap = new Map<string, string>();

  chrome.debugger.onEvent.addListener((source, method, params) => {
    if (method === 'Debugger.scriptParsed' && params) {
      const {scriptId, url} = params as any;
      scriptMap.set(scriptId, url);
    }
  });

  const activeBreakpoints = new Map<number, Map<string, string>>();

  function serializePosition(position: any): string {
    return JSON.stringify({
      element: position.element,
      signalId: position.signalId,
    });
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'setSignalBreakpoint') {
      const {tabId, position} = message;
      setBreakpointViaCDP(tabId, position)
        .then((result) => sendResponse({success: true, result}))
        .catch((err) => {
          console.error('CDP Error:', err);
          sendResponse({success: false, error: err.message || err});
        });
      return true; // Keep channel open
    } else if (message.action === 'removeSignalBreakpoint') {
      const {tabId, position} = message;
      removeBreakpointViaCDP(tabId, position)
        .then((result) => sendResponse({success: true, result}))
        .catch((err) => {
          console.error('CDP Error:', err);
          sendResponse({success: false, error: err.message || err});
        });
      return true; // Keep channel open
    }
    return false;
  });

  function attachDebugger(target: chrome.debugger.Debuggee, version: string): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.debugger.attach(target, version, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }

  function sendDebuggerCommand(
    target: chrome.debugger.Debuggee,
    method: string,
    commandParams?: {[key: string]: any},
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      chrome.debugger.sendCommand(target, method, commandParams, (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result);
        }
      });
    });
  }

  async function setBreakpointViaCDP(tabId: number, position: any) {
    const target = {tabId};

    try {
      await attachDebugger(target, '1.3');
    } catch (err: any) {
      if (!err.message || !err.message.includes('Already attached')) {
        throw err;
      }
    }

    await sendDebuggerCommand(target, 'Debugger.enable');

    const expression = `inspectedApplication.findSignalNodeByPosition('${JSON.stringify(position)}')`;
    const evalResult = await sendDebuggerCommand(target, 'Runtime.evaluate', {
      expression,
      objectGroup: 'angular-devtools',
    });

    if (evalResult.exceptionDetails) {
      throw new Error('Evaluation failed: ' + evalResult.exceptionDetails.exception.description);
    }

    const objectId = evalResult.result.objectId;
    if (!objectId) {
      throw new Error('Could not find function object');
    }

    const propsResult = await sendDebuggerCommand(target, 'Runtime.getProperties', {
      objectId,
    });

    const internalProps = propsResult.internalProperties || [];
    const locationProp = internalProps.find((p: any) => p.name === '[[FunctionLocation]]');

    if (!locationProp || !locationProp.value || !locationProp.value.value) {
      throw new Error('Could not find [[FunctionLocation]]');
    }

    const {scriptId, lineNumber, columnNumber} = locationProp.value.value;

    let bpResult;
    const url = scriptMap.get(scriptId);
    if (!url) {
      console.warn('Could not find URL for scriptId:', scriptId, 'falling back to scriptId');
      bpResult = await sendDebuggerCommand(target, 'Debugger.setBreakpoint', {
        location: {scriptId, lineNumber, columnNumber},
      });
    } else {
      bpResult = await sendDebuggerCommand(target, 'Debugger.setBreakpointByUrl', {
        url,
        lineNumber,
        columnNumber,
      });
    }

    if (bpResult && bpResult.breakpointId) {
      if (!activeBreakpoints.has(tabId)) {
        activeBreakpoints.set(tabId, new Map());
      }
      const posKey = serializePosition(position);
      activeBreakpoints.get(tabId)!.set(posKey, bpResult.breakpointId);
    }

    return bpResult;
  }

  async function removeBreakpointViaCDP(tabId: number, position: any) {
    const target = {tabId};
    const tabBps = activeBreakpoints.get(tabId);
    if (!tabBps) {
      throw new Error('No active breakpoints for this tab');
    }
    const posKey = serializePosition(position);
    const breakpointId = tabBps.get(posKey);
    if (!breakpointId) {
      throw new Error('No active breakpoint found for this signal');
    }

    await sendDebuggerCommand(target, 'Debugger.removeBreakpoint', {
      breakpointId,
    });

    tabBps.delete(posKey);
    if (tabBps.size === 0) {
      activeBreakpoints.delete(tabId);
    }
  }
}
