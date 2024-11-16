/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// tslint:disable

import {Component, Input} from '@angular/core';

const complex = 'some global variable';

@Component({template: ''})
class MyComp {
  @Input() name: string | null = null;
  @Input() complex: string | null = null;

  valid() {
    if (this.name) {
      this.name.charAt(0);
    }
  }

  // Input read cannot be stored in a variable: `name`.
  simpleLocalCollision() {
    const name = 'some other name';
    if (this.name) {
      this.name.charAt(0);
    }
  }

  // `this.complex` should conflict with the file-level `complex` variable,
  // and result in a suffix variable.
  complexParentCollision() {
    if (this.complex) {
      this.complex.charAt(0);
    }
  }

  nestedShadowing() {
    if (this.name) {
      this.name.charAt(0);
    }

    function nested() {
      const name = '';
    }
  }
}
