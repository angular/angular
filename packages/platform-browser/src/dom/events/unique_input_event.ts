/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT} from '@angular/common';
import {Inject, Injectable, InjectionToken, Optional} from '@angular/core';

import {EventManagerPlugin} from './event_manager';

/**
 * The injection token for enabling unique input event plugin.
 *
 * @publicApi
 */
export const UNIQUE_INPUT_EVENT_PLUGIN_CONFIG =
    new InjectionToken<UniqueInputEventPluginConfig>('UniqueInputEventPluginConfig');

/**
 * @publicApi
 */
export interface UniqueInputEventPluginConfig {
  /**
   * Function that determines that plugin should be applied to element
   * Default is HTMLInputElement or HTMLTextAreaElement
   */
  shouldApplyToElement?(element: Element): boolean;
  /**
   * Function that determines that event is not require check for uniqueness
   * By default, all non user agent events is trusted
   */
  shouldTrustEvent?(event: Event): boolean;
}


const DEFAULT_UNIQUE_INPUT_EVENT_PLUGIN_CONFIG: UniqueInputEventPluginConfig = {
  shouldApplyToElement: (element: HTMLElement) => {
    return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement;
  },
  /** Trust all non user agent events */
  shouldTrustEvent: (event: Event) => !event.isTrusted,
};


/**
 * @description
 *
 * This plugin checks if value of element is changed before firing input event
 *
 * Internet Explorer 10+ implements 'input' event but it erroneously fires under various situations,
 * e.g. when placeholder changes, when non english placeholder is used or a control is focused.
 * Fixed only from Edge 15.15002
 * https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/101220
 * Will not be fixed in Internet Explorer
 * https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/11405058/
 *
 * @usageNotes
 * ### Example
 *
 * ```
 * @NgModule({
 *   providers: [{
 *      provide: EVENT_MANAGER_PLUGINS, multi: true,
 *      useClass: UniqueInputEventPlugin, deps: [DOCUMENT],
 *   }]
 * })
 * class MyModule {}
 * ```
 *
 * If there is a need to control when the plugin will be enabled (for example, IE 10+),
 * use `FactoryProvider` instead of `ClassProvider`
 *
 * @publicApi
 */
@Injectable()
export class UniqueInputEventPlugin extends EventManagerPlugin {
  private _config?: UniqueInputEventPluginConfig;

  constructor(
      @Inject(DOCUMENT) private _document: any,
      @Optional() @Inject(UNIQUE_INPUT_EVENT_PLUGIN_CONFIG) config?: UniqueInputEventPluginConfig) {
    super(_document);

    if (config) {
      this._config = {...DEFAULT_UNIQUE_INPUT_EVENT_PLUGIN_CONFIG, ...config};
    }
  }

  supports(eventName: string): boolean { return !!(this._config) && eventName === 'input'; }


  addEventListener(
      element: HTMLElement, eventName: string,
      originalHandler: (event: Event) => void): () => void {
    if (this._config && this._config.shouldApplyToElement &&
        this._config.shouldApplyToElement(element)) {
      const targetElement = element as HTMLElement & {value?: any};

      let value = targetElement.value;

      /**
       * Keydown event type MUST be dispatched before the beforeinput, input,
       * and keyup events associated with the same key.
       * https://www.w3.org/TR/uievents/#keydown
       */
      const keydownHandler = () => { value = targetElement.value; };

      const inputHandler = (event: Event) => {
        /**
         * Event is trusted
         * OR element.value changed after listener added
         * OR element.value changed after input
         * OR element.value changed after keydown
         */
        if ((this._config && this._config.shouldTrustEvent &&
             this._config.shouldTrustEvent(event)) ||
            targetElement.value !== value) {
          value = targetElement.value;
          originalHandler(event);
        }
      };

      element.addEventListener('keydown', keydownHandler, false);
      element.addEventListener(eventName, inputHandler, false);
      return () => {
        element.removeEventListener(eventName, inputHandler, false);
        element.removeEventListener('keydown', keydownHandler, false);
      };
    }

    element.addEventListener(eventName, originalHandler, false);
    return () => element.removeEventListener(eventName, originalHandler, false);
  }
}
