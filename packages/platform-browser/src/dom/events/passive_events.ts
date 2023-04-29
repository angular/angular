/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT} from '@angular/common';
import {inject, Injectable} from '@angular/core';

import {EventManagerPlugin} from './event_manager';

/**
 * @publicApi
 * A browser plug-in that provides support for handling of passive event listeners in Angular.
 */
@Injectable()
export class PassiveListenersPlugin extends EventManagerPlugin {
  /**
   * Initializes an instance of the browser plug-in.
   * @param doc The document in which the events will be detected.
   */
  constructor() {
    super(inject(DOCUMENT));
  }

  /**
   * Reports whether a named event is supported.
   * @param eventName The event name to query.
   * @return True if the named event is supported.
   */
  override supports(eventName: string): boolean {
    return eventName.endsWith('.passive');
  }

  override addEventListener(
      element: HTMLElement, eventName: string, handler: (event: Event) => void): Function {
    // striping the passive modifier from the event name;
    const nonModifiedEventName = eventName.replace(/\.passive$/, '');

    element.addEventListener(nonModifiedEventName, handler as EventListener, {passive: true});
    return () => element.removeEventListener(eventName, handler as EventListener);
  }
}
