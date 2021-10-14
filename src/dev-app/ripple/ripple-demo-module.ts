/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgModule} from '@angular/core';
import {CoreExamplesModule} from '@angular/components-examples/material/core';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {RouterModule} from '@angular/router';
import {RippleDemo} from './ripple-demo';

@NgModule({
  imports: [
    CoreExamplesModule,
    FormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatInputModule,
    RouterModule.forChild([{path: '', component: RippleDemo}]),
  ],
  declarations: [RippleDemo],
})
export class RippleDemoModule {}
