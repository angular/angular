/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TNodeType} from '../render3/interfaces/node';
import {getCurrentTNode} from '../render3/state';

function injectTagName(): string|null {
  const tNode = getCurrentTNode()!;
  return tNode.type === TNodeType.Element ? tNode.value as string : null;
}

/**
 * Creates a token that can be used to inject the tag name of the host node.
 *
 * @usageNotes
 * ### Injecting a tag name that is known to exist
 * ```typescript
 * @Directive()
 * class MyDir {
 *   tagName: string = inject(new HostTagNameToken());
 * }
 * ```
 *
 * ### Optionally injecting an a tag name
 * ```typescript
 * @Directive()
 * class MyDir {
 *   tagName: string | null = inject(new HostTagNameToken(), {optional: true});
 * }
 * ```
 * @publicApi
 */
export class HostTagNameToken {
  constructor() {}

  /**
   * @internal
   * @nocollapse
   */
  __NG_ELEMENT_ID__: typeof injectTagName = injectTagName;

  toString(): string {
    return 'HostTagNameToken';
  }
}
