/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LiveAnnouncer} from '@angular/cdk/a11y';
import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';
import {DOCUMENT} from '@angular/common';
import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  QueryList,
  ViewEncapsulation,
} from '@angular/core';
import {HasTabIndex, mixinTabIndex} from '@angular/material-experimental/mdc-core';
import {
  MDCChipSetFoundation,
  MDCChipSetAdapter,
  MDCChipFoundation,
  MDCChipEvents,
  ChipAnimationEvent,
  ChipInteractionEvent,
  ChipNavigationEvent,
  MDCChipActionType,
} from '@material/chips';
import {merge, Observable, Subject} from 'rxjs';
import {startWith, switchMap, takeUntil} from 'rxjs/operators';
import {MatChip, MatChipEvent} from './chip';
import {emitCustomEvent} from './emit-event';

/**
 * Boilerplate for applying mixins to MatChipSet.
 * @docs-private
 */
abstract class MatChipSetBase {
  abstract disabled: boolean;
  constructor(_elementRef: ElementRef) {}
}
const _MatChipSetMixinBase = mixinTabIndex(MatChipSetBase);

/**
 * Basic container component for the MatChip component.
 *
 * Extended by MatChipListbox and MatChipGrid for different interaction patterns.
 */
@Component({
  selector: 'mat-chip-set',
  template: `
    <span class="mdc-evolution-chip-set__chips" role="presentation">
      <ng-content></ng-content>
    </span>
  `,
  styleUrls: ['chip-set.css'],
  host: {
    'class': 'mat-mdc-chip-set mdc-evolution-chip-set',
    '[attr.role]': 'role',
  },
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatChipSet
  extends _MatChipSetMixinBase
  implements AfterContentInit, AfterViewInit, HasTabIndex, OnDestroy
{
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

  /** Role to use if it hasn't been overwritten by the user. */
  protected _defaultRole = 'presentation';

  /** Combined stream of all of the child chips' remove events. */
  get chipDestroyedChanges(): Observable<MatChipEvent> {
    return this._getChipStream(chip => chip.destroyed);
  }

  /**
   * Implementation of the MDC chip-set adapter interface.
   * These methods are called by the chip set foundation.
   */
  protected _chipSetAdapter: MDCChipSetAdapter = {
    announceMessage: message => this._liveAnnouncer.announce(message),
    emitEvent: (eventName, eventDetail) => {
      emitCustomEvent(this._elementRef.nativeElement, this._document, eventName, eventDetail, true);
    },
    getAttribute: name => this._elementRef.nativeElement.getAttribute(name),
    getChipActionsAtIndex: index => this._chipFoundation(index)?.getActions() || [],
    getChipCount: () => this._chips.length,
    getChipIdAtIndex: index => this._chipFoundation(index)?.getElementID() || '',
    getChipIndexById: id => {
      return this._chips.toArray().findIndex(chip => chip._getFoundation().getElementID() === id);
    },
    isChipFocusableAtIndex: (index, actionType) => {
      return this._chipFoundation(index)?.isActionFocusable(actionType) || false;
    },
    isChipSelectableAtIndex: (index, actionType) => {
      return this._chipFoundation(index)?.isActionSelectable(actionType) || false;
    },
    isChipSelectedAtIndex: (index, actionType) => {
      return this._chipFoundation(index)?.isActionSelected(actionType) || false;
    },
    removeChipAtIndex: index => this._chips.toArray()[index]?.remove(),
    setChipFocusAtIndex: (index, action, behavior) => {
      this._chipFoundation(index)?.setActionFocus(action, behavior);
    },
    setChipSelectedAtIndex: (index, actionType, isSelected) => {
      // Setting the trailing action as deselected ends up deselecting the entire chip.
      // This is working as expected, but it's not something we want so we only apply the
      // selected state to the primary chip.
      if (actionType === MDCChipActionType.PRIMARY) {
        this._chipFoundation(index)?.setActionSelected(actionType, isSelected);
      }
    },
    startChipAnimationAtIndex: (index, animation) => {
      this._chipFoundation(index)?.startAnimation(animation);
    },
  };

  /**
   * Map from class to whether the class is enabled.
   * Enabled classes are set on the MDC chip-set div.
   */
  _mdcClasses: {[key: string]: boolean} = {};

  /** Whether the chip set is disabled. */
  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);
    this._syncChipsState();
  }
  protected _disabled: boolean = false;

  /** Whether the chip list contains chips or not. */
  get empty(): boolean {
    return this._chips.length === 0;
  }

  /** The ARIA role applied to the chip set. */
  @Input()
  get role(): string | null {
    if (this._explicitRole) {
      return this._explicitRole;
    }

    return this.empty ? null : this._defaultRole;
  }

  set role(value: string | null) {
    this._explicitRole = value;
  }
  private _explicitRole: string | null = null;

  /** Whether any of the chips inside of this chip-set has focus. */
  get focused(): boolean {
    return this._hasFocusedChip();
  }

  /** The chips that are part of this chip set. */
  @ContentChildren(MatChip, {
    // We need to use `descendants: true`, because Ivy will no longer match
    // indirect descendants if it's left as false.
    descendants: true,
  })
  _chips: QueryList<MatChip>;

  constructor(
    private _liveAnnouncer: LiveAnnouncer,
    @Inject(DOCUMENT) private _document: any,
    protected _elementRef: ElementRef<HTMLElement>,
    protected _changeDetectorRef: ChangeDetectorRef,
  ) {
    super(_elementRef);
    const element = _elementRef.nativeElement;
    this._chipSetFoundation = new MDCChipSetFoundation(this._chipSetAdapter);
    element.addEventListener(MDCChipEvents.ANIMATION, this._handleChipAnimation);
    element.addEventListener(MDCChipEvents.INTERACTION, this._handleChipInteraction);
    element.addEventListener(MDCChipEvents.NAVIGATION, this._handleChipNavigation);
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
    });

    this.chipDestroyedChanges.pipe(takeUntil(this._destroyed)).subscribe((event: MatChipEvent) => {
      const chip = event.chip;
      const chipIndex = this._chips.toArray().indexOf(event.chip);

      // In case the chip that will be removed is currently focused, we temporarily store
      // the index in order to be able to determine an appropriate sibling chip that will
      // receive focus.
      if (this._isValidIndex(chipIndex) && chip._hasFocus()) {
        this._lastDestroyedChipIndex = chipIndex;
      }
    });
  }

  ngOnDestroy() {
    const element = this._elementRef.nativeElement;
    element.removeEventListener(MDCChipEvents.ANIMATION, this._handleChipAnimation);
    element.removeEventListener(MDCChipEvents.INTERACTION, this._handleChipInteraction);
    element.removeEventListener(MDCChipEvents.NAVIGATION, this._handleChipNavigation);
    this._destroyed.next();
    this._destroyed.complete();
    this._chipSetFoundation.destroy();
  }

  /** Checks whether any of the chips is focused. */
  protected _hasFocusedChip() {
    return this._chips && this._chips.some(chip => chip._hasFocus());
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

  /** Checks whether an event comes from inside a chip element. */
  protected _originatesFromChip(event: Event): boolean {
    return this._checkForClassInHierarchy(event, 'mdc-evolution-chip');
  }

  /**
   * Removes the `tabindex` from the chip grid and resets it back afterwards, allowing the
   * user to tab out of it. This prevents the grid from capturing focus and redirecting
   * it back to the first chip, creating a focus trap, if it user tries to tab away.
   */
  protected _allowFocusEscape() {
    const previousTabIndex = this.tabIndex;

    if (this.tabIndex !== -1) {
      this.tabIndex = -1;

      setTimeout(() => {
        this.tabIndex = previousTabIndex;
        this._changeDetectorRef.markForCheck();
      });
    }
  }

  /**
   * Gets a stream of events from all the chips within the set.
   * The stream will automatically incorporate any newly-added chips.
   */
  protected _getChipStream<T, C extends MatChip = MatChip>(
    mappingFunction: (chip: C) => Observable<T>,
  ): Observable<T> {
    return this._chips.changes.pipe(
      startWith(null),
      switchMap(() => merge(...(this._chips as QueryList<C>).map(mappingFunction))),
    );
  }

  protected _checkForClassInHierarchy(event: Event, className: string) {
    let currentElement = event.target as HTMLElement | null;

    while (currentElement && currentElement !== this._elementRef.nativeElement) {
      // Null check the classList, because IE and Edge don't support it on all elements.
      if (currentElement.classList && currentElement.classList.contains(className)) {
        return true;
      }

      currentElement = currentElement.parentElement;
    }

    return false;
  }

  private _chipFoundation(index: number): MDCChipFoundation | undefined {
    return this._chips.toArray()[index]?._getFoundation();
  }

  private _handleChipAnimation = (event: Event) => {
    this._chipSetFoundation.handleChipAnimation(event as ChipAnimationEvent);
  };

  private _handleChipInteraction = (event: Event) => {
    this._chipSetFoundation.handleChipInteraction(event as ChipInteractionEvent);
  };

  private _handleChipNavigation = (event: Event) => {
    this._chipSetFoundation.handleChipNavigation(event as ChipNavigationEvent);
  };
}
