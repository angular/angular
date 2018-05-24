/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Output,
  Directive,
  EventEmitter,
  Input,
  OnDestroy,
  Optional,
  ChangeDetectorRef,
  SkipSelf,
} from '@angular/core';
import {UniqueSelectionDispatcher} from '@angular/cdk/collections';
import {CdkAccordion} from './accordion';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {Subscription} from 'rxjs';

/** Used to generate unique ID for each accordion item. */
let nextId = 0;

/**
 * An basic directive expected to be extended and decorated as a component.  Sets up all
 * events and attributes needed to be managed by a CdkAccordion parent.
 */
@Directive({
  selector: 'cdk-accordion-item, [cdkAccordionItem]',
  exportAs: 'cdkAccordionItem',
  providers: [
    // Provide CdkAccordion as undefined to prevent nested accordion items from registering
    // to the same accordion.
    {provide: CdkAccordion, useValue: undefined},
  ],
})
export class CdkAccordionItem implements OnDestroy {
  /** Subscription to openAll/closeAll events. */
  private _openCloseAllSubscription = Subscription.EMPTY;
  /** Event emitted every time the AccordionItem is closed. */
  @Output() closed: EventEmitter<void> = new EventEmitter<void>();
  /** Event emitted every time the AccordionItem is opened. */
  @Output() opened: EventEmitter<void> = new EventEmitter<void>();
  /** Event emitted when the AccordionItem is destroyed. */
  @Output() destroyed: EventEmitter<void> = new EventEmitter<void>();

  /**
   * Emits whenever the expanded state of the accordion changes.
   * Primarily used to facilitate two-way binding.
   * @docs-private
   */
  @Output() expandedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  /** The unique AccordionItem id. */
  readonly id: string = `cdk-accordion-child-${nextId++}`;

  /** Whether the AccordionItem is expanded. */
  @Input()
  get expanded(): any { return this._expanded; }
  set expanded(expanded: any) {
    expanded = coerceBooleanProperty(expanded);

    // Only emit events and update the internal value if the value changes.
    if (this._expanded !== expanded) {
      this._expanded = expanded;
      this.expandedChange.emit(expanded);

      if (expanded) {
        this.opened.emit();
        /**
         * In the unique selection dispatcher, the id parameter is the id of the CdkAccordionItem,
         * the name value is the id of the accordion.
         */
        const accordionId = this.accordion ? this.accordion.id : this.id;
        this._expansionDispatcher.notify(this.id, accordionId);
      } else {
        this.closed.emit();
      }

      // Ensures that the animation will run when the value is set outside of an `@Input`.
      // This includes cases like the open, close and toggle methods.
      this._changeDetectorRef.markForCheck();
    }
  }
  private _expanded = false;

  /** Whether the AccordionItem is disabled. */
  @Input()
  get disabled() { return this._disabled; }
  set disabled(disabled: any) { this._disabled = coerceBooleanProperty(disabled); }
  private _disabled: boolean = false;

  /** Unregister function for _expansionDispatcher. */
  private _removeUniqueSelectionListener: () => void = () => {};

  constructor(@Optional() @SkipSelf() public accordion: CdkAccordion,
              private _changeDetectorRef: ChangeDetectorRef,
              protected _expansionDispatcher: UniqueSelectionDispatcher) {
    this._removeUniqueSelectionListener =
      _expansionDispatcher.listen((id: string, accordionId: string) => {
        if (this.accordion && !this.accordion.multi &&
            this.accordion.id === accordionId && this.id !== id) {
          this.expanded = false;
        }
      });

    // When an accordion item is hosted in an accordion, subscribe to open/close events.
    if (this.accordion) {
      this._openCloseAllSubscription = this._subscribeToOpenCloseAllActions();
    }
  }

  /** Emits an event for the accordion item being destroyed. */
  ngOnDestroy() {
    this.opened.complete();
    this.closed.complete();
    this.destroyed.emit();
    this.destroyed.complete();
    this._removeUniqueSelectionListener();
    this._openCloseAllSubscription.unsubscribe();
  }

  /** Toggles the expanded state of the accordion item. */
  toggle(): void {
    if (!this.disabled) {
      this.expanded = !this.expanded;
    }
  }

  /** Sets the expanded state of the accordion item to false. */
  close(): void {
    if (!this.disabled) {
      this.expanded = false;
    }
  }

  /** Sets the expanded state of the accordion item to true. */
  open(): void {
    if (!this.disabled) {
      this.expanded = true;
    }
  }

  private _subscribeToOpenCloseAllActions(): Subscription {
    return this.accordion._openCloseAllActions.subscribe(expanded => {
      // Only change expanded state if item is enabled
      if (!this.disabled) {
        this.expanded = expanded;
      }
    });
  }
}
