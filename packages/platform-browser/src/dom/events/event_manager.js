/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate, __param} from 'tslib';
import {Inject, Injectable, InjectionToken, ɵRuntimeError as RuntimeError} from '@angular/core';
/**
 * The injection token for plugins of the `EventManager` service.
 *
 * @publicApi
 */
export const EVENT_MANAGER_PLUGINS = new InjectionToken(
  typeof ngDevMode !== undefined && ngDevMode ? 'EventManagerPlugins' : '',
);
/**
 * An injectable service that provides event management for Angular
 * through a browser plug-in.
 *
 * @publicApi
 */
let EventManager = class EventManager {
  /**
   * Initializes an instance of the event-manager service.
   */
  constructor(plugins, _zone) {
    this._zone = _zone;
    this._eventNameToPlugin = new Map();
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
   * @param options Options that configure how the event listener is bound.
   * @returns  A callback function that can be used to remove the handler.
   */
  addEventListener(element, eventName, handler, options) {
    const plugin = this._findPluginFor(eventName);
    return plugin.addEventListener(element, eventName, handler, options);
  }
  /**
   * Retrieves the compilation zone in which event listeners are registered.
   */
  getZone() {
    return this._zone;
  }
  /** @internal */
  _findPluginFor(eventName) {
    let plugin = this._eventNameToPlugin.get(eventName);
    if (plugin) {
      return plugin;
    }
    const plugins = this._plugins;
    plugin = plugins.find((plugin) => plugin.supports(eventName));
    if (!plugin) {
      throw new RuntimeError(
        5101 /* RuntimeErrorCode.NO_PLUGIN_FOR_EVENT */,
        (typeof ngDevMode === 'undefined' || ngDevMode) &&
          `No event manager plugin found for event ${eventName}`,
      );
    }
    this._eventNameToPlugin.set(eventName, plugin);
    return plugin;
  }
};
EventManager = __decorate([Injectable(), __param(0, Inject(EVENT_MANAGER_PLUGINS))], EventManager);
export {EventManager};
/**
 * The plugin definition for the `EventManager` class
 *
 * It can be used as a base class to create custom manager plugins, i.e. you can create your own
 * class that extends the `EventManagerPlugin` one.
 *
 * @publicApi
 */
export class EventManagerPlugin {
  // TODO: remove (has some usage in G3)
  constructor(_doc) {
    this._doc = _doc;
  }
}
//# sourceMappingURL=event_manager.js.map
