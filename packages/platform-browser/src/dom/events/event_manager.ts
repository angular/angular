/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵgetDOM as getDOM} from '@angular/common';
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
    plugins.forEach(p => p.manager = this);
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
    const eventNameWithOptions = this._splitEventNameAndOptions(eventName);
    return plugin.addEventListener(
        element, eventNameWithOptions.eventName, handler, eventNameWithOptions.options);
  }

  /**
   * Registers a global handler for an event in a target view.
   *
   * @param target A target for global event notifications. One of "window", "document", or "body".
   * @param eventName The name of the event to listen for.
   * @param handler A function to call when the notification occurs. Receives the
   * event object as an argument.
   * @returns A callback function that can be used to remove the handler.
   */
  addGlobalEventListener(target: string, eventName: string, handler: Function): Function {
    const plugin = this._findPluginFor(eventName);
    const eventNameWithOptions = this._splitEventNameAndOptions(eventName);
    return plugin.addGlobalEventListener(
        target, eventNameWithOptions.eventName, handler, eventNameWithOptions.options);
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

  /** @internal */
  _splitEventNameAndOptions(eventName: string):
      {eventName: string, options?: EventManagerPluginOptions} {
    const parts: string[] = eventName.split('.');
    let domEventName = parts.shift();
    const r: {eventName: string, options?: EventManagerPluginOptions} = {eventName: domEventName!};
    parts.forEach(p => {
      const pLower = p.toLowerCase();
      if (!r.options &&
          (pLower === 'capture' || pLower === 'once' || pLower === 'passive' ||
           pLower === 'ngzone' || pLower === 'noopzone')) {
        r.options = {};
      }
      if (pLower === 'capture') {
        r.options!.capture = true;
      } else if (pLower === 'once') {
        r.options!.once = true;
      } else if (pLower === 'passive') {
        r.options!.passive = true;
      } else if (pLower === 'ngzone') {
        r.options!.zone = 'ngZone';
      } else if (pLower === 'noopzone') {
        r.options!.zone = 'noopZone';
      } else {
        // combine the part with eventName
        // since Angular supports the eventName with modifier such as `keydown.enter`.
        r.eventName += `.${p}`;
      }
    });
    return r;
  }
}

/**
 * Event Manager Plugin listener options.
 * The options includes the following keys.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener}
 * 1. capture: indicate `capture` option of `addEventListener`, default is `false`.
 * 2. once: indicate `once` option of `addEventListener`, default is `false`.
 * 3. passive: indicate `passive` option of `addEventListener`, default is `false`.
 * 4. zone: a string indicating the Zone that the event handler want to run into, by default, the
 * event handler will run into the Zone when the handler is registered. The available options are
 *    - ngZone: force the event handler run into angular zone.
 *    - noop: force the event handler run outside of angular zone.
 *
 * @publicApi
 */
export interface EventManagerPluginOptions {
  capture?: boolean;
  once?: boolean;
  passive?: boolean;
  zone?: 'ngZone'|'noopZone';
}

export abstract class EventManagerPlugin {
  constructor(private _doc: any) {}

  // TODO(issue/24571): remove '!'.
  manager!: EventManager;

  abstract supports(eventName: string): boolean;

  abstract addEventListener(
      element: HTMLElement, eventName: string, handler: Function,
      options?: EventManagerPluginOptions): Function;

  addGlobalEventListener(
      element: string, eventName: string, handler: Function,
      options?: EventManagerPluginOptions): Function {
    const target: HTMLElement = getDOM().getGlobalEventTarget(this._doc, element);
    if (!target) {
      throw new Error(`Unsupported event target ${target} for event ${eventName}`);
    }
    return this.addEventListener(target, eventName, handler, options);
  }
}
