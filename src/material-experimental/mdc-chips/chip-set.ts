/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  Input,
  OnDestroy,
  QueryList,
  ViewEncapsulation
} from '@angular/core';
import {MDCChipSetAdapter, MDCChipSetFoundation} from '@material/chips';
import {MatChip, MatChipEvent} from './chip';
import {merge, Observable, Subject, Subscription} from 'rxjs';
import {startWith, takeUntil} from 'rxjs/operators';

let uid = 0;

/**
 * Basic container component for the MatChip component.
 *
 * Extended by MatChipListbox and MatChipGrid for different interaction patterns.
 */
@Component({
  moduleId: module.id,
  selector: 'mat-chip-set',
  template: '<ng-content></ng-content>',
  styleUrls: ['chips.css'],
  host: {
    'class': 'mat-mdc-chip-set mdc-chip-set',
    'role': 'presentation',
    // TODO: replace this binding with use of AriaDescriber
    '[attr.aria-describedby]': '_ariaDescribedby || null',
    '[id]': '_uid',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatChipSet implements AfterContentInit, AfterViewInit, OnDestroy {
  /** Subscription to remove changes in chips. */
  private _chipRemoveSubscription: Subscription | null;

  /** Subscription to chip interactions. */
  private _chipInteractionSubscription: Subscription | null;

  /**
   * When a chip is destroyed, we store the index of the destroyed chip until the chips
   * query list notifies about the update. This is necessary because we cannot determine an
   * appropriate chip that should receive focus until the array of chips updated completely.
   */
  protected _lastDestroyedChipIndex: number | null = null;

  /** The MDC foundation containing business logic for MDC chip-set. */
  protected _chipSetFoundation: MDCChipSetFoundation;

  /** Subject that emits when the component has been destroyed. */
  protected _destroyed = new Subject<void>();

  /**
   * Implementation of the MDC chip-set adapter interface.
   * These methods are called by the chip set foundation.
   */
  protected _chipSetAdapter: MDCChipSetAdapter = {
    hasClass: (className) => this._hasMdcClass(className),
    // No-op. We keep track of chips via ContentChildren, which will be updated when a chip is
    // removed.
    removeChip: () => {},
    // No-op for base chip set. MatChipListbox overrides the adapter to provide this method.
    setSelected: () => {}
  };

  /** The aria-describedby attribute on the chip list for improved a11y. */
  _ariaDescribedby: string;

  /** Uid of the chip set */
  _uid: string = `mat-mdc-chip-set-${uid++}`;

  /**
   * Map from class to whether the class is enabled.
   * Enabled classes are set on the MDC chip-set div.
   */
  _mdcClasses: {[key: string]: boolean} = {};

  /** Whether the chip set is disabled. */
  @Input()
  get disabled(): boolean { return this._disabled; }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
    this._syncChipsState();
  }
  protected _disabled: boolean = false;

  /** Whether the chip list contains chips or not. */
  get empty(): boolean { return this._chips.length === 0; }

  /** Whether any of the chips inside of this chip-set has focus. */
  get focused(): boolean { return this._hasFocusedChip(); }

  /** Combined stream of all of the child chips' remove events. */
  get chipRemoveChanges(): Observable<MatChipEvent> {
    return merge(...this._chips.map(chip => chip.removed));
  }

  /** Combined stream of all of the child chips' interaction events. */
  get chipInteractionChanges(): Observable<string> {
    return merge(...this._chips.map(chip => chip.interaction));
  }

  /** The chips that are part of this chip set. */
  @ContentChildren(MatChip) _chips: QueryList<MatChip>;

  constructor(protected _elementRef: ElementRef,
              protected _changeDetectorRef: ChangeDetectorRef) {
    this._chipSetFoundation = new MDCChipSetFoundation(this._chipSetAdapter);
  }

  ngAfterViewInit() {
    this._chipSetFoundation.init();
  }

  ngAfterContentInit() {
    this._chips.changes.pipe(startWith(null), takeUntil(this._destroyed)).subscribe(() => {
      if (this.disabled) {
        // Since this happens after the content has been
        // checked, we need to defer it to the next tick.
        Promise.resolve().then(() => {
          this._syncChipsState();
        });
      }

      this._resetChips();
    });
  }

  ngOnDestroy() {
    this._dropSubscriptions();
    this._destroyed.next();
    this._destroyed.complete();
    this._chipSetFoundation.destroy();
  }

  /** Checks whether any of the chips is focused. */
  protected _hasFocusedChip() {
    return this._chips.some(chip => chip._hasFocus);
  }

  /** Syncs the chip-set's state with the individual chips. */
  protected _syncChipsState() {
    if (this._chips) {
      this._chips.forEach(chip => {
        chip.disabled = this._disabled;
        chip._changeDetectorRef.markForCheck();
      });
    }
  }

  /** Sets whether the given CSS class should be applied to the MDC chip. */
  protected _setMdcClass(cssClass: string, active: boolean) {
      const classes = this._elementRef.nativeElement.classList;
      active ? classes.add(cssClass) : classes.remove(cssClass);
      this._changeDetectorRef.markForCheck();
  }

  /** Adapter method that returns true if the chip set has the given MDC class. */
  protected _hasMdcClass(className: string) {
    return this._elementRef.nativeElement.classList.contains(className);
  }

  /** Updates subscriptions to chip events. */
  private _resetChips() {
    this._dropSubscriptions();
    this._subscribeToChipEvents();
  }

  /** Subscribes to events on the child chips. */
  protected _subscribeToChipEvents() {
    this._listenToChipsRemove();
    this._listenToChipsInteraction();
  }

  /** Subscribes to chip removal events. */
  private _listenToChipsRemove() {
    this._chipRemoveSubscription = this.chipRemoveChanges.subscribe((event: MatChipEvent) => {
       this._handleChipRemove(event);
    });
  }

  /** Subscribes to chip interaction events. */
  private _listenToChipsInteraction() {
    this._chipInteractionSubscription = this.chipInteractionChanges.subscribe((id: string) => {
      this._handleChipInteraction(id);
    });
  }

  /**
   * Called when one of the chips is about to be removed.
   * If the removed chip has focus, stores its index so we can refocus.
   */
  protected _handleChipRemove(event: MatChipEvent) {
    this._chipSetFoundation.handleChipRemoval(event.chip.id);
    const chip = event.chip;
    const chipIndex: number = this._chips.toArray().indexOf(event.chip);

    // In case the chip that will be removed is currently focused, we temporarily store
    // the index in order to be able to determine an appropriate sibling chip that will
    // receive focus.
    if (this._isValidIndex(chipIndex) && chip._hasFocus) {
      this._lastDestroyedChipIndex = chipIndex;
    }
  }

  /** Notifies the chip set foundation when the user interacts with a chip. */
  protected _handleChipInteraction(id: string) {
    this._chipSetFoundation.handleChipInteraction(id);
  }

  /** Unsubscribes from all chip events. */
  protected _dropSubscriptions() {
    if (this._chipRemoveSubscription) {
      this._chipRemoveSubscription.unsubscribe();
      this._chipRemoveSubscription = null;
    }

    if (this._chipInteractionSubscription) {
      this._chipInteractionSubscription.unsubscribe();
      this._chipInteractionSubscription = null;
    }
  }

  /** Dummy method for subclasses to override. Base chip set cannot be focused. */
  focus() {}

  /**
   * Utility to ensure all indexes are valid.
   *
   * @param index The index to be checked.
   * @returns True if the index is valid for our list of chips.
   */
  protected _isValidIndex(index: number): boolean {
    return index >= 0 && index < this._chips.length;
  }
}

