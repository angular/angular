/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector} from '../di/injector';
import {ComponentFactory, ComponentRef} from './component_factory';
import {ElementRef} from './element_ref';
import {NgModuleRef} from './ng_module_factory';
import {TemplateRef} from './template_ref';
import {EmbeddedViewRef, ViewRef} from './view_ref';


/**
 * Represents a container where one or more Views can be attached.
 *
 * The container can contain two kinds of Views. Host Views, created by instantiating a
 * {@link Component} via {@link #createComponent}, and Embedded Views, created by instantiating an
 * {@link TemplateRef Embedded Template} via {@link #createEmbeddedView}.
 *
 * The location of the View Container within the containing View is specified by the Anchor
 * `element`. Each View Container can have only one Anchor Element and each Anchor Element can only
 * have a single View Container.
 *
 * Root elements of Views attached to this container become siblings of the Anchor Element in
 * the Rendered View.
 *
 * To access a `ViewContainerRef` of an Element, you can either place a {@link Directive} injected
 * with `ViewContainerRef` on the Element, or you obtain it via a {@link ViewChild} query.
 * @stable
 */
export abstract class ViewContainerRef {
  /**
   * Anchor element that specifies the location of this container in the containing View.
   * <!-- TODO: rename to anchorElement -->
   */
  abstract get element(): ElementRef;

  abstract get injector(): Injector;

  abstract get parentInjector(): Injector;

  /**
   * Destroys all Views in this container.
   */
  abstract clear(): void;

  /**
   * Returns the {@link ViewRef} for the View located in this container at the specified index.
   */
  abstract get(index: number): ViewRef|null;

  /**
   * Returns the number of Views currently attached to this container.
   */
  abstract get length(): number;

  /**
   * Instantiates an Embedded View based on the {@link TemplateRef `templateRef`} and inserts it
   * into this container at the specified `index`.
   *
   * If `index` is not specified, the new View will be inserted as the last View in the container.
   *
   * Returns the {@link ViewRef} for the newly created View.
   */
  abstract createEmbeddedView<C>(templateRef: TemplateRef<C>, context?: C, index?: number):
      EmbeddedViewRef<C>;

  /**
   * Instantiates a single {@link Component} and inserts its Host View into this container at the
   * specified `index`.
   *
   * The component is instantiated using its {@link ComponentFactory} which can be
   * obtained via {@link ComponentFactoryResolver#resolveComponentFactory}.
   *
   * If `index` is not specified, the new View will be inserted as the last View in the container.
   *
   * You can optionally specify the {@link Injector} that will be used as parent for the Component.
   *
   * Returns the {@link ComponentRef} of the Host View created for the newly instantiated Component.
   */
  abstract createComponent<C>(
      componentFactory: ComponentFactory<C>, index?: number, injector?: Injector,
      projectableNodes?: any[][], ngModule?: NgModuleRef<any>): ComponentRef<C>;

  /**
   * Inserts a View identified by a {@link ViewRef} into the container at the specified `index`.
   *
   * If `index` is not specified, the new View will be inserted as the last View in the container.
   *
   * Returns the inserted {@link ViewRef}.
   */
  abstract insert(viewRef: ViewRef, index?: number): ViewRef;

  /**
   * Moves a View identified by a {@link ViewRef} into the container at the specified `index`.
   *
   * Returns the inserted {@link ViewRef}.
   */
  abstract move(viewRef: ViewRef, currentIndex: number): ViewRef;

  /**
   * Returns the index of the View, specified via {@link ViewRef}, within the current container or
   * `-1` if this container doesn't contain the View.
   */
  abstract indexOf(viewRef: ViewRef): number;

  /**
   * Destroys a View attached to this container at the specified `index`.
   *
   * If `index` is not specified, the last View in the container will be removed.
   */
  abstract remove(index?: number): void;

  /**
   * Use along with {@link #insert} to move a View within the current container.
   *
   * If the `index` param is omitted, the last {@link ViewRef} is detached.
   */
  abstract detach(index?: number): ViewRef|null;
}
