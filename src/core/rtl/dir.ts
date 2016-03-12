import {EventEmitter} from 'angular2/src/facade/async';
import {Directive, HostBinding, Output, Input} from 'angular2/core';
import {OneOf} from '../annotations/one-of';


/**
 * Directive to listen to changes of direction of part of the DOM.
 *
 * Applications should use this directive instead of the native attribute so that Material
 * components can listen on changes of direction.
 */
@Directive({
  selector: '[dir]',
  // TODO(hansl): maybe `$implicit` isn't the best option here, but for now that's the best we got.
  exportAs: '$implicit'
})
export class Dir {
  @Input('dir') @OneOf(['ltr', 'rtl']) private _dir: string = 'ltr';

  @Output() dirChange = new EventEmitter<void>();

  @HostBinding('attr.dir')
  get dir(): string {
    return this._dir;
  }
  set dir(v: string) {
    let old = this._dir;
    this._dir = v;
    if (old != this._dir) {
      this.dirChange.emit(null);
    }
  }

  get value(): string { return this.dir; }
  set value(v: string) { this.dir = v; }
}
