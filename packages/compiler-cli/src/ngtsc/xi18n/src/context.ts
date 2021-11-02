/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InterpolationConfig} from '@angular/compiler';

/**
 * Captures template information intended for extraction of i18n messages from a template.
 *
 * This interface is compatible with the View Engine compiler's `MessageBundle` class, which is used
 * to implement xi18n for VE. Due to the dependency graph of ngtsc, an interface is needed as it
 * can't depend directly on `MessageBundle`.
 */
export interface Xi18nContext {
  /**
   * Capture i18n messages from the template.
   *
   * In `MessageBundle` itself, this returns any `ParseError`s from the template. In this interface,
   * the return type is declared as `void` for simplicity, since any parse errors would be reported
   * as diagnostics anyway.
   */
  updateFromTemplate(html: string, url: string, interpolationConfig: InterpolationConfig): void;
}
