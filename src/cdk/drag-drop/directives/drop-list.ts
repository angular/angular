/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceArray, coerceBooleanProperty} from '@angular/cdk/coercion';
import {
  ContentChildren,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  Output,
  QueryList,
  Optional,
  Directive,
  ChangeDetectorRef,
  SkipSelf,
  Inject,
  AfterContentInit,
} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {Directionality} from '@angular/cdk/bidi';
import {CdkDrag} from './drag';
import {DragDropRegistry} from '../drag-drop-registry';
import {CdkDragDrop, CdkDragEnter, CdkDragExit, CdkDragSortEvent} from '../drag-events';
import {CDK_DROP_LIST_CONTAINER, CdkDropListContainer} from '../drop-list-container';
import {CdkDropListGroup} from './drop-list-group';
import {DropListRef} from '../drop-list-ref';
import {DragRef} from '../drag-ref';
import {DragDrop} from '../drag-drop';
import {Subject} from 'rxjs';
import {startWith, takeUntil} from 'rxjs/operators';

/** Counter used to generate unique ids for drop zones. */
let _uniqueIdCounter = 0;

/**
 * Internal compile-time-only representation of a `CdkDropList`.
 * Used to avoid circular import issues between the `CdkDropList` and the `CdkDrag`.
 * @docs-private
 */
export interface CdkDropListInternal extends CdkDropList {}

// @breaking-change 8.0.0 `CdkDropList` implements `CdkDropListContainer` for backwards
// compatiblity. The implements clause, as well as all the methods that it enforces can
// be removed when `CdkDropListContainer` is deleted.

/** Container that wraps a set of draggable items. */
@Directive({
  selector: '[cdkDropList], cdk-drop-list',
  exportAs: 'cdkDropList',
  providers: [
    // Prevent child drop lists from picking up the same group as their parent.
    {provide: CdkDropListGroup, useValue: undefined},
    {provide: CDK_DROP_LIST_CONTAINER, useExisting: CdkDropList},
  ],
  host: {
    'class': 'cdk-drop-list',
    '[id]': 'id',
    '[class.cdk-drop-list-disabled]': 'disabled',
    '[class.cdk-drop-list-dragging]': '_dropListRef.isDragging()',
    '[class.cdk-drop-list-receiving]': '_dropListRef.isReceiving()',
  }
})
export class CdkDropList<T = any> implements CdkDropListContainer, AfterContentInit, OnDestroy {
  /** Emits when the list has been destroyed. */
  private _destroyed = new Subject<void>();

  /** Keeps track of the drop lists that are currently on the page. */
  private static _dropLists: CdkDropList[] = [];

  /** Reference to the underlying drop list instance. */
  _dropListRef: DropListRef<CdkDropList<T>>;

  /** Draggable items in the container. */
  @ContentChildren(forwardRef(() => CdkDrag), {
    // Explicitly set to false since some of the logic below makes assumptions about it.
    // The `.withItems` call below should be updated if we ever need to switch this to `true`.
    descendants: false
  }) _draggables: QueryList<CdkDrag>;

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
  @Input('cdkDropListOrientation') orientation: 'horizontal' | 'vertical' = 'vertical';

  /**
   * Unique ID for the drop zone. Can be used as a reference
   * in the `connectedTo` of another `CdkDropList`.
   */
  @Input() id: string = `cdk-drop-list-${_uniqueIdCounter++}`;

  /** Locks the position of the draggable elements inside the container along the specified axis. */
  @Input('cdkDropListLockAxis') lockAxis: 'x' | 'y';

  /** Whether starting a dragging sequence from this container is disabled. */
  @Input('cdkDropListDisabled')
  get disabled(): boolean {
    return this._disabled || (!!this._group && this._group.disabled);
  }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
  }
  private _disabled = false;

  /** Whether starting a dragging sequence from this container is disabled. */
  @Input('cdkDropListSortingDisabled')
  get sortingDisabled(): boolean { return this._sortingDisabled; }
  set sortingDisabled(value: boolean) {
    this._sortingDisabled = coerceBooleanProperty(value);
  }
  private _sortingDisabled = false;

  /**
   * Function that is used to determine whether an item
   * is allowed to be moved into a drop container.
   */
  @Input('cdkDropListEnterPredicate')
  enterPredicate: (drag: CdkDrag, drop: CdkDropList) => boolean = () => true

  /** Emits when the user drops an item inside the container. */
  @Output('cdkDropListDropped')
  dropped: EventEmitter<CdkDragDrop<T, any>> = new EventEmitter<CdkDragDrop<T, any>>();

  /**
   * Emits when the user has moved a new drag item into this container.
   */
  @Output('cdkDropListEntered')
  entered: EventEmitter<CdkDragEnter<T>> = new EventEmitter<CdkDragEnter<T>>();

  /**
   * Emits when the user removes an item from the container
   * by dragging it into another container.
   */
  @Output('cdkDropListExited')
  exited: EventEmitter<CdkDragExit<T>> = new EventEmitter<CdkDragExit<T>>();

  /** Emits as the user is swapping items while actively dragging. */
  @Output('cdkDropListSorted')
  sorted: EventEmitter<CdkDragSortEvent<T>> = new EventEmitter<CdkDragSortEvent<T>>();

  constructor(
    /** Element that the drop list is attached to. */
    public element: ElementRef<HTMLElement>,
    dragDropRegistry: DragDropRegistry<DragRef, DropListRef>,
    private _changeDetectorRef: ChangeDetectorRef,
    @Optional() private _dir?: Directionality,
    @Optional() @SkipSelf() private _group?: CdkDropListGroup<CdkDropList>,
    @Optional() @Inject(DOCUMENT) _document?: any,

    /**
     * @deprecated `dragDropRegistry` and `_document` parameters to be removed.
     * Also `dragDrop` parameter to be made required.
     * @breaking-change 8.0.0.
     */
    dragDrop?: DragDrop) {

    // @breaking-change 8.0.0 Remove null check once `dragDrop` parameter is made required.
    if (dragDrop) {
      this._dropListRef = dragDrop.createDropList(element);
    } else {
      this._dropListRef = new DropListRef(element, dragDropRegistry, _document || document);
    }

    this._dropListRef.data = this;
    this._dropListRef.enterPredicate = (drag: DragRef<CdkDrag>, drop: DropListRef<CdkDropList>) => {
      return this.enterPredicate(drag.data, drop.data);
    };

    this._syncInputs(this._dropListRef);
    this._handleEvents(this._dropListRef);
    CdkDropList._dropLists.push(this);

    if (_group) {
      _group._items.add(this);
    }
  }

  ngAfterContentInit() {
    this._draggables.changes
      .pipe(startWith(this._draggables), takeUntil(this._destroyed))
      .subscribe((items: QueryList<CdkDrag>) => {
        this._dropListRef.withItems(items.map(drag => drag._dragRef));
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

    this._dropListRef.dispose();
    this._destroyed.next();
    this._destroyed.complete();
  }

  /** Starts dragging an item. */
  start(): void {
    this._dropListRef.start();
  }

  /**
   * Drops an item into this container.
   * @param item Item being dropped into the container.
   * @param currentIndex Index at which the item should be inserted.
   * @param previousContainer Container from which the item got dragged in.
   * @param isPointerOverContainer Whether the user's pointer was over the
   *    container when the item was dropped.
   */
  drop(item: CdkDrag, currentIndex: number, previousContainer: Partial<CdkDropListContainer>,
    isPointerOverContainer: boolean): void {
    this._dropListRef.drop(item._dragRef, currentIndex,
      (previousContainer as CdkDropList)._dropListRef, isPointerOverContainer);
  }

  /**
   * Emits an event to indicate that the user moved an item into the container.
   * @param item Item that was moved into the container.
   * @param pointerX Position of the item along the X axis.
   * @param pointerY Position of the item along the Y axis.
   */
  enter(item: CdkDrag, pointerX: number, pointerY: number): void {
    this._dropListRef.enter(item._dragRef, pointerX, pointerY);
  }

  /**
   * Removes an item from the container after it was dragged into another container by the user.
   * @param item Item that was dragged out.
   */
  exit(item: CdkDrag): void {
    this._dropListRef.exit(item._dragRef);
  }

  /**
   * Figures out the index of an item in the container.
   * @param item Item whose index should be determined.
   */
  getItemIndex(item: CdkDrag): number {
    return this._dropListRef.getItemIndex(item._dragRef);
  }

  /**
   * Sorts an item inside the container based on its position.
   * @param item Item to be sorted.
   * @param pointerX Position of the item along the X axis.
   * @param pointerY Position of the item along the Y axis.
   * @param pointerDelta Direction in which the pointer is moving along each axis.
   */
  _sortItem(item: CdkDrag, pointerX: number, pointerY: number,
            pointerDelta: {x: number, y: number}): void {
    return this._dropListRef._sortItem(item._dragRef, pointerX, pointerY, pointerDelta);
  }

  /**
   * Figures out whether an item should be moved into a sibling
   * drop container, based on its current position.
   * @param item Drag item that is being moved.
   * @param x Position of the item along the X axis.
   * @param y Position of the item along the Y axis.
   */
  _getSiblingContainerFromPosition(item: CdkDrag, x: number, y: number):
    CdkDropListContainer | null {
    const result = this._dropListRef._getSiblingContainerFromPosition(item._dragRef, x, y);
    return result ? result.data : null;
  }

  /**
   * Checks whether the user's pointer is positioned over the container.
   * @param x Pointer position along the X axis.
   * @param y Pointer position along the Y axis.
   */
  _isOverContainer(x: number, y: number): boolean {
    return this._dropListRef._isOverContainer(x, y);
  }

  /** Syncs the inputs of the CdkDropList with the options of the underlying DropListRef. */
  private _syncInputs(ref: DropListRef<CdkDropList>) {
    if (this._dir) {
      this._dir.change
        .pipe(startWith(this._dir.value), takeUntil(this._destroyed))
        .subscribe(value => ref.withDirection(value));
    }

    ref.beforeStarted.subscribe(() => {
      const siblings = coerceArray(this.connectedTo).map(drop => {
        return typeof drop === 'string' ?
            CdkDropList._dropLists.find(list => list.id === drop)! : drop;
      });

      if (this._group) {
        this._group._items.forEach(drop => {
          if (siblings.indexOf(drop) === -1) {
            siblings.push(drop);
          }
        });
      }

      ref.disabled = this.disabled;
      ref.lockAxis = this.lockAxis;
      ref.sortingDisabled = this.sortingDisabled;
      ref
        .connectedTo(siblings.filter(drop => drop && drop !== this).map(list => list._dropListRef))
        .withOrientation(this.orientation);
    });
  }

  /** Handles events from the underlying DropListRef. */
  private _handleEvents(ref: DropListRef<CdkDropList>) {
    ref.beforeStarted.subscribe(() => {
      this._changeDetectorRef.markForCheck();
    });

    ref.entered.subscribe(event => {
      this.entered.emit({
        container: this,
        item: event.item.data
      });
    });

    ref.exited.subscribe(event => {
      this.exited.emit({
        container: this,
        item: event.item.data
      });
    });

    ref.sorted.subscribe(event => {
      this.sorted.emit({
        previousIndex: event.previousIndex,
        currentIndex: event.currentIndex,
        container: this,
        item: event.item.data
      });
    });

    ref.dropped.subscribe(event => {
      this.dropped.emit({
        previousIndex: event.previousIndex,
        currentIndex: event.currentIndex,
        previousContainer: event.previousContainer.data,
        container: event.container.data,
        item: event.item.data,
        isPointerOverContainer: event.isPointerOverContainer
      });

      // Mark for check since all of these events run outside of change
      // detection and we're not guaranteed for something else to have triggered it.
      this._changeDetectorRef.markForCheck();
    });
  }

}
