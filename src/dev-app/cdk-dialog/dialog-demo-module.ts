/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DialogModule} from '@angular/cdk-experimental/dialog';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {DialogDemo, JazzDialog} from './dialog-demo';

@NgModule({
  imports: [DialogModule, FormsModule, RouterModule.forChild([{path: '', component: DialogDemo}])],
  declarations: [DialogDemo, JazzDialog],
})
export class DialogDemoModule {}
