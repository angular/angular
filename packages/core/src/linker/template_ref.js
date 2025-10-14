/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {getCurrentTNode, getLView} from '../render3/state';
import {createAndRenderEmbeddedLView} from '../render3/view_manipulation';
import {ViewRef} from '../render3/view_ref';
import {assertDefined} from '../util/assert';
import {createElementRef} from './element_ref';
/**
 * Represents an embedded template that can be used to instantiate embedded views.
 * To instantiate embedded views based on a template, use the `ViewContainerRef`
 * method `createEmbeddedView()`.
 *
 * Access a `TemplateRef` instance by placing a directive on an `<ng-template>`
 * element (or directive prefixed with `*`). The `TemplateRef` for the embedded view
 * is injected into the constructor of the directive,
 * using the `TemplateRef` token.
 *
 * You can also use a `Query` to find a `TemplateRef` associated with
 * a component or a directive.
 *
 * @see {@link ViewContainerRef}
 *
 * @publicApi
 */
export class TemplateRef {
  /** @internal */
  constructor(_declarationLView, _declarationTContainer, elementRef) {
    this._declarationLView = _declarationLView;
    this._declarationTContainer = _declarationTContainer;
    this.elementRef = elementRef;
  }
  /**
   * Returns an `ssrId` associated with a TView, which was used to
   * create this instance of the `TemplateRef`.
   *
   * @internal
   */
  get ssrId() {
    return this._declarationTContainer.tView?.ssrId || null;
  }
  /**
   * Instantiates an unattached embedded view based on this template.
   * @param context The data-binding context of the embedded view, as declared
   * in the `<ng-template>` usage.
   * @param injector Injector to be used within the embedded view.
   * @returns The new embedded view object.
   */
  createEmbeddedView(context, injector) {
    return this.createEmbeddedViewImpl(context, injector);
  }
  /**
   * Implementation of the `createEmbeddedView` function.
   *
   * This implementation is internal and allows framework code
   * to invoke it with extra parameters (e.g. for hydration) without
   * affecting public API.
   *
   * @internal
   */
  createEmbeddedViewImpl(context, injector, dehydratedView) {
    const embeddedLView = createAndRenderEmbeddedLView(
      this._declarationLView,
      this._declarationTContainer,
      context,
      {embeddedViewInjector: injector, dehydratedView},
    );
    return new ViewRef(embeddedLView);
  }
}
/**
 * @internal
 * @nocollapse
 */
TemplateRef.__NG_ELEMENT_ID__ = injectTemplateRef;
/**
 * Creates a TemplateRef given a node.
 *
 * @returns The TemplateRef instance to use
 */
export function injectTemplateRef() {
  return createTemplateRef(getCurrentTNode(), getLView());
}
/**
 * Creates a TemplateRef and stores it on the injector.
 *
 * @param hostTNode The node on which a TemplateRef is requested
 * @param hostLView The `LView` to which the node belongs
 * @returns The TemplateRef instance or null if we can't create a TemplateRef on a given node type
 */
export function createTemplateRef(hostTNode, hostLView) {
  if (hostTNode.type & 4 /* TNodeType.Container */) {
    ngDevMode && assertDefined(hostTNode.tView, 'TView must be allocated');
    return new TemplateRef(hostLView, hostTNode, createElementRef(hostTNode, hostLView));
  }
  return null;
}
//# sourceMappingURL=template_ref.js.map
