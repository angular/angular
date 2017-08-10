/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Observable} from 'rxjs/Observable';
import {AbstractControl} from '../model';
import {ValidationErrors} from './validators';

/**
 * Base class for control directives.
 *
 * Only used internally in the forms module.
 *
 * @stable
 */
export abstract class AbstractControlDirective {
  abstract get control(): AbstractControl|null;

  get value(): any { return this.control ? this.control.value : null; }

  get valid(): boolean|null { return this.control ? this.control.valid : null; }

  get invalid(): boolean|null { return this.control ? this.control.invalid : null; }

  get pending(): boolean|null { return this.control ? this.control.pending : null; }

  get errors(): ValidationErrors|null { return this.control ? this.control.errors : null; }

  get pristine(): boolean|null { return this.control ? this.control.pristine : null; }

  get dirty(): boolean|null { return this.control ? this.control.dirty : null; }

  get touched(): boolean|null { return this.control ? this.control.touched : null; }

  get untouched(): boolean|null { return this.control ? this.control.untouched : null; }

  get disabled(): boolean|null { return this.control ? this.control.disabled : null; }

  get enabled(): boolean|null { return this.control ? this.control.enabled : null; }

  get statusChanges(): Observable<any>|null {
    return this.control ? this.control.statusChanges : null;
  }

  get valueChanges(): Observable<any>|null {
    return this.control ? this.control.valueChanges : null;
  }

  get path(): string[]|null { return null; }

  reset(value: any = undefined): void {
    if (this.control) this.control.reset(value);
  }

  hasError(errorCode: string, path?: string[]): boolean {
    return this.control ? this.control.hasError(errorCode, path) : false;
  }

  getError(errorCode: string, path?: string[]): any {
    return this.control ? this.control.getError(errorCode, path) : null;
  }
}
