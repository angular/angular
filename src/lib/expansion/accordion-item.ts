/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Output, EventEmitter, Input, Injectable, OnDestroy, Optional} from '@angular/core';
import {UniqueSelectionDispatcher} from '../core';
import {CdkAccordion} from './accordion';

/** Used to generate unique ID for each expansion panel. */
let nextId = 0;

/**
 * An abstract class to be extended and decorated as a component.  Sets up all
 * events and attributes needed to be managed by a CdkAccordion parent.
 */
@Injectable()
export class AccordionItem implements OnDestroy {
  /** Event emitted every time the MdAccordianChild is closed. */
  @Output() closed = new EventEmitter<void>();
  /** Event emitted every time the MdAccordianChild is opened. */
  @Output() opened = new EventEmitter<void>();
  /** Event emitted when the MdAccordianChild is destroyed. */
  @Output() destroyed = new EventEmitter<void>();
  /** The unique MdAccordianChild id. */
  readonly id = `cdk-accordion-child-${nextId++}`;
  /** Whether the MdAccordianChild is expanded. */
  @Input() get expanded(): boolean { return this._expanded; }
  set expanded(expanded: boolean) {
    // Only emit events and update the internal value if the value changes.
    if (this._expanded !== expanded) {
      this._expanded = expanded;
      if (expanded) {
        this.opened.emit();
        /**
         * In the unique selection dispatcher, the id parameter is the id of the CdkAccordonItem,
         * the name value is the id of the accordion.
         */
        let accordionId = this.accordion ? this.accordion.id : this.id;
        this._expansionDispatcher.notify(this.id, accordionId);
      } else {
        this.closed.emit();
      }
    }
  }
  private _expanded: boolean;

  /** Unregister function for _expansionDispatcher **/
  private _removeUniqueSelectionListener: () => void = () => {};

  constructor(@Optional() public accordion: CdkAccordion,
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
