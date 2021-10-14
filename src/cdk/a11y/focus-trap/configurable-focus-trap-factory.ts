/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT} from '@angular/common';
import {Inject, Injectable, Optional, NgZone} from '@angular/core';
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
    @Optional() @Inject(FOCUS_TRAP_INERT_STRATEGY) _inertStrategy?: FocusTrapInertStrategy,
  ) {
    this._document = _document;
    // TODO split up the strategies into different modules, similar to DateAdapter.
    this._inertStrategy = _inertStrategy || new EventListenerFocusTrapInertStrategy();
  }

  /**
   * Creates a focus-trapped region around the given element.
   * @param element The element around which focus will be trapped.
   * @param config The focus trap configuration.
   * @returns The created focus trap instance.
   */
  create(element: HTMLElement, config?: ConfigurableFocusTrapConfig): ConfigurableFocusTrap;

  /**
   * @deprecated Pass a config object instead of the `deferCaptureElements` flag.
   * @breaking-change 11.0.0
   */
  create(element: HTMLElement, deferCaptureElements: boolean): ConfigurableFocusTrap;

  create(
    element: HTMLElement,
    config: ConfigurableFocusTrapConfig | boolean = {defer: false},
  ): ConfigurableFocusTrap {
    let configObject: ConfigurableFocusTrapConfig;
    if (typeof config === 'boolean') {
      configObject = {defer: config};
    } else {
      configObject = config;
    }
    return new ConfigurableFocusTrap(
      element,
      this._checker,
      this._ngZone,
      this._document,
      this._focusTrapManager,
      this._inertStrategy,
      configObject,
    );
  }
}
