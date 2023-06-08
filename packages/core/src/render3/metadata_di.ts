/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from '../di';
import {ElementIdFactory} from '../di/injection_token';

import {RElement} from './interfaces/renderer_dom';
import {getCurrentTNode, getLView} from './state';
import {getNativeByTNode} from './util/view_utils';

/**
 * A sentinel value indicating that there is no tag name, such as when
 * `TAG_NAME` is used on `<ng-template>` or `<ng-container>`.
 */
export const NO_TAG_NAME = Symbol('NO_TAG_NAME');

/**
 * Use this token to read the tag name of the host element
 * of a component or directive.
 *
 * @see [MDN: Element: tagName property](https://developer.mozilla.org/en-US/docs/Web/API/Element/tagName)
 *
 * @usageNotes
 *
 * Given a directive like the following:
 *
 * ```ts
 * @Directive({
 *   selector: '[my-directive]',
 * })
 * class MyDirective {
 *   tagName = inject(TAG_NAME);
 * }
 * ```
 *
 * then
 *
 * <code-example format="html" language="html">&lt;input my-directive&gt;</code-example>
 *
 * will have a `tagName` of `"INPUT"`,
 *
 * <code-example format="html" language="html">&lt;img my-directive&gt;</code-example>
 *
 * will have a `tagName` of `"IMG"`, and
 *
 * <code-example format="html" language="html">&lt;ng-container
 * my-directive&gt;&lt;/ng-container&gt;</code-example>
 *
 * will have a `tagName` of `NO_TAG_NAME`.
 *
 * @publicApi
 */
export const TAG_NAME: InjectionToken<string|typeof NO_TAG_NAME> =
    new InjectionToken('Tag Name', new ElementIdFactory(injectTagName));


function injectTagName(): string|typeof NO_TAG_NAME {
  const tNode = getCurrentTNode()!;
  const lView = getLView();
  const native = getNativeByTNode(tNode, lView) as RElement;

  return native.tagName ?? NO_TAG_NAME;
}
