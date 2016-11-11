/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Observable} from '../facade/async';
import {AbstractControl} from '../model';

/**
 * Base class for control directives.
 *
 * Only used internally in the forms module.
 *
 * @stable
 */
export abstract class AbstractControlDirective {
  get control(): AbstractControl { throw new Error('unimplemented'); }

  get value(): any { return this.control ? this.control.value : null; }

  get valid(): boolean { return this.control ? this.control.valid : null; }

  get invalid(): boolean { return this.control ? this.control.invalid : null; }

  get pending(): boolean { return this.control ? this.control.pending : null; }

  get errors(): {[key: string]: any} { return this.control ? this.control.errors : null; }

  get pristine(): boolean { return this.control ? this.control.pristine : null; }

  get dirty(): boolean { return this.control ? this.control.dirty : null; }

  get touched(): boolean { return this.control ? this.control.touched : null; }

  get untouched(): boolean { return this.control ? this.control.untouched : null; }

  get disabled(): boolean { return this.control ? this.control.disabled : null; }

  get enabled(): boolean { return this.control ? this.control.enabled : null; }

  get statusChanges(): Observable<any> { return this.control ? this.control.statusChanges : null; }

  get valueChanges(): Observable<any> { return this.control ? this.control.valueChanges : null; }

  get path(): string[] { return null; }

  reset(value: any = undefined): void {
    if (this.control) this.control.reset(value);
  }

  hasError(errorCode: string, path: string[] = null): boolean {
    return this.control ? this.control.hasError(errorCode, path) : false;
  }

  getError(errorCode: string, path: string[] = null): any {
    return this.control ? this.control.getError(errorCode, path) : null;
  }
}
