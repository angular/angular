/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="chrome"/>

import {ApplicationOperations} from 'ng-devtools';
import {DirectivePosition, ElementPosition} from 'protocol';

export class ChromeApplicationOperations extends ApplicationOperations {
  viewSource(position: ElementPosition, directiveIndex: number): void {
    if (chrome.devtools) {
      chrome.devtools.inspectedWindow.eval(
          `inspect(inspectedApplication.findConstructorByPosition('${position}', ${
              directiveIndex}))`);
    }
  }

  selectDomElement(position: ElementPosition): void {
    if (chrome.devtools) {
      chrome.devtools.inspectedWindow.eval(
          `inspect(inspectedApplication.findDomElementByPosition('${position}'))`);
    }
  }

  inspect(directivePosition: DirectivePosition, objectPath: string[]): void {
    if (chrome.devtools) {
      const args = {
        directivePosition,
        objectPath,
      };
      chrome.devtools.inspectedWindow.eval(
          `inspect(inspectedApplication.findPropertyByPosition('${JSON.stringify(args)}'))`);
    }
  }
}
