/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {Directive, Input, OnChanges, OnDestroy, SimpleChanges} from '@angular/core';
import {Subject} from 'rxjs';

/** Used to generate unique ID for each accordion. */
let nextId = 0;

/**
 * Directive whose purpose is to manage the expanded state of CdkAccordionItem children.
 */
@Directive({
  selector: 'cdk-accordion, [cdkAccordion]',
  exportAs: 'cdkAccordion',
})
export class CdkAccordion implements OnDestroy, OnChanges {
  /** Emits when the state of the accordion changes */
  readonly _stateChanges = new Subject<SimpleChanges>();

  /** Stream that emits true/false when openAll/closeAll is triggered. */
  readonly _openCloseAllActions: Subject<boolean> = new Subject<boolean>();

  /** A readonly id value to use for unique selection coordination. */
  readonly id = `cdk-accordion-${nextId++}`;

  /** Whether the accordion should allow multiple expanded accordion items simultaneously. */
  @Input()
  get multi(): boolean { return this._multi; }
  set multi(multi: boolean) { this._multi = coerceBooleanProperty(multi); }
  private _multi: boolean = false;

  /** Opens all enabled accordion items in an accordion where multi is enabled. */
  openAll(): void {
    this._openCloseAll(true);
  }

  /** Closes all enabled accordion items in an accordion where multi is enabled. */
  closeAll(): void {
    this._openCloseAll(false);
  }

  ngOnChanges(changes: SimpleChanges) {
    this._stateChanges.next(changes);
  }

  ngOnDestroy() {
    this._stateChanges.complete();
  }

  private _openCloseAll(expanded: boolean): void {
    if (this.multi) {
      this._openCloseAllActions.next(expanded);
    }
  }
}
