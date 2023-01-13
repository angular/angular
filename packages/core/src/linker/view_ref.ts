/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectorRef} from '../change_detection/change_detector_ref';

/**
 * Represents an Angular [view](guide/glossary#view "Definition").
 *
 * @see {@link ChangeDetectorRef#usage-notes Change detection usage}
 *
 * @publicApi
 */
export abstract class ViewRef extends ChangeDetectorRef {
  /**
   * Destroys this view and all of the data structures associated with it.
   */
  abstract destroy(): void;

  /**
   * Reports whether this view has been destroyed.
   * @returns True after the `destroy()` method has been called, false otherwise.
   */
  abstract get destroyed(): boolean;

  /**
   * A lifecycle hook that provides additional developer-defined cleanup
   * functionality for views.
   * @param callback A handler function that cleans up developer-defined data
   * associated with a view. Called when the `destroy()` method is invoked.
   */
  abstract onDestroy(callback: Function): void;
}

/**
 * Represents an Angular [view](guide/glossary#view) in a view container.
 * An [embedded view](guide/glossary#view-hierarchy) can be referenced from a component
 * other than the hosting component whose template defines it, or it can be defined
 * independently by a `TemplateRef`.
 *
 * Properties of elements in a view can change, but the structure (number and order) of elements in
 * a view cannot. Change the structure of elements by inserting, moving, or
 * removing nested views in a view container.
 *
 * @see `ViewContainerRef`
 *
 * @usageNotes
 *
 * The following template breaks down into two separate `TemplateRef` instances,
 * an outer one and an inner one.
 *
 * ```
 * Count: {{items.length}}
 * <ul>
 *   <li *ngFor="let  item of items">{{item}}</li>
 * </ul>
 * ```
 *
 * This is the outer `TemplateRef`:
 *
 * ```
 * Count: {{items.length}}
 * <ul>
 *   <ng-template ngFor let-item [ngForOf]="items"></ng-template>
 * </ul>
 * ```
 *
 * This is the inner `TemplateRef`:
 *
 * ```
 *   <li>{{item}}</li>
 * ```
 *
 * The outer and inner `TemplateRef` instances are assembled into views as follows:
 *
 * ```
 * <!-- ViewRef: outer-0 -->
 * Count: 2
 * <ul>
 *   <ng-template view-container-ref></ng-template>
 *   <!-- ViewRef: inner-1 --><li>first</li><!-- /ViewRef: inner-1 -->
 *   <!-- ViewRef: inner-2 --><li>second</li><!-- /ViewRef: inner-2 -->
 * </ul>
 * <!-- /ViewRef: outer-0 -->
 * ```
 * @publicApi
 */
export abstract class EmbeddedViewRef<C> extends ViewRef {
  /**
   * The context for this view, inherited from the anchor element.
   */
  abstract context: C;

  /**
   * The root nodes for this embedded view.
   */
  abstract get rootNodes(): any[];
}

export interface InternalViewRef extends ViewRef {
  detachFromAppRef(): void;
  attachToAppRef(appRef: ViewRefTracker): void;
}

/**
 * Interface for tracking root `ViewRef`s in `ApplicationRef`.
 *
 * NOTE: Importing `ApplicationRef` here directly creates circular dependency, which is why we have
 * a subset of the `ApplicationRef` interface `ViewRefTracker` here.
 */
export interface ViewRefTracker {
  detachView(viewRef: ViewRef): void;
}
