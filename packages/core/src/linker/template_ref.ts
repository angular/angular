/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector} from '../di/injector';
import {DehydratedContainerView} from '../hydration/interfaces';
import {TContainerNode, TNode, TNodeType} from '../render3/interfaces/node';
import {LView} from '../render3/interfaces/view';
import {getCurrentTNode, getLView} from '../render3/state';
import {createAndRenderEmbeddedLView} from '../render3/view_manipulation';
import {ViewRef} from '../render3/view_ref';
import {assertDefined} from '../util/assert';

import {createElementRef, ElementRef} from './element_ref';
import {EmbeddedViewRef} from './view_ref';

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
export class TemplateRef<C> {
  /**
   * The anchor element in the parent view for this embedded view.
   *
   * The data-binding and [injection contexts](guide/di/dependency-injection-context) of embedded
   * views created from this `TemplateRef` inherit from the contexts of this location.
   *
   * Typically new embedded views are attached to the view container of this location, but in
   * advanced use-cases, the view can be attached to a different container while keeping the
   * data-binding and injection context from the original location.
   *
   */
  readonly elementRef: ElementRef;

  /**
   * @internal
   * @nocollapse
   */
  static __NG_ELEMENT_ID__: () => TemplateRef<any> | null = injectTemplateRef;

  /** @internal */
  constructor(
    private _declarationLView: LView,
    private _declarationTContainer: TContainerNode,
    elementRef: ElementRef,
  ) {
    this.elementRef = elementRef;
  }

  /**
   * Returns an `ssrId` associated with a TView, which was used to
   * create this instance of the `TemplateRef`.
   *
   * @internal
   */
  get ssrId(): string | null {
    return this._declarationTContainer.tView?.ssrId || null;
  }

  /**
   * Instantiates an unattached embedded view based on this template.
   * @param context The data-binding context of the embedded view, as declared
   * in the `<ng-template>` usage.
   * @param injector Injector to be used within the embedded view.
   * @returns The new embedded view object.
   */
  createEmbeddedView(context: C, injector?: Injector): EmbeddedViewRef<C> {
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
  createEmbeddedViewImpl(
    context: C,
    injector?: Injector,
    dehydratedView?: DehydratedContainerView | null,
  ): EmbeddedViewRef<C> {
    const embeddedLView = createAndRenderEmbeddedLView(
      this._declarationLView,
      this._declarationTContainer,
      context,
      {embeddedViewInjector: injector, dehydratedView},
    );
    return new ViewRef<C>(embeddedLView);
  }
}

/**
 * Creates a TemplateRef given a node.
 *
 * @returns The TemplateRef instance to use
 */
export function injectTemplateRef<T>(): TemplateRef<T> | null {
  return createTemplateRef<T>(getCurrentTNode()!, getLView());
}

/**
 * Creates a TemplateRef and stores it on the injector.
 *
 * @param hostTNode The node on which a TemplateRef is requested
 * @param hostLView The `LView` to which the node belongs
 * @returns The TemplateRef instance or null if we can't create a TemplateRef on a given node type
 */
export function createTemplateRef<T>(hostTNode: TNode, hostLView: LView): TemplateRef<T> | null {
  if (hostTNode.type & TNodeType.Container) {
    ngDevMode && assertDefined(hostTNode.tView, 'TView must be allocated');
    return new TemplateRef(
      hostLView,
      hostTNode as TContainerNode,
      createElementRef(hostTNode, hostLView),
    );
  }
  return null;
}
