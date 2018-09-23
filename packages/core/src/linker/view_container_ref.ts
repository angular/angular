/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector} from '../di/injector';
import {R3_VIEW_CONTAINER_REF_FACTORY} from '../ivy_switch';

import {ComponentFactory, ComponentRef} from './component_factory';
import {ElementRef} from './element_ref';
import {NgModuleRef} from './ng_module_factory';
import {TemplateRef} from './template_ref';
import {EmbeddedViewRef, ViewRef} from './view_ref';


/**
 * Represents a container where one or more views can be attached to a component.
 *
 * Can contain *host views* (created by instantiating a
 * component with the `createComponent()` method), and *embedded views*
 * (created by instantiating a `TemplateRef` with the `createEmbeddedView()` method).
 *
 * A view container instance can contain other view containers,
 * creating a [view hierarchy](guide/glossary#view-tree).
 *
 * @see `ComponentRef`
 * @see `EmbeddedViewRef`
 *
 */
export abstract class ViewContainerRef {
  /**
   * Anchor element that specifies the location of this container in the containing view.
   * Each view container can have only one anchor element, and each anchor element
   * can have only a single view container.
   *
   * Root elements of views attached to this container become siblings of the anchor element in
   * the rendered view.
   *
   * Access the `ViewContainerRef` of an element by placing a `Directive` injected
   * with `ViewContainerRef` on the element, or use a `ViewChild` query.
   *
   * <!-- TODO: rename to anchorElement -->
   */
  abstract get element(): ElementRef;

  /**
   * The [dependency injector](guide/glossary#injector) for this view container.
   */
  abstract get injector(): Injector;

  /** @deprecated No replacement */
  abstract get parentInjector(): Injector;

  /**
   * Destroys all views in this container.
   */
  abstract clear(): void;

  /**
   * Retrieves a view from this container.
   * @param index The 0-based index of the view to retrieve.
   * @returns The `ViewRef` instance, or null if the index is out of range.
   */
  abstract get(index: number): ViewRef|null;

  /**
   * Reports how many views are currently attached to this container.
   * @returns The number of views.
   */
  abstract get length(): number;

  /**
   * Instantiates an embedded view and inserts it
   * into this container.
   * @param templateRef The HTML template that defines the view.
   * @param index The 0-based index at which to insert the new view into this container.
   * If not specified, appends the new view as the last entry.
   *
   * @returns The `ViewRef` instance for the newly created view.
   */
  abstract createEmbeddedView<C>(templateRef: TemplateRef<C>, context?: C, index?: number):
      EmbeddedViewRef<C>;

  /**
   * Instantiates a single component and inserts its host view into this container.
   *
   * @param componentFactory The factory to use.
   * @param index The index at which to insert the new component's host view into this container.
   * If not specified, appends the new view as the last entry.
   * @param injector The injector to use as the parent for the new component.
   * @param projectableNodes
   * @param ngModule
   *
   * @returns The new component instance, containing the host view.
   *
   */
  abstract createComponent<C>(
      componentFactory: ComponentFactory<C>, index?: number, injector?: Injector,
      projectableNodes?: any[][], ngModule?: NgModuleRef<any>): ComponentRef<C>;

  /**
   * Inserts a view into this container.
   * @param viewRef The view to insert.
   * @param index The 0-based index at which to insert the view.
   * If not specified, appends the new view as the last entry.
   * @returns The inserted `ViewRef` instance.
   *
   */
  abstract insert(viewRef: ViewRef, index?: number): ViewRef;

  /**
   * Moves a view to a new location in this container.
   * @param viewRef The view to move.
   * @param index The 0-based index of the new location.
   * @returns The moved `ViewRef` instance.
   */
  abstract move(viewRef: ViewRef, currentIndex: number): ViewRef;

  /**
   * Returns the index of a view within the current container.
   * @param viewRef The view to query.
   * @returns The 0-based index of the view's position in this container,
   * or `-1` if this container doesn't contain the view.
   */
  abstract indexOf(viewRef: ViewRef): number;

  /**
   * Destroys a view attached to this container
   * @param index The 0-based index of the view to destroy.
   * If not specified, the last view in the container is removed.
   */
  abstract remove(index?: number): void;

  /**
   * Detaches a view from this container without destroying it.
   * Use along with `insert()` to move a view within the current container.
   * @param index The 0-based index of the view to detach.
   * If not specified, the last view in the container is detached.
   */
  abstract detach(index?: number): ViewRef|null;

  /** @internal */
  static __NG_ELEMENT_ID__ = () => R3_VIEW_CONTAINER_REF_FACTORY();
}
