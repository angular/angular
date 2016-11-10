/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, Injectable, NgZone, OpaqueToken} from '@angular/core';
import {getDOM} from '../dom_adapter';

/**
 * @stable
 */
export const EVENT_MANAGER_PLUGINS: OpaqueToken = new OpaqueToken('EventManagerPlugins');

/**
 * @stable
 */
@Injectable()
export class EventManager {
  private _plugins: EventManagerPlugin[];

  constructor(@Inject(EVENT_MANAGER_PLUGINS) plugins: EventManagerPlugin[], private _zone: NgZone) {
    plugins.forEach(p => p.manager = this);
    this._plugins = plugins.slice().reverse();
  }

  addEventListener(element: HTMLElement, eventName: string, handler: Function): Function {
    const plugin = this._findPluginFor(eventName);
    return plugin.addEventListener(element, eventName, handler);
  }

  addGlobalEventListener(target: string, eventName: string, handler: Function): Function {
    const plugin = this._findPluginFor(eventName);
    return plugin.addGlobalEventListener(target, eventName, handler);
  }

  getZone(): NgZone { return this._zone; }

  /** @internal */
  _findPluginFor(eventName: string): EventManagerPlugin {
    const plugins = this._plugins;
    for (let i = 0; i < plugins.length; i++) {
      const plugin = plugins[i];
      if (plugin.supports(eventName)) {
        return plugin;
      }
    }
    throw new Error(`No event manager plugin found for event ${eventName}`);
  }
}

export abstract class EventManagerPlugin {
  manager: EventManager;

  abstract supports(eventName: string): boolean;

  abstract addEventListener(element: HTMLElement, eventName: string, handler: Function): Function;

  addGlobalEventListener(element: string, eventName: string, handler: Function): Function {
    const target: HTMLElement = getDOM().getGlobalEventTarget(element);
    if (!target) {
      throw new Error(`Unsupported event target ${target} for event ${eventName}`);
    }
    return this.addEventListener(target, eventName, handler);
  };
}
