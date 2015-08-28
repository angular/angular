import {ListWrapper} from 'angular2/src/core/facade/collection';
import {ResolvedBinding} from 'angular2/di';
import {isPresent, isBlank} from 'angular2/src/core/facade/lang';

import * as avmModule from './view_manager';
import * as viewModule from './view';

import {ElementRef} from './element_ref';
import {TemplateRef} from './template_ref';
import {ViewRef, HostViewRef, ProtoViewRef, internalView} from './view_ref';

/**
 * A location where {@link ViewRef}s can be attached.
 *
 * A `ViewContainerRef` represents a location in a {@link ViewRef} where other child
 * {@link ViewRef}s can be inserted. Adding and removing views is the only way of structurally
 * changing the rendered DOM of the application.
 */
export class ViewContainerRef {
  /**
   * @private
   */
  constructor(public viewManager: avmModule.AppViewManager, public element: ElementRef) {}

  private _getViews(): Array<viewModule.AppView> {
    var vc = internalView(this.element.parentView).viewContainers[this.element.boundElementIndex];
    return isPresent(vc) ? vc.views : [];
  }

  /**
   * Remove all {@link ViewRef}s at current location.
   */
  clear(): void {
    for (var i = this.length - 1; i >= 0; i--) {
      this.remove(i);
    }
  }

  /**
   * Return a {@link ViewRef} at specific index.
   */
  get(index: number): ViewRef { return this._getViews()[index].ref; }

  /**
   * Returns number of {@link ViewRef}s currently attached at this location.
   */
  get length(): number { return this._getViews().length; }

  /**
   * Create and insert a {@link ViewRef} into the view-container.
   *
   * - `protoViewRef` (optional) {@link ProtoViewRef} - The `ProtoView` to use for creating
   *   `View` to be inserted at this location. If `ViewContainer` is created at a location
   *   of inline template, then `protoViewRef` is the `ProtoView` of the template.
   * - `atIndex` (optional) `number` - location of insertion point. (Or at the end if unspecified.)
   * - `context` (optional) {@link ElementRef} - Context (for expression evaluation) from the
   *   {@link ElementRef} location. (Or current context if unspecified.)
   * - `bindings` (optional) Array of {@link ResolvedBinding} - Used for configuring
   *   `ElementInjector`.
   *
   * Returns newly created {@link ViewRef}.
   */
  // TODO(rado): profile and decide whether bounds checks should be added
  // to the methods below.
  createEmbeddedView(templateRef: TemplateRef, atIndex: number = -1): ViewRef {
    if (atIndex == -1) atIndex = this.length;
    return this.viewManager.createEmbeddedViewInContainer(this.element, atIndex, templateRef);
  }

  createHostView(protoViewRef: ProtoViewRef = null, atIndex: number = -1,
                 dynamicallyCreatedBindings: ResolvedBinding[] = null): HostViewRef {
    if (atIndex == -1) atIndex = this.length;
    return this.viewManager.createHostViewInContainer(this.element, atIndex, protoViewRef,
                                                      dynamicallyCreatedBindings);
  }

  /**
   * Insert a {@link ViewRef} at specefic index.
   *
   * The index is location at which the {@link ViewRef} should be attached. If omitted it is
   * inserted at the end.
   *
   * Returns the inserted {@link ViewRef}.
   */
  insert(viewRef: ViewRef, atIndex: number = -1): ViewRef {
    if (atIndex == -1) atIndex = this.length;
    return this.viewManager.attachViewInContainer(this.element, atIndex, viewRef);
  }

  /**
   * Return the index of already inserted {@link ViewRef}.
   */
  indexOf(viewRef: ViewRef): number {
    return ListWrapper.indexOf(this._getViews(), internalView(viewRef));
  }

  /**
   * Remove a {@link ViewRef} at specific index.
   *
   * If the index is omitted last {@link ViewRef} is removed.
   */
  remove(atIndex: number = -1): void {
    if (atIndex == -1) atIndex = this.length - 1;
    this.viewManager.destroyViewInContainer(this.element, atIndex);
    // view is intentionally not returned to the client.
  }

  /**
   * The method can be used together with insert to implement a view move, i.e.
   * moving the dom nodes while the directives in the view stay intact.
   */
  detach(atIndex: number = -1): ViewRef {
    if (atIndex == -1) atIndex = this.length - 1;
    return this.viewManager.detachViewInContainer(this.element, atIndex);
  }
}
