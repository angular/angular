/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Inject,
  Injectable,
  InjectionToken,
  NgZone,
  ɵRuntimeError as RuntimeError,
  type ListenerOptions,
} from '@angular/core';

import {RuntimeErrorCode} from '../../errors';

import type {EventManagerPlugin} from './event_manager_plugin';

import {DomEventsPlugin} from './dom_events';

/**
 * The injection token for plugins of the `EventManager` service.
 *
 * @see [Extend event handling](guide/templates/event-listeners#extend-event-handling)
 *
 * @publicApi
 */
export const EVENT_MANAGER_PLUGINS = new InjectionToken<EventManagerPlugin[]>(
  typeof ngDevMode !== 'undefined' && ngDevMode ? 'EventManagerPlugins' : '',
);

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
  constructor(
    @Inject(EVENT_MANAGER_PLUGINS) plugins: EventManagerPlugin[],
    private _zone: NgZone,
  ) {
    plugins.forEach((plugin) => {
      plugin.manager = this;
    });

    const otherPlugins = plugins.filter((p) => !(p instanceof DomEventsPlugin));
    this._plugins = otherPlugins.slice().reverse();

    // DomEventsPlugin.supports() always returns true, it should always be the last plugin.
    const domEventPlugin = plugins.find((p) => p instanceof DomEventsPlugin);
    if (domEventPlugin) {
      this._plugins.push(domEventPlugin);
    }
  }

  /**
   * Registers a handler for a specific element and event.
   *
   * @param element The HTML element to receive event notifications.
   * @param eventName The name of the event to listen for.
   * @param handler A function to call when the notification occurs. Receives the
   * event object as an argument.
   * @param options Options that configure how the event listener is bound.
   * @returns  A callback function that can be used to remove the handler.
   */
  addEventListener(
    element: HTMLElement,
    eventName: string,
    handler: Function,
    options?: ListenerOptions,
  ): Function {
    const parsedEvent = parseEventName(eventName);
    const plugin = this._findPluginFor(parsedEvent.eventName);
    return plugin.addEventListener(
      element,
      parsedEvent.eventName,
      parsedEvent.prevent || parsedEvent.stop ? applyEventModifiers(handler, parsedEvent) : handler,
      options,
    );
  }

  /**
   * Retrieves the compilation zone in which event listeners are registered.
   */
  getZone(): NgZone {
    return this._zone;
  }

  /** @internal */
  _findPluginFor(eventName: string): EventManagerPlugin {
    let plugin = this._eventNameToPlugin.get(eventName);
    if (plugin) {
      return plugin;
    }

    const plugins = this._plugins;
    plugin = plugins.find((plugin) => plugin.supports(eventName));
    if (!plugin) {
      throw new RuntimeError(
        RuntimeErrorCode.NO_PLUGIN_FOR_EVENT,
        (typeof ngDevMode === 'undefined' || ngDevMode) &&
          `No event manager plugin found for event ${eventName}`,
      );
    }

    this._eventNameToPlugin.set(eventName, plugin);
    return plugin;
  }
}

function parseEventName(eventName: string): {eventName: string; prevent: boolean; stop: boolean} {
  const [name, ...modifiers] = eventName.split('.');
  if (modifiers.length === 0) {
    return {eventName, prevent: false, stop: false};
  }

  let prevent = false;
  let stop = false;
  for (const modifier of modifiers) {
    if (modifier === 'prevent') {
      prevent = true;
    } else if (modifier === 'stop') {
      stop = true;
    } else {
      return {eventName, prevent: false, stop: false};
    }
  }

  return {eventName: name, prevent, stop};
}

function applyEventModifiers(
  handler: Function,
  {prevent, stop}: {prevent: boolean; stop: boolean},
): Function {
  return (event: Event) => {
    if (prevent) {
      event.preventDefault();
    }
    if (stop) {
      event.stopPropagation();
    }
    return handler(event);
  };
}
