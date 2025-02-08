/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {OnDestroy, Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'sample',
  pure: false,
})
export class SamplePipe implements PipeTransform, OnDestroy {
  transform(val: unknown) {
    return val;
  }

  ngOnDestroy(): void {
    // tslint:disable-next-line:no-console
    console.log('Destroying');
  }
}
