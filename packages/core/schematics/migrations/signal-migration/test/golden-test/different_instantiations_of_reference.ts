// tslint:disable

import {Input, Directive, Component} from '@angular/core';

// Material form field test case

let nextUniqueId = 0;

@Directive()
export class MatHint {
  align: string = '';
  @Input() id = `mat-hint-${nextUniqueId++}`;
}

@Component({
  template: ``,
})
export class MatFormFieldTest {
  private declare _hintChildren: MatHint[];
  private _control = true;
  private _somethingElse = false;

  private _syncDescribedByIds() {
    if (this._control) {
      let ids: string[] = [];

      const startHint = this._hintChildren
        ? this._hintChildren.find((hint) => hint.align === 'start')
        : null;
      const endHint = this._hintChildren
        ? this._hintChildren.find((hint) => hint.align === 'end')
        : null;

      if (startHint) {
        ids.push(startHint.id);
      } else if (this._somethingElse) {
        ids.push(`val:${this._somethingElse}`);
      }

      if (endHint) {
        // Same input reference `MatHint#id`, but different instantiation!
        // Should not be shared!.
        ids.push(endHint.id);
      }
    }
  }
}
