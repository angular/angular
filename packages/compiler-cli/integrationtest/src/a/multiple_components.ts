/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';

@Component({selector: 'my-comp', template: '<div></div>'})
export class MultipleComponentsMyComp {
}

@Component({
  selector: 'next-comp',
  templateUrl: './multiple_components.html',
})
export class NextComp {
}

// Verify that exceptions from DirectiveResolver don't propagate
export function NotADirective(c: any): void {}
@NotADirective
export class HasCustomDecorator {
}

// Verify that custom decorators have metadata collected, eg Ionic
export function Page(c: any): (f: Function) => void {
  return NotADirective;
}

@Page({template: 'Ionic template'})
export class AnIonicPage {
}
