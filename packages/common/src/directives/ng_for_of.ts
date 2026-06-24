/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Directive,
  DoCheck,
  EmbeddedViewRef,
  Input,
  IterableChangeRecord,
  IterableChanges,
  IterableDiffer,
  IterableDiffers,
  NgIterable,
  ɵRuntimeError as RuntimeError,
  TemplateRef,
  TrackByFunction,
  ViewContainerRef,
} from '@angular/core';

import {RuntimeErrorCode} from '../errors';

/**
 * @publicApi
 *
 * @deprecated 20.0
 * The `ngFor` directive is deprecated. Use the `@for` block instead.
 */
export class NgForOfContext<T, U extends NgIterable<T> = NgIterable<T>> {
  constructor(
    /** Reference to the current item from the collection. */
    public $implicit: T,

    /**
     * The value of the iterable expression. Useful when the expression is
     * more complex then a property access, for example when using the async pipe
     * (`userStreams | async`).
     */
    public ngForOf: U,

    /** Returns an index of the current item in the collection. */
    public index: number,

    /** Returns total amount of items in the collection. */
    public count: number,
  ) {}

  // Indicates whether this is the first item in the collection.
  get first(): boolean {
    return this.index === 0;
  }

  // Indicates whether this is the last item in the collection.
  get last(): boolean {
    return this.index === this.count - 1;
  }

  // Indicates whether an index of this item in the collection is even.
  get even(): boolean {
    return this.index % 2 === 0;
  }

  // Indicates whether an index of this item in the collection is odd.
  get odd(): boolean {
    return !this.even;
  }
}

/**
 * A [structural directive](guide/directives/structural-directives) that renders
 * a template for each item in a collection.
 * The directive is placed on an element, which becomes the parent
 * of the cloned templates.
 *
 * The `ngForOf` directive is generally used in the
 * [shorthand form](guide/directives/structural-directives#asterisk) `*ngFor`.
 * In this form, the template to be rendered for each iteration is the content
 * of an anchor element containing the directive.
 *
 * The following example shows the shorthand syntax with some options,
 * contained in an `<li>` element.
 *
 * ```html
 * <li *ngFor="let item of items; index as i; trackBy: trackByFn">...</li>
 * ```
 *
 * The shorthand form expands into a long form that uses the `ngForOf` selector
 * on an `<ng-template>` element.
 * The content of the `<ng-template>` element is the `<li>` element that held the
 * short-form directive.
 *
 * Here is the expanded version of the short-form example.
 *
 * ```html
 * <ng-template ngFor let-item [ngForOf]="items" let-i="index" [ngForTrackBy]="trackByFn">
 *   <li>...</li>
 * </ng-template>
 * ```
 *
 * Angular automatically expands the shorthand syntax as it compiles the template.
 * The context for each embedded view is logically merged to the current component
 * context according to its lexical position.
 *
 * When using the shorthand syntax, Angular allows only [one structural directive
 * on an element](guide/directives/structural-directives#one-per-element).
 * If you want to iterate conditionally, for example,
 * put the `*ngIf` on a container element that wraps the `*ngFor` element.
 * For further discussion, see
 * [Structural Directives](guide/directives/structural-directives#one-per-element).
 *
 * @usageNotes
 *
 * ### Local variables
 *
 * `NgForOf` provides exported values that can be aliased to local variables.
 * For example:
 *
 *  ```html
 * <li *ngFor="let user of users; index as i; first as isFirst">
 *    {{i}}/{{users.length}}. {{user}} <span *ngIf="isFirst">default</span>
 * </li>
 * ```
 *
 * The following exported values can be aliased to local variables:
 *
 * - `$implicit: T`: The value of the individual items in the iterable (`ngForOf`).
 * - `ngForOf: NgIterable<T>`: The value of the iterable expression. Useful when the expression is
 * more complex then a property access, for example when using the async pipe (`userStreams |
 * async`).
 * - `index: number`: The index of the current item in the iterable.
 * - `count: number`: The length of the iterable.
 * - `first: boolean`: True when the item is the first item in the iterable.
 * - `last: boolean`: True when the item is the last item in the iterable.
 * - `even: boolean`: True when the item has an even index in the iterable.
 * - `odd: boolean`: True when the item has an odd index in the iterable.
 *
 * ### Change propagation
 *
 * When the contents of the iterator changes, `NgForOf` makes the corresponding changes to the DOM:
 *
 * * When an item is added, a new instance of the template is added to the DOM.
 * * When an item is removed, its template instance is removed from the DOM.
 * * When items are reordered, their respective templates are reordered in the DOM.
 *
 * Angular uses object identity to track insertions and deletions within the iterator and reproduce
 * those changes in the DOM. This has important implications for animations and any stateful
 * controls that are present, such as `<input>` elements that accept user input. Inserted rows can
 * be animated in, deleted rows can be animated out, and unchanged rows retain any unsaved state
 * such as user input.
 * For more on animations, see [Transitions and Triggers](guide/animations/transition-and-triggers).
 *
 * The identities of elements in the iterator can change while the data does not.
 * This can happen, for example, if the iterator is produced from an RPC to the server, and that
 * RPC is re-run. Even if the data hasn't changed, the second response produces objects with
 * different identities, and Angular must tear down the entire DOM and rebuild it (as if all old
 * elements were deleted and all new elements inserted).
 *
 * To avoid this expensive operation, you can customize the default tracking algorithm.
 * by supplying the `trackBy` option to `NgForOf`.
 * `trackBy` takes a function that has two arguments: `index` and `item`.
 * If `trackBy` is given, Angular tracks changes by the return value of the function.
 *
 * @see [Structural Directives](guide/directives/structural-directives)
 * @ngModule CommonModule
 * @publicApi
 *
 * @deprecated 20.0
 * Use the `@for` block instead. Intent to remove in v22
 */
@Directive({
  selector: '[ngFor][ngForOf]',
})
export class NgForOf<T, U extends NgIterable<T> = NgIterable<T>> implements DoCheck {
  /**
   * The value of the iterable expression, which can be used as a
   * [template input variable](guide/directives/structural-directives#shorthand).
   * @deprecated The `ngFor` directive is deprecated. Use the `@for` block instead.
   */
  @Input()
  set ngForOf(ngForOf: (U & NgIterable<T>) | undefined | null) {
    this._ngForOf = ngForOf;
    this._ngForOfDirty = true;
  }
  /**
   * Specifies a custom `TrackByFunction` to compute the identity of items in an iterable.
   *
   * If a custom `TrackByFunction` is not provided, `NgForOf` will use the item's [object
   * identity](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is)
   * as the key.
   *
   * `NgForOf` uses the computed key to associate items in an iterable with DOM elements
   * it produces for these items.
   *
   * A custom `TrackByFunction` is useful to provide good user experience in cases when items in an
   * iterable rendered using `NgForOf` have a natural identifier (for example, custom ID or a
   * primary key), and this iterable could be updated with new object instances that still
   * represent the same underlying entity (for example, when data is re-fetched from the server,
   * and the iterable is recreated and re-rendered, but most of the data is still the same).
   *
   * @see {@link TrackByFunction}
   * @deprecated The `ngFor` directive is deprecated. Use the `@for` block instead.
   */
  @Input()
  set ngForTrackBy(fn: TrackByFunction<T>) {
    if ((typeof ngDevMode === 'undefined' || ngDevMode) && fn != null && typeof fn !== 'function') {
      console.warn(
        `trackBy must be a function, but received ${JSON.stringify(fn)}. ` +
          `See https://angular.dev/api/common/NgForOf#change-propagation for more information.`,
      );
    }
    this._trackByFn = fn;
  }

  get ngForTrackBy(): TrackByFunction<T> {
    return this._trackByFn;
  }

  private _ngForOf: U | undefined | null = null;
  private _ngForOfDirty: boolean = true;
  private _differ: IterableDiffer<T> | null = null;
  // waiting for microsoft/typescript#43662 to allow the return type `TrackByFunction|undefined` for
  // the getter
  private _trackByFn!: TrackByFunction<T>;

  constructor(
    private _viewContainer: ViewContainerRef,
    private _template: TemplateRef<NgForOfContext<T, U>>,
    private _differs: IterableDiffers,
  ) {}

  /**
   * A reference to the template that is stamped out for each item in the iterable.
   * @see [template reference variable](guide/templates/variables#template-reference-variables)
   * @deprecated The `ngFor` directive is deprecated. Use the `@for` block instead.
   */
  @Input()
  set ngForTemplate(value: TemplateRef<NgForOfContext<T, U>>) {
    // TODO(TS2.1): make TemplateRef<Partial<NgForRowOf<T>>> once we move to TS v2.1
    // The current type is too restrictive; a template that just uses index, for example,
    // should be acceptable.
    if (value) {
      this._template = value;
    }
  }

  /**
   * Applies the changes when needed.
   * @docs-private
   */
  ngDoCheck(): void {
    if (this._ngForOfDirty) {
      this._ngForOfDirty = false;
      // React on ngForOf changes only once all inputs have been initialized
      const value = this._ngForOf;
      if (!this._differ && value) {
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
          try {
            // CAUTION: this logic is duplicated for production mode below, as the try-catch
            // is only present in development builds.
            this._differ = this._differs.find(value).create(this.ngForTrackBy);
          } catch {
            let errorMessage =
              `Cannot find a differ supporting object '${value}' of type '` +
              `${getTypeName(value)}'. NgFor only supports binding to Iterables, such as Arrays.`;
            if (typeof value === 'object') {
              errorMessage += ' Did you mean to use the keyvalue pipe?';
            }
            throw new RuntimeError(RuntimeErrorCode.NG_FOR_MISSING_DIFFER, errorMessage);
          }
        } else {
          // CAUTION: this logic is duplicated for development mode above, as the try-catch
          // is only present in development builds.
          this._differ = this._differs.find(value).create(this.ngForTrackBy);
        }
      }
    }
    if (this._differ) {
      const changes = this._differ.diff(this._ngForOf);
      if (changes) this._applyChanges(changes);
    }
  }

  private _applyChanges(changes: IterableChanges<T>) {
    const viewContainer = this._viewContainer;
    changes.forEachOperation(
      (
        item: IterableChangeRecord<T>,
        adjustedPreviousIndex: number | null,
        currentIndex: number | null,
      ) => {
        if (item.previousIndex == null) {
          // NgForOf is never "null" or "undefined" here because the differ detected
          // that a new item needs to be inserted from the iterable. This implies that
          // there is an iterable value for "_ngForOf".
          viewContainer.createEmbeddedView(
            this._template,
            new NgForOfContext<T, U>(item.item, this._ngForOf!, -1, -1),
            currentIndex === null ? undefined : currentIndex,
          );
        } else if (currentIndex == null) {
          viewContainer.remove(adjustedPreviousIndex === null ? undefined : adjustedPreviousIndex);
        } else if (adjustedPreviousIndex !== null) {
          const view = viewContainer.get(adjustedPreviousIndex)!;
          viewContainer.move(view, currentIndex);
          applyViewChange(view as EmbeddedViewRef<NgForOfContext<T, U>>, item);
        }
      },
    );

    for (let i = 0, ilen = viewContainer.length; i < ilen; i++) {
      const viewRef = <EmbeddedViewRef<NgForOfContext<T, U>>>viewContainer.get(i);
      const context = viewRef.context;
      context.index = i;
      context.count = ilen;
      context.ngForOf = this._ngForOf!;
    }

    changes.forEachIdentityChange((record: any) => {
      const viewRef = <EmbeddedViewRef<NgForOfContext<T, U>>>viewContainer.get(record.currentIndex);
      applyViewChange(viewRef, record);
    });
  }

  /**
   * Asserts the correct type of the context for the template that `NgForOf` will render.
   *
   * The presence of this method is a signal to the Ivy template type-check compiler that the
   * `NgForOf` structural directive renders its template with a specific context type.
   */
  static ngTemplateContextGuard<T, U extends NgIterable<T>>(
    dir: NgForOf<T, U>,
    ctx: any,
  ): ctx is NgForOfContext<T, U> {
    return true;
  }
}

// Also export the `NgForOf` class as `NgFor` to improve the DX for
// cases when the directive is used as standalone, so the class name
// matches the CSS selector (*ngFor).
export {NgForOf as NgFor};

function applyViewChange<T>(
  view: EmbeddedViewRef<NgForOfContext<T>>,
  record: IterableChangeRecord<T>,
) {
  view.context.$implicit = record.item;
}

function getTypeName(type: any): string {
  return type['name'] || typeof type;
}
