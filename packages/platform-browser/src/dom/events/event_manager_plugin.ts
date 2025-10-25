/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {ListenerOptions} from '@angular/core';
import type {EventManager} from './event_manager';

/**
 * The plugin definition for the `EventManager` class
 *
 * It can be used as a base class to create custom manager plugins, i.e. you can create your own
 * class that extends the `EventManagerPlugin` one.
 *
 * @see [Extend event handling](guide/templates/event-listeners#extend-event-handling)
 *
 * @publicApi
 */
export abstract class EventManagerPlugin {
  // TODO: remove (has some usage in G3)
  constructor(private _doc: any) {}

  // Using non-null assertion because it's set by EventManager's constructor
  manager!: EventManager;

  /**
   * Should return `true` for every event name that should be supported by this plugin
   */
  abstract supports(eventName: string): boolean;

  /**
   * Implement the behaviour for the supported events
   */
  abstract addEventListener(
    element: HTMLElement,
    eventName: string,
    handler: Function,
    options?: ListenerOptions,
  ): Function;
}
