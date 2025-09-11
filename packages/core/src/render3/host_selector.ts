/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {parseSelectorStringToCssSelector} from './component_parse_selector';
import {CssSelectorList} from './interfaces/projection';

export interface HostSelector {
  /**
   * Callback that will be invoked during selector matching.
   */
  parse(): CssSelectorList;
}

/**
 * Match a host selector for dynamic component instantiation.
 * @param selector Selector string allowed in the `@Component` decorator
 *
 * ### Usage Example
 * By default `createComponent` uses the first selector element.
 * In this example we create an instance of the `MatButton` and target
 * elements with the 'a[mat-stroked-button]' selector.
 *
 * ```
 * @Component({
 *   selector: `
 *     button[matButton], a[matButton], button[mat-button], button[mat-raised-button],
 *     button[mat-flat-button], button[mat-stroked-button], a[mat-button], a[mat-raised-button],
 *     a[mat-flat-button], a[mat-stroked-button]
 *   `,
 * })
 * export class MatButton {}
 *
 * const buttonComponent = createComponent(MatButton, {
 *   environmentInjector: this.injector,
 *   selector: hostSelector('a[mat-stroked-button]')
 * });
 * ```
 */
export function hostSelector(selector: string): HostSelector {
  const hostSelector: HostSelector = {
    parse: () => parseSelectorStringToCssSelector(selector),
  };

  return hostSelector;
}
