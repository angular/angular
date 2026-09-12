/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/// <reference types="chrome"/>
/// <reference types="firefox-webext-browser" />

import {Platform} from '@angular/cdk/platform';
import {inject} from '@angular/core';
import {ApplicationOperations, Frame, TOP_LEVEL_FRAME_ID} from '../../../ng-devtools';
import {DirectivePosition, ElementPosition, SignalNodePosition} from '../../../protocol';
import {stringifyAndEscape} from './comm-utils';

export class ChromeApplicationOperations extends ApplicationOperations {
  platform = inject(Platform);

  override viewSource(position: ElementPosition, target: Frame, directiveIndex?: number): void {
    const viewSource = `inspect(inspectedApplication.findConstructorByPosition(${stringifyAndEscape(position)}, ${directiveIndex}))`;
    this.runInInspectedWindow(viewSource, target);
  }

  override selectDomElement(position: ElementPosition, target: Frame): void {
    const selectDomElement = `inspect(inspectedApplication.findDomElementByPosition(${stringifyAndEscape(position)}))`;
    this.runInInspectedWindow(selectDomElement, target);
  }

  override inspect(
    directivePosition: DirectivePosition,
    objectPath: string[],
    target: Frame,
  ): void {
    const args = {
      directivePosition,
      objectPath,
    };
    const inspect = `inspect(inspectedApplication.findPropertyByPosition(${stringifyAndEscape(
      args,
    )}))`;
    this.runInInspectedWindow(inspect, target);
  }

  override inspectSignal(position: SignalNodePosition, target: Frame): void {
    const inspectSignal = `inspect(inspectedApplication.findSignalNodeByPosition(${stringifyAndEscape(
      position,
    )}))`;
    this.runInInspectedWindow(inspectSignal, target);
  }

  override async setSignalBreakpoint(
    position: SignalNodePosition,
    target: Frame,
  ): Promise<boolean> {
    const tabId = chrome.devtools.inspectedWindow.tabId;
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'setSignalBreakpoint',
        tabId,
        position,
      });
      if (!response?.success) {
        console.error('Failed to set breakpoint via CDP:', response?.error);
      }
      return Boolean(response?.success);
    } catch (err) {
      console.error('Failed to set breakpoint via CDP:', err);
      return false;
    }
  }

  override async removeSignalBreakpoint(
    position: SignalNodePosition,
    target: Frame,
  ): Promise<boolean> {
    const tabId = chrome.devtools.inspectedWindow.tabId;
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'removeSignalBreakpoint',
        tabId,
        position,
      });
      if (!response?.success) {
        console.error('Failed to remove breakpoint via CDP:', response?.error);
      }
      return Boolean(response?.success);
    } catch (err) {
      console.error('Failed to remove breakpoint via CDP:', err);
      return false;
    }
  }

  override async getActiveSignalBreakpoints(target: Frame): Promise<SignalNodePosition[]> {
    const tabId = chrome.devtools.inspectedWindow.tabId;
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'getActiveSignalBreakpoints',
        tabId,
      });
      if (!response?.success) {
        console.error('Failed to get active signal breakpoints via CDP:', response?.error);
      }
      return response?.success ? (response.activePositions ?? []) : [];
    } catch (err) {
      console.error('Failed to get active signal breakpoints via CDP:', err);
      return [];
    }
  }

  override viewSourceFromRouter(name: string, type: string, target: Frame): void {
    const viewSource = `inspect(inspectedApplication.findConstructorByNameForRouter(${JSON.stringify(name)}, ${JSON.stringify(type)}))`;
    this.runInInspectedWindow(viewSource, target);
  }

  override setStorageItems(items: {[key: string]: unknown}): Promise<void> {
    return this.storage.set(items);
  }

  override getStorageItems(items: string[]): Promise<{[key: string]: unknown}> {
    return this.storage.get(items);
  }

  override removeStorageItems(items: string[]): Promise<void> {
    return this.storage.remove(items);
  }

  private runInInspectedWindow(script: string, target: Frame) {
    if (this.platform.FIREFOX && target.id !== TOP_LEVEL_FRAME_ID) {
      console.error(
        '[Angular DevTools]: This browser does not support targeting a specific frame for eval by URL.',
      );
      return;
    } else if (this.platform.FIREFOX) {
      chrome.devtools.inspectedWindow.eval(script);
      return;
    }

    const frameURL = target.url;
    chrome.devtools.inspectedWindow.eval(script, {frameURL: frameURL?.toString?.()});
  }

  private get storage(): typeof browser.storage.local {
    if (!this.platform.FIREFOX) {
      return chrome.storage.local;
    }
    return browser.storage.local;
  }
}
