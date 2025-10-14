/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {RuntimeError} from '../errors';
import {getCurrentTNode} from '../render3/state';
import {InjectionToken} from './injection_token';
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
export const HOST_TAG_NAME = /* @__PURE__ */ (() => {
  // Wrapped in a `@__PURE__` IIFE so this token stays tree-shakable.
  // If nothing ever injects `HOST_TAG_NAME`, the IIFE result is unused and
  // the bundler can drop the whole block. If we set `__NG_ELEMENT_ID__` at
  // the top level instead, the mutation would look like a side effect,
  // forcing the bundler to keep it even when unused.
  const HOST_TAG_NAME_TOKEN = new InjectionToken(
    typeof ngDevMode !== undefined && ngDevMode ? 'HOST_TAG_NAME' : '',
  );
  // HOST_TAG_NAME should be resolved at the current node, similar to e.g. ElementRef,
  // so we manually specify __NG_ELEMENT_ID__ here, instead of using a factory.
  // tslint:disable-next-line:no-toplevel-property-access
  HOST_TAG_NAME_TOKEN.__NG_ELEMENT_ID__ = (flags) => {
    const tNode = getCurrentTNode();
    if (tNode === null) {
      throw new RuntimeError(
        204 /* RuntimeErrorCode.INVALID_INJECTION_TOKEN */,
        ngDevMode &&
          'HOST_TAG_NAME can only be injected in directives and components ' +
            'during construction time (in a class constructor or as a class field initializer)',
      );
    }
    if (tNode.type & 2 /* TNodeType.Element */) {
      return tNode.value;
    }
    if (flags & 8 /* InternalInjectFlags.Optional */) {
      return null;
    }
    throw new RuntimeError(
      204 /* RuntimeErrorCode.INVALID_INJECTION_TOKEN */,
      ngDevMode &&
        `HOST_TAG_NAME was used on ${getDevModeNodeName(tNode)} which doesn't have an underlying element in the DOM. ` +
          `This is invalid, and so the dependency should be marked as optional.`,
    );
  };
  return HOST_TAG_NAME_TOKEN;
})();
function getDevModeNodeName(tNode) {
  if (tNode.type & 8 /* TNodeType.ElementContainer */) {
    return 'an <ng-container>';
  } else if (tNode.type & 4 /* TNodeType.Container */) {
    return 'an <ng-template>';
  } else if (tNode.type & 128 /* TNodeType.LetDeclaration */) {
    return 'an @let declaration';
  } else {
    return 'a node';
  }
}
//# sourceMappingURL=host_tag_name_token.js.map
