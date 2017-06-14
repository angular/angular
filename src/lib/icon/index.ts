/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {MdCommonModule} from '../core';
import {MdIcon} from './icon';
import {ICON_REGISTRY_PROVIDER} from './icon-registry';


@NgModule({
  imports: [MdCommonModule],
  exports: [MdIcon, MdCommonModule],
  declarations: [MdIcon],
  providers: [ICON_REGISTRY_PROVIDER],
})
export class MdIconModule {}


export * from './icon';
export * from './icon-registry';
