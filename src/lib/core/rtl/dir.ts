import {
    NgModule,
    ModuleWithProviders,
    Directive,
    HostBinding,
    Output,
    Input,
    EventEmitter
} from '@angular/core';

export type LayoutDirection = 'ltr' | 'rtl';

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
  @Input('dir') _dir: LayoutDirection = 'ltr';

  @Output() dirChange = new EventEmitter<void>();

  @HostBinding('attr.dir')
  get dir(): LayoutDirection {
    return this._dir;
  }
  set dir(v: LayoutDirection) {
    let old = this._dir;
    this._dir = v;
    if (old != this._dir) {
      this.dirChange.emit();
    }
  }

  get value(): LayoutDirection { return this.dir; }
  set value(v: LayoutDirection) { this.dir = v; }
}


@NgModule({
  exports: [Dir],
  declarations: [Dir]
})
export class RtlModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: RtlModule,
      providers: []
    };
  }
}
