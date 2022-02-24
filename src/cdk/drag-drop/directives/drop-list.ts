/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  BooleanInput,
  coerceArray,
  coerceNumberProperty,
  coerceBooleanProperty,
  NumberInput,
} from '@angular/cdk/coercion';
import {
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  Optional,
  Directive,
  ChangeDetectorRef,
  SkipSelf,
  Inject,
  InjectionToken,
} from '@angular/core';
import {Directionality} from '@angular/cdk/bidi';
import {ScrollDispatcher} from '@angular/cdk/scrolling';
import {CdkDrag} from './drag';
import {CdkDragDrop, CdkDragEnter, CdkDragExit, CdkDragSortEvent} from '../drag-events';
import {CDK_DROP_LIST_GROUP, CdkDropListGroup} from './drop-list-group';
import {DropListRef} from '../drop-list-ref';
import {DragRef} from '../drag-ref';
import {DragDrop} from '../drag-drop';
import {DropListOrientation, DragAxis, DragDropConfig, CDK_DRAG_CONFIG} from './config';
import {Subject} from 'rxjs';
import {startWith, takeUntil} from 'rxjs/operators';
import {assertElementNode} from './assertions';

/** Counter used to generate unique ids for drop zones. */
let _uniqueIdCounter = 0;

/**
 * Internal compile-time-only representation of a `CdkDropList`.
 * Used to avoid circular import issues between the `CdkDropList` and the `CdkDrag`.
 * @docs-private
 */
export interface CdkDropListInternal extends CdkDropList {}

/**
 * Injection token that can be used to reference instances of `CdkDropList`. It serves as
 * alternative token to the actual `CdkDropList` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const CDK_DROP_LIST = new InjectionToken<CdkDropList>('CdkDropList');

/** Container that wraps a set of draggable items. */
@Directive({
  selector: '[cdkDropList], cdk-drop-list',
  exportAs: 'cdkDropList',
  providers: [
    // Prevent child drop lists from picking up the same group as their parent.
    {provide: CDK_DROP_LIST_GROUP, useValue: undefined},
    {provide: CDK_DROP_LIST, useExisting: CdkDropList},
  ],
  host: {
    'class': 'cdk-drop-list',
    '[attr.id]': 'id',
    '[class.cdk-drop-list-disabled]': 'disabled',
    '[class.cdk-drop-list-dragging]': '_dropListRef.isDragging()',
    '[class.cdk-drop-list-receiving]': '_dropListRef.isReceiving()',
  },
})
export class CdkDropList<T = any> implements OnDestroy {
  /** Emits when the list has been destroyed. */
  private readonly _destroyed = new Subject<void>();

  /** Whether the element's scrollable parents have been resolved. */
  private _scrollableParentsResolved: boolean;

  /** Keeps track of the drop lists that are currently on the page. */
  private static _dropLists: CdkDropList[] = [];

  /** Reference to the underlying drop list instance. */
  _dropListRef: DropListRef<CdkDropList<T>>;

  /**
   * Other draggable containers that this container is connected to and into which the
   * container's items can be transferred. Can either be references to other drop containers,
   * or their unique IDs.
   */
  @Input('cdkDropListConnectedTo')
  connectedTo: (CdkDropList | string)[] | CdkDropList | string = [];

  /** Arbitrary data to attach to this container. */
  @Input('cdkDropListData') data: T;

  /** Direction in which the list is oriented. */
  @Input('cdkDropListOrientation') orientation: DropListOrientation;

  /**
   * Unique ID for the drop zone. Can be used as a reference
   * in the `connectedTo` of another `CdkDropList`.
   */
  @Input() id: string = `cdk-drop-list-${_uniqueIdCounter++}`;

  /** Locks the position of the draggable elements inside the container along the specified axis. */
  @Input('cdkDropListLockAxis') lockAxis: DragAxis;

  /** Whether starting a dragging sequence from this container is disabled. */
  @Input('cdkDropListDisabled')
  get disabled(): boolean {
    return this._disabled || (!!this._group && this._group.disabled);
  }
  set disabled(value: BooleanInput) {
    // Usually we sync the directive and ref state right before dragging starts, in order to have
    // a single point of failure and to avoid having to use setters for everything. `disabled` is
    // a special case, because it can prevent the `beforeStarted` event from firing, which can lock
    // the user in a disabled state, so we also need to sync it as it's being set.
    this._dropListRef.disabled = this._disabled = coerceBooleanProperty(value);
  }
  private _disabled: boolean;

  /** Whether sorting within this drop list is disabled. */
  @Input('cdkDropListSortingDisabled')
  sortingDisabled: BooleanInput;

  /**
   * Function that is used to determine whether an item
   * is allowed to be moved into a drop container.
   */
  @Input('cdkDropListEnterPredicate')
  enterPredicate: (drag: CdkDrag, drop: CdkDropList) => boolean = () => true;

  /** Functions that is used to determine whether an item can be sorted into a particular index. */
  @Input('cdkDropListSortPredicate')
  sortPredicate: (index: number, drag: CdkDrag, drop: CdkDropList) => boolean = () => true;

  /** Whether to auto-scroll the view when the user moves their pointer close to the edges. */
  @Input('cdkDropListAutoScrollDisabled')
  autoScrollDisabled: BooleanInput;

  /** Number of pixels to scroll for each frame when auto-scrolling an element. */
  @Input('cdkDropListAutoScrollStep')
  autoScrollStep: NumberInput;

  /** Emits when the user drops an item inside the container. */
  @Output('cdkDropListDropped')
  readonly dropped: EventEmitter<CdkDragDrop<T, any>> = new EventEmitter<CdkDragDrop<T, any>>();

  /**
   * Emits when the user has moved a new drag item into this container.
   */
  @Output('cdkDropListEntered')
  readonly entered: EventEmitter<CdkDragEnter<T>> = new EventEmitter<CdkDragEnter<T>>();

  /**
   * Emits when the user removes an item from the container
   * by dragging it into another container.
   */
  @Output('cdkDropListExited')
  readonly exited: EventEmitter<CdkDragExit<T>> = new EventEmitter<CdkDragExit<T>>();

  /** Emits as the user is swapping items while actively dragging. */
  @Output('cdkDropListSorted')
  readonly sorted: EventEmitter<CdkDragSortEvent<T>> = new EventEmitter<CdkDragSortEvent<T>>();

  /**
   * Keeps track of the items that are registered with this container. Historically we used to
   * do this with a `ContentChildren` query, however queries don't handle transplanted views very
   * well which means that we can't handle cases like dragging the headers of a `mat-table`
   * correctly. What we do instead is to have the items register themselves with the container
   * and then we sort them based on their position in the DOM.
   */
  private _unsortedItems = new Set<CdkDrag>();

  constructor(
    /** Element that the drop list is attached to. */
    public element: ElementRef<HTMLElement>,
    dragDrop: DragDrop,
    private _changeDetectorRef: ChangeDetectorRef,
    private _scrollDispatcher: ScrollDispatcher,
    @Optional() private _dir?: Directionality,
    @Optional()
    @Inject(CDK_DROP_LIST_GROUP)
    @SkipSelf()
    private _group?: CdkDropListGroup<CdkDropList>,
    @Optional() @Inject(CDK_DRAG_CONFIG) config?: DragDropConfig,
  ) {
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      assertElementNode(element.nativeElement, 'cdkDropList');
    }

    this._dropListRef = dragDrop.createDropList(element);
    this._dropListRef.data = this;

    if (config) {
      this._assignDefaults(config);
    }

    this._dropListRef.enterPredicate = (drag: DragRef<CdkDrag>, drop: DropListRef<CdkDropList>) => {
      return this.enterPredicate(drag.data, drop.data);
    };

    this._dropListRef.sortPredicate = (
      index: number,
      drag: DragRef<CdkDrag>,
      drop: DropListRef<CdkDropList>,
    ) => {
      return this.sortPredicate(index, drag.data, drop.data);
    };

    this._setupInputSyncSubscription(this._dropListRef);
    this._handleEvents(this._dropListRef);
    CdkDropList._dropLists.push(this);

    if (_group) {
      _group._items.add(this);
    }
  }

  /** Registers an items with the drop list. */
  addItem(item: CdkDrag): void {
    this._unsortedItems.add(item);

    if (this._dropListRef.isDragging()) {
      this._syncItemsWithRef();
    }
  }

  /** Removes an item from the drop list. */
  removeItem(item: CdkDrag): void {
    this._unsortedItems.delete(item);

    if (this._dropListRef.isDragging()) {
      this._syncItemsWithRef();
    }
  }

  /** Gets the registered items in the list, sorted by their position in the DOM. */
  getSortedItems(): CdkDrag[] {
    return Array.from(this._unsortedItems).sort((a: CdkDrag, b: CdkDrag) => {
      const documentPosition = a._dragRef
        .getVisibleElement()
        .compareDocumentPosition(b._dragRef.getVisibleElement());

      // `compareDocumentPosition` returns a bitmask so we have to use a bitwise operator.
      // https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition
      // tslint:disable-next-line:no-bitwise
      return documentPosition & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });
  }

  ngOnDestroy() {
    const index = CdkDropList._dropLists.indexOf(this);

    if (index > -1) {
      CdkDropList._dropLists.splice(index, 1);
    }

    if (this._group) {
      this._group._items.delete(this);
    }

    this._unsortedItems.clear();
    this._dropListRef.dispose();
    this._destroyed.next();
    this._destroyed.complete();
  }

  /** Syncs the inputs of the CdkDropList with the options of the underlying DropListRef. */
  private _setupInputSyncSubscription(ref: DropListRef<CdkDropList>) {
    if (this._dir) {
      this._dir.change
        .pipe(startWith(this._dir.value), takeUntil(this._destroyed))
        .subscribe(value => ref.withDirection(value));
    }

    ref.beforeStarted.subscribe(() => {
      const siblings = coerceArray(this.connectedTo).map(drop => {
        if (typeof drop === 'string') {
          const correspondingDropList = CdkDropList._dropLists.find(list => list.id === drop);

          if (!correspondingDropList && (typeof ngDevMode === 'undefined' || ngDevMode)) {
            console.warn(`CdkDropList could not find connected drop list with id "${drop}"`);
          }

          return correspondingDropList!;
        }

        return drop;
      });

      if (this._group) {
        this._group._items.forEach(drop => {
          if (siblings.indexOf(drop) === -1) {
            siblings.push(drop);
          }
        });
      }

      // Note that we resolve the scrollable parents here so that we delay the resolution
      // as long as possible, ensuring that the element is in its final place in the DOM.
      if (!this._scrollableParentsResolved) {
        const scrollableParents = this._scrollDispatcher
          .getAncestorScrollContainers(this.element)
          .map(scrollable => scrollable.getElementRef().nativeElement);
        this._dropListRef.withScrollableParents(scrollableParents);

        // Only do this once since it involves traversing the DOM and the parents
        // shouldn't be able to change without the drop list being destroyed.
        this._scrollableParentsResolved = true;
      }

      ref.disabled = this.disabled;
      ref.lockAxis = this.lockAxis;
      ref.sortingDisabled = coerceBooleanProperty(this.sortingDisabled);
      ref.autoScrollDisabled = coerceBooleanProperty(this.autoScrollDisabled);
      ref.autoScrollStep = coerceNumberProperty(this.autoScrollStep, 2);
      ref
        .connectedTo(siblings.filter(drop => drop && drop !== this).map(list => list._dropListRef))
        .withOrientation(this.orientation);
    });
  }

  /** Handles events from the underlying DropListRef. */
  private _handleEvents(ref: DropListRef<CdkDropList>) {
    ref.beforeStarted.subscribe(() => {
      this._syncItemsWithRef();
      this._changeDetectorRef.markForCheck();
    });

    ref.entered.subscribe(event => {
      this.entered.emit({
        container: this,
        item: event.item.data,
        currentIndex: event.currentIndex,
      });
    });

    ref.exited.subscribe(event => {
      this.exited.emit({
        container: this,
        item: event.item.data,
      });
      this._changeDetectorRef.markForCheck();
    });

    ref.sorted.subscribe(event => {
      this.sorted.emit({
        previousIndex: event.previousIndex,
        currentIndex: event.currentIndex,
        container: this,
        item: event.item.data,
      });
    });

    ref.dropped.subscribe(dropEvent => {
      this.dropped.emit({
        previousIndex: dropEvent.previousIndex,
        currentIndex: dropEvent.currentIndex,
        previousContainer: dropEvent.previousContainer.data,
        container: dropEvent.container.data,
        item: dropEvent.item.data,
        isPointerOverContainer: dropEvent.isPointerOverContainer,
        distance: dropEvent.distance,
        dropPoint: dropEvent.dropPoint,
        event: dropEvent.event,
      });

      // Mark for check since all of these events run outside of change
      // detection and we're not guaranteed for something else to have triggered it.
      this._changeDetectorRef.markForCheck();
    });
  }

  /** Assigns the default input values based on a provided config object. */
  private _assignDefaults(config: DragDropConfig) {
    const {lockAxis, draggingDisabled, sortingDisabled, listAutoScrollDisabled, listOrientation} =
      config;

    this.disabled = draggingDisabled == null ? false : draggingDisabled;
    this.sortingDisabled = sortingDisabled == null ? false : sortingDisabled;
    this.autoScrollDisabled = listAutoScrollDisabled == null ? false : listAutoScrollDisabled;
    this.orientation = listOrientation || 'vertical';

    if (lockAxis) {
      this.lockAxis = lockAxis;
    }
  }

  /** Syncs up the registered drag items with underlying drop list ref. */
  private _syncItemsWithRef() {
    this._dropListRef.withItems(this.getSortedItems().map(item => item._dragRef));
  }
}
