/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Input} from '@angular/core';
import {coerceBooleanProperty} from '@angular/cdk/coercion';

/** Used to generate unique ID for each accordion. */
let nextId = 0;

/**
 * Directive whose purpose is to manage the expanded state of CdkAccordionItem children.
 */
@Directive({
  selector: 'cdk-accordion, [cdkAccordion]',
  exportAs: 'cdkAccordion',
})
export class CdkAccordion {
  /** A readonly id value to use for unique selection coordination. */
  readonly id = `cdk-accordion-${nextId++}`;

  /** Whether the accordion should allow multiple expanded accordion items simulateously. */
  @Input() get multi(): boolean { return this._multi; }
  set multi(multi: boolean) { this._multi = coerceBooleanProperty(multi); }
  private  _multi: boolean = false;
}
