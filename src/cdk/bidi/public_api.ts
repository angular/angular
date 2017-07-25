/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {DOCUMENT} from '@angular/platform-browser';
import {Dir} from './dir';
import {DIR_DOCUMENT, Directionality} from './directionality';

export {
  Directionality,
  DIRECTIONALITY_PROVIDER_FACTORY,
  DIRECTIONALITY_PROVIDER,
  DIR_DOCUMENT,
  Direction,
} from './directionality';
export {Dir} from './dir';

@NgModule({
  exports: [Dir],
  declarations: [Dir],
  providers: [
    {provide: DIR_DOCUMENT, useExisting: DOCUMENT},
    Directionality,
  ]
})
export class BidiModule { }
