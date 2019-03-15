/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// This interface replaces the real `LView` interface if it is an argument or the return value
// of a public API. This ensures we don't expose implementation details.
/**
 * Represents Angular View.
 *
 * This view can be found, inserted, or removed from a {@link ViewContainer} using methods
 * such as {@link viewContainerGetAt}, {@link viewContainerInsertAfter},
 * or {@link viewContainerRemove}
 *
 * @see ViewContainer
 */
export interface View<T extends{} = {}> {
  __ng_brand__: 'Angular opaque reference representing a View. DO NOT READ/MANIPULATE!';
}

// This interface replaces the real `LContainer` interface if it is an argument or the return
// value of a public API. This ensures we don't expose implementation details.
/**
 * Represents Angular View container.
 *
 * An Angular View container is associated with views created by directives and components that
 * dynamically add and remove views, such as `<ng-template>`, `*ngIf`, `*ngFor`, et al.
 *
 * A container can be selected by passing a `<!-- container -->` DOM element to {@link getViewContainer}.
 *
 * Individual views within the container are instances of {@link View} and may be found, inserted or
 * removed using methods such as {@link viewContainerGetAt}, {@link viewContainerInsertAfter},
 * or {@link viewContainerRemove}
 *
 * @see View
 */
export interface ViewContainer {
  __ng_brand__: 'Angular opaque reference representing a ViewContainer. DO NOT READ/MANIPULATE!';
}

/**
 * Creates a {@link View} instance by instantiating all view data and passing the provided `context`
 * to the view's template without attaching the view to the DOM or inserting it into a {@link
 * ViewContainer}, in order to do that please see {@link viewContainerInsertAfter}.
 *
 * @see getEmbeddedViewFactory
 */
export interface EmbeddedViewFactory<T extends{}> {
  /**
   * Creates an embedded view.
   * @param context The context to give to the embedded view
   */
  (context: T): View<T>;
}
