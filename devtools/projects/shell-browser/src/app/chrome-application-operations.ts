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

function runInInspectedWindow(script: string, frameURL?: URL): void {
  chrome.devtools.inspectedWindow.eval(script, {frameURL: frameURL?.toString?.()});
}

export class ChromeApplicationOperations extends ApplicationOperations {
  override viewSource(position: ElementPosition, directiveIndex?: number, target?: URL): void {
    const viewSource = `inspect(inspectedApplication.findConstructorByPosition('${position}', ${directiveIndex}))`;
    runInInspectedWindow(viewSource, target);
  }

  override selectDomElement(position: ElementPosition, target?: URL): void {
    const selectDomElement = `inspect(inspectedApplication.findDomElementByPosition('${position}'))`;
    runInInspectedWindow(selectDomElement, target);
  }

  override inspect(directivePosition: DirectivePosition, objectPath: string[], target?: URL): void {
    const args = {
      directivePosition,
      objectPath,
    };
    const inspect = `inspect(inspectedApplication.findPropertyByPosition('${JSON.stringify(
      args,
    )}'))`;
    runInInspectedWindow(inspect, target);
  }
}
