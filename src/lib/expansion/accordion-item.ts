/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Output,
  EventEmitter,
  Input,
  Injectable,
  OnDestroy,
  Optional,
  ChangeDetectorRef,
} from '@angular/core';
import {UniqueSelectionDispatcher} from '@angular/cdk/collections';
import {CdkAccordion} from './accordion';

/** Used to generate unique ID for each expansion panel. */
let nextId = 0;

/**
 * An abstract class to be extended and decorated as a component.  Sets up all
 * events and attributes needed to be managed by a CdkAccordion parent.
 */
@Injectable()
export class AccordionItem implements OnDestroy {
  /** Event emitted every time the AccordionItem is closed. */
  @Output() closed = new EventEmitter<void>();
  /** Event emitted every time the AccordionItem is opened. */
  @Output() opened = new EventEmitter<void>();
  /** Event emitted when the AccordionItem is destroyed. */
  @Output() destroyed = new EventEmitter<void>();
  /** The unique AccordionItem id. */
  readonly id = `cdk-accordion-child-${nextId++}`;

  /** Whether the AccordionItem is expanded. */
  @Input()
  get expanded(): boolean { return this._expanded; }
  set expanded(expanded: boolean) {
    // Only emit events and update the internal value if the value changes.
    if (this._expanded !== expanded) {
      this._expanded = expanded;
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
  private _expanded: boolean;

  /** Unregister function for _expansionDispatcher **/
  private _removeUniqueSelectionListener: () => void = () => {};

  constructor(@Optional() public accordion: CdkAccordion,
              private _changeDetectorRef: ChangeDetectorRef,
              protected _expansionDispatcher: UniqueSelectionDispatcher) {
    this._removeUniqueSelectionListener =
      _expansionDispatcher.listen((id: string, accordionId: string) => {
        if (this.accordion && !this.accordion.multi &&
            this.accordion.id === accordionId && this.id !== id) {
          this.expanded = false;
        }
      });
  }

  /** Emits an event for the accordion item being destroyed. */
  ngOnDestroy() {
    this.destroyed.emit();
    this._removeUniqueSelectionListener();
  }

  /** Toggles the expanded state of the accordion item. */
  toggle(): void {
    this.expanded = !this.expanded;
  }

  /** Sets the expanded state of the accordion item to false. */
  close(): void {
    this.expanded = false;
  }

  /** Sets the expanded state of the accordion item to true. */
  open(): void {
    this.expanded = true;
  }
}
