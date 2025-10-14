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
import {ApplicationOperations, TOP_LEVEL_FRAME_ID} from '../../../ng-devtools';
export class ChromeApplicationOperations extends ApplicationOperations {
  constructor() {
    super(...arguments);
    this.platform = inject(Platform);
  }
  viewSource(position, target, directiveIndex) {
    const viewSource = `inspect(inspectedApplication.findConstructorByPosition('${position}', ${directiveIndex}))`;
    this.runInInspectedWindow(viewSource, target);
  }
  selectDomElement(position, target) {
    const selectDomElement = `inspect(inspectedApplication.findDomElementByPosition('${position}'))`;
    this.runInInspectedWindow(selectDomElement, target);
  }
  inspect(directivePosition, objectPath, target) {
    const args = {
      directivePosition,
      objectPath,
    };
    const inspect = `inspect(inspectedApplication.findPropertyByPosition('${JSON.stringify(args)}'))`;
    this.runInInspectedWindow(inspect, target);
  }
  inspectSignal(position, target) {
    const inspectSignal = `inspect(inspectedApplication.findSignalNodeByPosition('${JSON.stringify(position)}'))`;
    this.runInInspectedWindow(inspectSignal, target);
  }
  viewSourceFromRouter(name, type, target) {
    const viewSource = `inspect(inspectedApplication.findConstructorByNameForRouter('${name}', '${type}'))`;
    this.runInInspectedWindow(viewSource, target);
  }
  setStorageItems(items) {
    return this.storage.set(items);
  }
  getStorageItems(items) {
    return this.storage.get(items);
  }
  removeStorageItems(items) {
    return this.storage.remove(items);
  }
  runInInspectedWindow(script, target) {
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
  get storage() {
    if (!this.platform.FIREFOX) {
      return chrome.storage.local;
    }
    return browser.storage.local;
  }
}
//# sourceMappingURL=chrome-application-operations.js.map
