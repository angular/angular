/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {Pipe} from '@angular/core';
let SamplePipe = class SamplePipe {
  transform(val) {
    return val;
  }
  ngOnDestroy() {
    // tslint:disable-next-line:no-console
    console.log('Destroying');
  }
};
SamplePipe = __decorate(
  [
    Pipe({
      name: 'sample',
      pure: false,
    }),
  ],
  SamplePipe,
);
export {SamplePipe};
//# sourceMappingURL=sample.pipe.js.map
