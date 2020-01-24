/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT} from '@angular/common';
import {
  Inject,
  Injectable,
  Optional,
  NgZone,
} from '@angular/core';
import {InteractivityChecker} from '../interactivity-checker/interactivity-checker';
import {ConfigurableFocusTrap} from './configurable-focus-trap';
import {ConfigurableFocusTrapConfig} from './configurable-focus-trap-config';
import {FOCUS_TRAP_INERT_STRATEGY, FocusTrapInertStrategy} from './focus-trap-inert-strategy';
import {EventListenerFocusTrapInertStrategy} from './event-listener-inert-strategy';
import {FocusTrapManager} from './focus-trap-manager';

/** Factory that allows easy instantiation of configurable focus traps. */
@Injectable({providedIn: 'root'})
export class ConfigurableFocusTrapFactory {
  private _document: Document;
  private _inertStrategy: FocusTrapInertStrategy;

  constructor(
      private _checker: InteractivityChecker,
      private _ngZone: NgZone,
      private _focusTrapManager: FocusTrapManager,
      @Inject(DOCUMENT) _document: any,
      @Optional() @Inject(FOCUS_TRAP_INERT_STRATEGY) _inertStrategy?: FocusTrapInertStrategy) {

    this._document = _document;
    // TODO split up the strategies into different modules, similar to DateAdapter.
    this._inertStrategy = _inertStrategy || new EventListenerFocusTrapInertStrategy();
  }

  /**
   * Creates a focus-trapped region around the given element.
   * @param element The element around which focus will be trapped.
   * @param deferCaptureElements Defers the creation of focus-capturing elements to be done
   *     manually by the user.
   * @returns The created focus trap instance.
   */
  create(element: HTMLElement, config: ConfigurableFocusTrapConfig =
    new ConfigurableFocusTrapConfig()): ConfigurableFocusTrap {
    return new ConfigurableFocusTrap(
        element, this._checker, this._ngZone, this._document, this._focusTrapManager,
        this._inertStrategy, config);
  }
}
