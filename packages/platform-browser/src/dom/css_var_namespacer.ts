/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {inject, Injectable} from '@angular/core';
import {CSS_VAR_NAMESPACE} from './dom_renderer';

/**
 * A service that can be used to manually namespace CSS variable names at runtime.
 * This is useful when reading or setting CSS variables dynamically in JavaScript that
 * were transformed by the compiler during the build.
 *
 * @publicApi
 */
@Injectable({providedIn: 'root'})
export class CssVarNamespacer {
  private readonly namespacePrefix = inject(CSS_VAR_NAMESPACE, {optional: true}) ?? '';

  /**
   * Prepends the namespace prefix to a CSS variable name.
   *
   * @param name The CSS variable name to namespace, including the leading `--`.
   * @returns The namespaced CSS variable name, including the leading `--`. Returns the input
   *     unchanged if no namespace is configured.
   */
  namespace(name: string): string {
    // Validate that the whole `--foo` variable is passed in.
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      if (!name.startsWith('--')) {
        throw new Error(
          `CSS variable names passed to \`CssVarNamespacer\` must start with '--', got: '${name}'`,
        );
      }
    }

    // We want to support libraries which might be used by applications which do and don't
    // namespace variables. Therefore the library always needs to use `CssVarNamespacer`, even
    // though the application may not actually be namespacing anything.
    if (!this.namespacePrefix) return name;

    return `--${this.namespacePrefix}${name.substring('--'.length)}`;
  }
}
