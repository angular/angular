/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, Injectable, InjectionToken, NgZone} from '@angular/core';

/**
 * The injection token for the event-manager plug-in service.
 *
 * @publicApi
 */
export const EVENT_MANAGER_PLUGINS =
    new InjectionToken<EventManagerPlugin[]>('EventManagerPlugins');

/**
 * An injectable service that provides event management for Angular
 * through a browser plug-in.
 *
 * @publicApi
 */
@Injectable()
export class EventManager {
  private _plugins: EventManagerPlugin[];
  private _eventNameToPlugin = new Map<string, EventManagerPlugin>();

  /**
   * Initializes an instance of the event-manager service.
   */
  constructor(@Inject(EVENT_MANAGER_PLUGINS) plugins: EventManagerPlugin[], private _zone: NgZone) {
    plugins.forEach((plugin) => {
      plugin.manager = this;
    });
    this._plugins = plugins.slice().reverse();
  }

  /**
   * Registers a handler for a specific element and event.
   *
   * @param element The HTML element to receive event notifications.
   * @param eventName The name of the event to listen for.
   * @param handler A function to call when the notification occurs. Receives the
   * event object as an argument.
   * @returns  A callback function that can be used to remove the handler.
   */
  addEventListener(element: HTMLElement, eventName: string, handler: Function): Function {
    const plugin = this._findPluginFor(eventName);
    return plugin.addEventListener(element, eventName, handler);
  }

  /**
   * Retrieves the compilation zone in which event listeners are registered.
   */
  getZone(): NgZone {
    return this._zone;
  }

  /** @internal */
  _findPluginFor(eventName: string): EventManagerPlugin {
    const plugin = this._eventNameToPlugin.get(eventName);
    if (plugin) {
      return plugin;
    }

    const plugins = this._plugins;
    for (let i = 0; i < plugins.length; i++) {
      const plugin = plugins[i];
      if (plugin.supports(eventName)) {
        this._eventNameToPlugin.set(eventName, plugin);
        return plugin;
      }
    }
    throw new Error(`No event manager plugin found for event ${eventName}`);
  }
}

export abstract class EventManagerPlugin {
  constructor(private _doc: any) {}

  // Using non-null assertion because it's set by EventManager's constructor
  manager!: EventManager;

  abstract supports(eventName: string): boolean;

  abstract addEventListener(element: HTMLElement, eventName: string, handler: Function): Function;
}
