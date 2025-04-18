/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  USE_EXHAUSTIVE_CHECK_NO_CHANGES_DEFAULT,
  UseExhaustiveCheckNoChanges,
} from '../change_detection/use_exhaustive_check_no_changes';
import type {ChangeDetectorRef} from '../change_detection/change_detector_ref';
import {NotificationSource} from '../change_detection/scheduling/zoneless_scheduling';
import type {ApplicationRef} from '../core';
import {RuntimeError, RuntimeErrorCode} from '../errors';
import type {EmbeddedViewRef} from '../linker/view_ref';
import {removeFromArray} from '../util/array_utils';
import {assertEqual} from '../util/assert';

import {collectNativeNodes} from './collect_native_nodes';
import {checkNoChangesInternal, detectChangesInternal} from './instructions/change_detection';
import {markViewDirty} from './instructions/mark_view_dirty';
import {CONTAINER_HEADER_OFFSET, VIEW_REFS} from './interfaces/container';
import {isDestroyed, isLContainer, isRootView} from './interfaces/type_checks';
import {
  CONTEXT,
  DECLARATION_LCONTAINER,
  FLAGS,
  INJECTOR,
  LView,
  LViewFlags,
  PARENT,
  TVIEW,
} from './interfaces/view';
import {destroyLView, detachMovedView, detachViewFromDOM} from './node_manipulation';
import {CheckNoChangesMode} from './state';
import {
  markViewForRefresh,
  storeLViewOnDestroy,
  updateAncestorTraversalFlagsOnAttach,
  requiresRefreshOrTraversal,
} from './util/view_utils';
import {detachView, trackMovedView} from './view/container';

// Needed due to tsickle downleveling where multiple `implements` with classes creates
// multiple @extends in Closure annotations, which is illegal. This workaround fixes
// the multiple @extends by making the annotation @implements instead
interface ChangeDetectorRefInterface extends ChangeDetectorRef {}

export class ViewRef<T> implements EmbeddedViewRef<T>, ChangeDetectorRefInterface {
  private _appRef: ApplicationRef | null = null;
  private _attachedToViewContainer = false;
  private exhaustive?: boolean;

  get rootNodes(): any[] {
    const lView = this._lView;
    const tView = lView[TVIEW];
    return collectNativeNodes(tView, lView, tView.firstChild, []);
  }

  constructor(
    /**
     * This represents `LView` associated with the component when ViewRef is a ChangeDetectorRef.
     *
     * When ViewRef is created for a dynamic component, this also represents the `LView` for the
     * component.
     *
     * For a "regular" ViewRef created for an embedded view, this is the `LView` for the embedded
     * view.
     *
     * @internal
     */
    public _lView: LView,

    /**
     * This represents the `LView` associated with the point where `ChangeDetectorRef` was
     * requested.
     *
     * This may be different from `_lView` if the `_cdRefInjectingView` is an embedded view.
     */
    private _cdRefInjectingView?: LView,
  ) {}

  get context(): T {
    return this._lView[CONTEXT] as unknown as T;
  }

  /**
   * @deprecated Replacing the full context object is not supported. Modify the context
   *   directly, or consider using a `Proxy` if you need to replace the full object.
   * // TODO(devversion): Remove this.
   */
  set context(value: T) {
    if (ngDevMode) {
      // Note: We have a warning message here because the `@deprecated` JSDoc will not be picked
      // up for assignments on the setter. We want to let users know about the deprecated usage.
      console.warn(
        'Angular: Replacing the `context` object of an `EmbeddedViewRef` is deprecated.',
      );
    }

    this._lView[CONTEXT] = value as unknown as {};
  }

  get destroyed(): boolean {
    return isDestroyed(this._lView);
  }

  destroy(): void {
    if (this._appRef) {
      this._appRef.detachView(this);
    } else if (this._attachedToViewContainer) {
      const parent = this._lView[PARENT];
      if (isLContainer(parent)) {
        const viewRefs = parent[VIEW_REFS] as ViewRef<unknown>[] | null;
        const index = viewRefs ? viewRefs.indexOf(this) : -1;
        if (index > -1) {
          ngDevMode &&
            assertEqual(
              index,
              parent.indexOf(this._lView) - CONTAINER_HEADER_OFFSET,
              'An attached view should be in the same position within its container as its ViewRef in the VIEW_REFS array.',
            );
          detachView(parent, index);
          removeFromArray(viewRefs!, index);
        }
      }
      this._attachedToViewContainer = false;
    }
    destroyLView(this._lView[TVIEW], this._lView);
  }

  onDestroy(callback: Function) {
    storeLViewOnDestroy(this._lView, callback as () => void);
  }

  /**
   * Marks a view and all of its ancestors dirty.
   *
   * This can be used to ensure an {@link ChangeDetectionStrategy#OnPush} component is
   * checked when it needs to be re-rendered but the two normal triggers haven't marked it
   * dirty (i.e. inputs haven't changed and events haven't fired in the view).
   *
   * <!-- TODO: Add a link to a chapter on OnPush components -->
   *
   * @usageNotes
   * ### Example
   *
   * ```ts
   * @Component({
   *   selector: 'app-root',
   *   template: `Number of ticks: {{numberOfTicks}}`
   *   changeDetection: ChangeDetectionStrategy.OnPush,
   * })
   * class AppComponent {
   *   numberOfTicks = 0;
   *
   *   constructor(private ref: ChangeDetectorRef) {
   *     setInterval(() => {
   *       this.numberOfTicks++;
   *       // the following is required, otherwise the view will not be updated
   *       this.ref.markForCheck();
   *     }, 1000);
   *   }
   * }
   * ```
   */
  markForCheck(): void {
    markViewDirty(this._cdRefInjectingView || this._lView, NotificationSource.MarkForCheck);
  }

  /**
   * Detaches the view from the change detection tree.
   *
   * Detached views will not be checked during change detection runs until they are
   * re-attached, even if they are dirty. `detach` can be used in combination with
   * {@link ChangeDetectorRef#detectChanges} to implement local change
   * detection checks.
   *
   * <!-- TODO: Add a link to a chapter on detach/reattach/local digest -->
   * <!-- TODO: Add a live demo once ref.detectChanges is merged into master -->
   *
   * @usageNotes
   * ### Example
   *
   * The following example defines a component with a large list of readonly data.
   * Imagine the data changes constantly, many times per second. For performance reasons,
   * we want to check and update the list every five seconds. We can do that by detaching
   * the component's change detector and doing a local check every five seconds.
   *
   * ```ts
   * class DataProvider {
   *   // in a real application the returned data will be different every time
   *   get data() {
   *     return [1,2,3,4,5];
   *   }
   * }
   *
   * @Component({
   *   selector: 'giant-list',
   *   template: `
   *     <li *ngFor="let d of dataProvider.data">Data {{d}}</li>
   *   `,
   * })
   * class GiantList {
   *   constructor(private ref: ChangeDetectorRef, private dataProvider: DataProvider) {
   *     ref.detach();
   *     setInterval(() => {
   *       this.ref.detectChanges();
   *     }, 5000);
   *   }
   * }
   *
   * @Component({
   *   selector: 'app',
   *   providers: [DataProvider],
   *   template: `
   *     <giant-list><giant-list>
   *   `,
   * })
   * class App {
   * }
   * ```
   */
  detach(): void {
    this._lView[FLAGS] &= ~LViewFlags.Attached;
  }

  /**
   * Re-attaches a view to the change detection tree.
   *
   * This can be used to re-attach views that were previously detached from the tree
   * using {@link ChangeDetectorRef#detach}. Views are attached to the tree by default.
   *
   * <!-- TODO: Add a link to a chapter on detach/reattach/local digest -->
   *
   * @usageNotes
   * ### Example
   *
   * The following example creates a component displaying `live` data. The component will detach
   * its change detector from the main change detector tree when the component's live property
   * is set to false.
   *
   * ```ts
   * class DataProvider {
   *   data = 1;
   *
   *   constructor() {
   *     setInterval(() => {
   *       this.data = this.data * 2;
   *     }, 500);
   *   }
   * }
   *
   * @Component({
   *   selector: 'live-data',
   *   inputs: ['live'],
   *   template: 'Data: {{dataProvider.data}}'
   * })
   * class LiveData {
   *   constructor(private ref: ChangeDetectorRef, private dataProvider: DataProvider) {}
   *
   *   set live(value) {
   *     if (value) {
   *       this.ref.reattach();
   *     } else {
   *       this.ref.detach();
   *     }
   *   }
   * }
   *
   * @Component({
   *   selector: 'app-root',
   *   providers: [DataProvider],
   *   template: `
   *     Live Update: <input type="checkbox" [(ngModel)]="live">
   *     <live-data [live]="live"><live-data>
   *   `,
   * })
   * class AppComponent {
   *   live = true;
   * }
   * ```
   */
  reattach(): void {
    updateAncestorTraversalFlagsOnAttach(this._lView);
    this._lView[FLAGS] |= LViewFlags.Attached;
  }

  /**
   * Checks the view and its children.
   *
   * This can also be used in combination with {@link ChangeDetectorRef#detach} to implement
   * local change detection checks.
   *
   * <!-- TODO: Add a link to a chapter on detach/reattach/local digest -->
   * <!-- TODO: Add a live demo once ref.detectChanges is merged into master -->
   *
   * @usageNotes
   * ### Example
   *
   * The following example defines a component with a large list of readonly data.
   * Imagine, the data changes constantly, many times per second. For performance reasons,
   * we want to check and update the list every five seconds.
   *
   * We can do that by detaching the component's change detector and doing a local change detection
   * check every five seconds.
   *
   * See {@link ChangeDetectorRef#detach} for more information.
   */
  detectChanges(): void {
    // Add `RefreshView` flag to ensure this view is refreshed if not already dirty.
    // `RefreshView` flag is used intentionally over `Dirty` because it gets cleared before
    // executing any of the actual refresh code while the `Dirty` flag doesn't get cleared
    // until the end of the refresh. Using `RefreshView` prevents creating a potential difference
    // in the state of the LViewFlags during template execution.
    this._lView[FLAGS] |= LViewFlags.RefreshView;
    detectChangesInternal(this._lView);
  }

  /**
   * Checks the change detector and its children, and throws if any changes are detected.
   *
   * This is used in development mode to verify that running change detection doesn't
   * introduce other changes.
   */
  checkNoChanges(): void {
    if (!ngDevMode) return;

    try {
      this.exhaustive ??= this._lView[INJECTOR].get(
        UseExhaustiveCheckNoChanges,
        USE_EXHAUSTIVE_CHECK_NO_CHANGES_DEFAULT,
      );
    } catch {
      this.exhaustive = USE_EXHAUSTIVE_CHECK_NO_CHANGES_DEFAULT;
    }
    checkNoChangesInternal(this._lView, this.exhaustive);
  }

  attachToViewContainerRef() {
    if (this._appRef) {
      throw new RuntimeError(
        RuntimeErrorCode.VIEW_ALREADY_ATTACHED,
        ngDevMode && 'This view is already attached directly to the ApplicationRef!',
      );
    }
    this._attachedToViewContainer = true;
  }

  detachFromAppRef() {
    this._appRef = null;
    const isRoot = isRootView(this._lView);
    const declarationContainer = this._lView[DECLARATION_LCONTAINER];
    if (declarationContainer !== null && !isRoot) {
      detachMovedView(declarationContainer, this._lView);
    }
    detachViewFromDOM(this._lView[TVIEW], this._lView);
  }

  attachToAppRef(appRef: ApplicationRef) {
    if (this._attachedToViewContainer) {
      throw new RuntimeError(
        RuntimeErrorCode.VIEW_ALREADY_ATTACHED,
        ngDevMode && 'This view is already attached to a ViewContainer!',
      );
    }
    this._appRef = appRef;
    const isRoot = isRootView(this._lView);
    const declarationContainer = this._lView[DECLARATION_LCONTAINER];
    if (declarationContainer !== null && !isRoot) {
      trackMovedView(declarationContainer, this._lView);
    }
    updateAncestorTraversalFlagsOnAttach(this._lView);
  }
}

/**
 * Reports whether the given view is considered dirty according to the different marking mechanisms.
 */
export function isViewDirty(view: ViewRef<unknown>): boolean {
  return requiresRefreshOrTraversal(view._lView) || !!(view._lView[FLAGS] & LViewFlags.Dirty);
}

export function markForRefresh(view: ViewRef<unknown>): void {
  // This function is only used by elements where _cdRefInjectingView is the same as _lView
  markViewForRefresh(view._lView);
}
