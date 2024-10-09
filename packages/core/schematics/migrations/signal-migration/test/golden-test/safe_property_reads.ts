/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// tslint:disable

import {Component, Input} from '@angular/core';

@Component({
  template: `
    {{bla?.myInput}}
  `,
})
class WithSafePropertyReads {
  @Input() myInput = 0;

  bla: this | undefined = this;
}
