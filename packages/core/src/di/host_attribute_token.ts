/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ɵɵinjectAttribute} from '../render3/instructions/di_attr';

/**
 * Creates a token that can be used to inject static attributes of the host node.
 *
 * @usageNotes
 * ### Injecting an attribute that is known to exist
 * ```ts
 * @Directive()
 * class MyDir {
 *   attr: string = inject(new HostAttributeToken('some-attr'));
 * }
 * ```
 *
 * ### Optionally injecting an attribute
 * ```ts
 * @Directive()
 * class MyDir {
 *   attr: string | null = inject(new HostAttributeToken('some-attr'), {optional: true});
 * }
 * ```
 * @publicApi
 */
export class HostAttributeToken {
  constructor(private attributeName: string) {}

  /** @internal */
  __NG_ELEMENT_ID__ = () => ɵɵinjectAttribute(this.attributeName);

  toString(): string {
    return `HostAttributeToken ${this.attributeName}`;
  }
}
