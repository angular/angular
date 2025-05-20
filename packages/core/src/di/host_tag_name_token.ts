/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {RuntimeError, RuntimeErrorCode} from '../errors';
import {TNode, TNodeType} from '../render3/interfaces/node';
import {getCurrentTNode} from '../render3/state';

import {InjectionToken} from './injection_token';
import {InternalInjectFlags} from './interface/injector';

/**
 * A token that can be used to inject the tag name of the host node.
 *
 * @usageNotes
 * ### Injecting a tag name that is known to exist
 * ```ts
 * @Directive()
 * class MyDir {
 *   tagName: string = inject(HOST_TAG_NAME);
 * }
 * ```
 *
 * ### Optionally injecting a tag name
 * ```ts
 * @Directive()
 * class MyDir {
 *   tagName: string | null = inject(HOST_TAG_NAME, {optional: true});
 * }
 * ```
 * @publicApi
 */
export const HOST_TAG_NAME = new InjectionToken<string>(ngDevMode ? 'HOST_TAG_NAME' : '');

// HOST_TAG_NAME should be resolved at the current node, similar to e.g. ElementRef,
// so we manually specify __NG_ELEMENT_ID__ here, instead of using a factory.
// tslint:disable-next-line:no-toplevel-property-access
(HOST_TAG_NAME as any).__NG_ELEMENT_ID__ = (flags: InternalInjectFlags) => {
  const tNode = getCurrentTNode();
  if (tNode === null) {
    throw new RuntimeError(
      RuntimeErrorCode.INVALID_INJECTION_TOKEN,
      ngDevMode &&
        'HOST_TAG_NAME can only be injected in directives and components ' +
          'during construction time (in a class constructor or as a class field initializer)',
    );
  }
  if (tNode.type & TNodeType.Element) {
    return tNode.value;
  }
  if (flags & InternalInjectFlags.Optional) {
    return null;
  }
  throw new RuntimeError(
    RuntimeErrorCode.INVALID_INJECTION_TOKEN,
    ngDevMode &&
      `HOST_TAG_NAME was used on ${getDevModeNodeName(
        tNode,
      )} which doesn't have an underlying element in the DOM. ` +
        `This is invalid, and so the dependency should be marked as optional.`,
  );
};

function getDevModeNodeName(tNode: TNode) {
  if (tNode.type & TNodeType.ElementContainer) {
    return 'an <ng-container>';
  } else if (tNode.type & TNodeType.Container) {
    return 'an <ng-template>';
  } else if (tNode.type & TNodeType.LetDeclaration) {
    return 'an @let declaration';
  } else {
    return 'a node';
  }
}
