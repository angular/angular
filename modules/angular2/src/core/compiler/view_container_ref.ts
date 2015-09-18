import {ListWrapper} from 'angular2/src/core/facade/collection';
import {ResolvedBinding} from 'angular2/src/core/di';
import {isPresent, isBlank} from 'angular2/src/core/facade/lang';

import * as avmModule from './view_manager';
import * as viewModule from './view';

import {ElementRef} from './element_ref';
import {TemplateRef} from './template_ref';
import {ViewRef, HostViewRef, ProtoViewRef, internalView} from './view_ref';

/**
 * Represents a container where one or more Views can be attached.
 *
 * The container can contain two kinds of Views. Host Views, created by instantiating a
 * {@link Component} via {@link #createHostView}s, and Embedded Views, created by instantiating an
 * {@link TemplateRef Embedded Template} via {@link #createEmbeddedView}).
 *
 * The location of the View Container within the containing View is specified by the Anchor
 * `element`. Each View Container can have only one Anchor Element and each Anchor Element can only
 * have a single View Container.
 *
 * Root elements of Views attached to this container become siblings of the Anchor Element in
 * the Rendered View.
 *
 * To access a ViewContainerRef of an Element, you can either place a {@link Directive} injected
 * with `ViewContainerRef` on the Element, or you obtain it via
 * {@link ViewManager#getViewContainer}.
 *
 * <!-- TODO: Is ViewContainerRef#element a public api? Should it be renamed? to anchor or anchorElementRef? -->
 * <!-- TODO: rename all atIndex params to just index or get(index) to get(atIndex) -->
 */
export class ViewContainerRef {

  /**
   * @private
   */
  constructor(
    /**
     * @private
     */
    public viewManager: avmModule.AppViewManager,

    /**
     * Anchor element that specifies the location of this container in the containing View.
     */
    public element: ElementRef
  ) {

  }

  private _getViews(): Array<viewModule.AppView> {
    var vc = internalView(this.element.parentView).viewContainers[this.element.boundElementIndex];
    return isPresent(vc) ? vc.views : [];
  }

  /**
   * Destroys all Views in the container.
   */
  clear(): void {
    for (var i = this.length - 1; i >= 0; i--) {
      this.remove(i);
    }
  }

  /**
   * Returns the {@link ViewRef} for the View located in this container at the specified index.
   */
  get(index: number): ViewRef { return this._getViews()[index].ref; }

  /**
   * Returns the number of Views currently attached to this container.
   */
  get length(): number { return this._getViews().length; }

  /**
   * Creates an Embedded View based on the {@link TemplateRef `templateRef`} and inserts it into
   * this container at index specified via `atIndex`.
   *
   * If `atIndex` is not specified, the new View will be inserted as the last View in the container.
   *
   * Returns the {@link ViewRef} for the newly created View.
   */
  // TODO(rado): profile and decide whether bounds checks should be added
  // to the methods below.
  createEmbeddedView(templateRef: TemplateRef, atIndex: number = -1): ViewRef {
    if (atIndex == -1) atIndex = this.length;
    return this.viewManager.createEmbeddedViewInContainer(this.element, atIndex, templateRef);
  }

  /**
   * Creates a View  based on the {@link ProtoViewRef `protoViewRef`} and inserts it into this
   * container at index specified via `atIndex`.
   *
   * If `atIndex` is not specified, the new View will be inserted as the last View in the container.
   *
   * You can optionally specify `dynamicallyCreatedBindings`, which configure the {@link Injector}
   * that will be created for the new Host View. <!-- TODO: what is host view? it's never defined!!! -->
   *
   * Returns the {@link ViewRef} for the newly created View.
   */
  createHostView(protoViewRef: ProtoViewRef = null, atIndex: number = -1,
                 dynamicallyCreatedBindings: ResolvedBinding[] = null): HostViewRef {
    if (atIndex == -1) atIndex = this.length;
    return this.viewManager.createHostViewInContainer(this.element, atIndex, protoViewRef,
                                                      dynamicallyCreatedBindings);
  }

  /**
   * <!-- TODO: refactor into move and remove -->
   * Inserts a View identified by a {@link ViewRef} into the container at index specified via
   * `atIndex`.
   *
   * If `atIndex` is not specified, the new View will be inserted as the last View in the container.
   *
   * Returns the inserted {@link ViewRef}.
   * <!-- TODO: why does it return ViewRef? looks useless -->
   */
  insert(viewRef: ViewRef, atIndex: number = -1): ViewRef {
    if (atIndex == -1) atIndex = this.length;
    return this.viewManager.attachViewInContainer(this.element, atIndex, viewRef);
  }

  /**
   * Returns the index of the View, specified via {@link ViewRef}, within the current container.
   */
  indexOf(viewRef: ViewRef): number {
    return ListWrapper.indexOf(this._getViews(), internalView(viewRef));
  }

  /**
   * <!-- TODO: rename to destroy -->
   * Destroys a View attached to this container at index specified via `atIndex`.
   *
   * If `atIndex` is not specified, the last View in the container will be removed.
   */
  remove(atIndex: number = -1): void {
    if (atIndex == -1) atIndex = this.length - 1;
    this.viewManager.destroyViewInContainer(this.element, atIndex);
    // view is intentionally not returned to the client.
  }

  /**
   * <!-- TODO: refactor into move and remove -->
   * Use along with {@link #insert} to move a View within the current container.
   *
   * If the `atIndex` param is omitted, the last {@link ViewRef} is detached.
   * <!-- TODO: why does it return ViewRef? looks useless -->
   */
  detach(atIndex: number = -1): ViewRef {
    if (atIndex == -1) atIndex = this.length - 1;
    return this.viewManager.detachViewInContainer(this.element, atIndex);
  }
}
