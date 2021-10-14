/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgZone} from '@angular/core';
import {InteractivityChecker} from '../interactivity-checker/interactivity-checker';
import {FocusTrap} from './focus-trap';
import {FocusTrapManager, ManagedFocusTrap} from './focus-trap-manager';
import {FocusTrapInertStrategy} from './focus-trap-inert-strategy';
import {ConfigurableFocusTrapConfig} from './configurable-focus-trap-config';

/**
 * Class that allows for trapping focus within a DOM element.
 *
 * This class uses a strategy pattern that determines how it traps focus.
 * See FocusTrapInertStrategy.
 */
export class ConfigurableFocusTrap extends FocusTrap implements ManagedFocusTrap {
  /** Whether the FocusTrap is enabled. */
  override get enabled(): boolean {
    return this._enabled;
  }
  override set enabled(value: boolean) {
    this._enabled = value;
    if (this._enabled) {
      this._focusTrapManager.register(this);
    } else {
      this._focusTrapManager.deregister(this);
    }
  }

  constructor(
    _element: HTMLElement,
    _checker: InteractivityChecker,
    _ngZone: NgZone,
    _document: Document,
    private _focusTrapManager: FocusTrapManager,
    private _inertStrategy: FocusTrapInertStrategy,
    config: ConfigurableFocusTrapConfig,
  ) {
    super(_element, _checker, _ngZone, _document, config.defer);
    this._focusTrapManager.register(this);
  }

  /** Notifies the FocusTrapManager that this FocusTrap will be destroyed. */
  override destroy() {
    this._focusTrapManager.deregister(this);
    super.destroy();
  }

  /** @docs-private Implemented as part of ManagedFocusTrap. */
  _enable() {
    this._inertStrategy.preventFocus(this);
    this.toggleAnchors(true);
  }

  /** @docs-private Implemented as part of ManagedFocusTrap. */
  _disable() {
    this._inertStrategy.allowFocus(this);
    this.toggleAnchors(false);
  }
}
