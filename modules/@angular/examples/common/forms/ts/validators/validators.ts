/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MaxLengthValidator, MinLengthValidator} from '@angular/common';
import {Component} from '@angular/core';


// #docregion min
@Component({
  selector: 'min-cmp',
  directives: [MinLengthValidator],
  template: `
<form>
  <p>Year: <input ngControl="year" minlength="2"></p>
</form>
`
})
class MinLengthTestComponent {
}
// #enddocregion

// #docregion max
@Component({
  selector: 'max-cmp',
  directives: [MaxLengthValidator],
  template: `
<form>
  <p>Year: <input ngControl="year" maxlength="4"></p>
</form>
`
})
class MaxLengthTestComponent {
}
// #enddocregion
