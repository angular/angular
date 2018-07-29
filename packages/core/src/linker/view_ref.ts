/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ApplicationRef} from '../application_ref';
import {ChangeDetectorRef} from '../change_detection/change_detector_ref';

export abstract class ViewRef extends ChangeDetectorRef {
  /**
   * Destroys the view and all of the data structures associated with it.
   */
  abstract destroy(): void;

  abstract get destroyed(): boolean;

  abstract onDestroy(callback: Function): any /** TODO #9100 */;
}

/**
 * Represents an Angular View.
 *
 * <!-- TODO: move the next two paragraphs to the dev guide -->
 * A View is a fundamental building block of the application UI. It is the smallest grouping of
 * Elements which are created and destroyed together.
 *
 * Properties of elements in a View can change, but the structure (number and order) of elements in
 * a View cannot. Changing the structure of Elements can only be done by inserting, moving or
 * removing nested Views via a `ViewContainerRef`. Each View can contain many View Containers.
 * <!-- /TODO -->
 *
 * @usageNotes
 * ### Example
 *
 * Given this template...
 *
 * ```
 * Count: {{items.length}}
 * <ul>
 *   <li *ngFor="let  item of items">{{item}}</li>
 * </ul>
 * ```
 *
 * We have two `TemplateRef`s:
 *
 * Outer `TemplateRef`:
 *
 * ```
 * Count: {{items.length}}
 * <ul>
 *   <ng-template ngFor let-item [ngForOf]="items"></ng-template>
 * </ul>
 * ```
 *
 * Inner `TemplateRef`:
 *
 * ```
 *   <li>{{item}}</li>
 * ```
 *
 * Notice that the original template is broken down into two separate `TemplateRef`s.
 *
 * The outer/inner `TemplateRef`s are then assembled into views like so:
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
 * @experimental
 */
export abstract class EmbeddedViewRef<C> extends ViewRef {
  abstract get context(): C;

  abstract get rootNodes(): any[];
}

export interface InternalViewRef extends ViewRef {
  detachFromAppRef(): void;
  attachToAppRef(appRef: ApplicationRef): void;
}
