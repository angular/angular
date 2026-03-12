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

export class ChromeApplicationOperations extends ApplicationOperations {
  platform = inject(Platform);

  override viewSource(position: ElementPosition, target: Frame, directiveIndex?: number): void {
    const viewSource = `inspect(inspectedApplication.findConstructorByPosition('${position}', ${directiveIndex}))`;
    this.runInInspectedWindow(viewSource, target);
  }

  override selectDomElement(position: ElementPosition, target: Frame): void {
    const selectDomElement = `inspect(inspectedApplication.findDomElementByPosition('${position}'))`;
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
    const inspect = `inspect(inspectedApplication.findPropertyByPosition('${JSON.stringify(
      args,
    )}'))`;
    this.runInInspectedWindow(inspect, target);
  }

  override inspectSignal(position: SignalNodePosition, target: Frame): void {
    const inspectSignal = `inspect(inspectedApplication.findSignalNodeByPosition('${JSON.stringify(
      position,
    )}'))`;
    this.runInInspectedWindow(inspectSignal, target);
  }

  override viewSourceFromRouter(name: string, type: string, target: Frame): void {
    const viewSource = `inspect(inspectedApplication.findConstructorByNameForRouter('${name}', '${type}'))`;
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
