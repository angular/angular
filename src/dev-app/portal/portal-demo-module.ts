/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PortalModule} from '@angular/cdk/portal';
import {NgModule} from '@angular/core';
import {PortalDemo, ScienceJoke} from './portal-demo';

@NgModule({
  imports: [
    PortalModule,
  ],
  declarations: [PortalDemo, ScienceJoke],
  entryComponents: [ScienceJoke],
})
export class PortalDemoModule {
}
