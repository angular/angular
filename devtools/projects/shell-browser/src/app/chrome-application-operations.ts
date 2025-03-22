/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/// <reference types="chrome"/>

import {ApplicationOperations, Frame, TOP_LEVEL_FRAME_ID} from 'ng-devtools';
import {DirectivePosition, ElementPosition} from 'protocol';

function runInInspectedWindow(script: string, target?: Frame): void {
  const frameURL = target?.url;
  try {
    chrome.devtools.inspectedWindow.eval(script, {frameURL: frameURL?.toString?.()});
  } catch (e) {
    // feature sniff for frameURL support
    if (e instanceof Error && e.message.includes('frameURL')) {
      // Firefox throws an error when `frameURL` is provided.
      if (target?.id === TOP_LEVEL_FRAME_ID) {
        chrome.devtools.inspectedWindow.eval(script);
      } else {
        console.error(
          '[Angular DevTools]: This browser does not support targeting a specific frame for eval by URL.',
        );
        throw e;
      }
    } else {
      throw e;
    }
  }
}

export class ChromeApplicationOperations extends ApplicationOperations {
  override viewSource(position: ElementPosition, directiveIndex?: number, target?: Frame): void {
    const viewSource = `inspect(inspectedApplication.findConstructorByPosition('${position}', ${directiveIndex}))`;
    runInInspectedWindow(viewSource, target);
  }

  override selectDomElement(position: ElementPosition, target?: Frame): void {
    const selectDomElement = `inspect(inspectedApplication.findDomElementByPosition('${position}'))`;
    runInInspectedWindow(selectDomElement, target);
  }

  override inspect(
    directivePosition: DirectivePosition,
    objectPath: string[],
    target?: Frame,
  ): void {
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
