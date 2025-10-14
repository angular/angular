/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {isLView} from '../render3/interfaces/type_checks';
import {RENDERER} from '../render3/interfaces/view';
import {getCurrentTNode, getLView} from '../render3/state';
import {getComponentLViewByIndex} from '../render3/util/view_utils';
/**
 * Creates and initializes a custom renderer that implements the `Renderer2` base class.
 *
 * @publicApi
 */
export class RendererFactory2 {}
/**
 * Extend this base class to implement custom rendering. By default, Angular
 * renders a template into DOM. You can use custom rendering to intercept
 * rendering calls, or to render to something other than DOM.
 *
 * <div class="docs-alert docs-alert-important">
 * <p>
 * Please be aware that usage of `Renderer2`, in context of accessing DOM elements, provides no
 * extra security which makes it equivalent to
 * {@link /best-practices/security#direct-use-of-the-dom-apis-and-explicit-sanitization-calls Security vulnerabilities}.
 * </p>
 * </div>
 *
 * Create your custom renderer using `RendererFactory2`.
 *
 * Use a custom renderer to bypass Angular's templating and
 * make custom UI changes that can't be expressed declaratively.
 * For example if you need to set a property or an attribute whose name is
 * not statically known, use the `setProperty()` or
 * `setAttribute()` method.
 *
 * @publicApi
 */
export class Renderer2 {
  constructor() {
    /**
     * If null or undefined, the view engine won't call it.
     * This is used as a performance optimization for production mode.
     */
    this.destroyNode = null;
  }
}
/**
 * @internal
 * @nocollapse
 */
Renderer2.__NG_ELEMENT_ID__ = () => injectRenderer2();
/** Injects a Renderer2 for the current component. */
export function injectRenderer2() {
  // We need the Renderer to be based on the component that it's being injected into, however since
  // DI happens before we've entered its view, `getLView` will return the parent view instead.
  const lView = getLView();
  const tNode = getCurrentTNode();
  const nodeAtIndex = getComponentLViewByIndex(tNode.index, lView);
  return (isLView(nodeAtIndex) ? nodeAtIndex : lView)[RENDERER];
}
//# sourceMappingURL=api.js.map
