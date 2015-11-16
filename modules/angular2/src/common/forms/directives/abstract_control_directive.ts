import {AbstractControl} from '../model';
import {isPresent} from 'angular2/src/facade/lang';
import {unimplemented} from 'angular2/src/facade/exceptions';

/**
 * Base class for control directives.
 *
 * Only used internally in the forms module.
 */
export abstract class AbstractControlDirective {
  get control(): AbstractControl { return unimplemented(); }

  get value(): any { return isPresent(this.control) ? this.control.value : null; }

  get valid(): boolean { return isPresent(this.control) ? this.control.valid : null; }

  get errors(): {[key: string]: any} {
    return isPresent(this.control) ? this.control.errors : null;
  }

  get pristine(): boolean { return isPresent(this.control) ? this.control.pristine : null; }

  get dirty(): boolean { return isPresent(this.control) ? this.control.dirty : null; }

  get touched(): boolean { return isPresent(this.control) ? this.control.touched : null; }

  get untouched(): boolean { return isPresent(this.control) ? this.control.untouched : null; }

  get path(): string[] { return null; }
}
