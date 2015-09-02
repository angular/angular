import {AbstractControl} from '../model';

export class AbstractControlDirective {
  get control(): AbstractControl { return null; }

  get value(): any { return this.control.value; }

  get valid(): boolean { return this.control.valid; }

  get errors(): StringMap<string, any> { return this.control.errors; }

  get pristine(): boolean { return this.control.pristine; }

  get dirty(): boolean { return this.control.dirty; }

  get touched(): boolean { return this.control.touched; }

  get untouched(): boolean { return this.control.untouched; }
}