/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ScrollingModule} from '@angular/cdk/scrolling';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatLegacyCardModule as MatCardModule} from '@angular/material/legacy-card';
import {MatLegacySnackBarModule as MatSnackBarModule} from '@angular/material/legacy-snack-bar';
import {MatLegacyTooltipModule as MatTooltipModule} from '@angular/material/legacy-tooltip';
import {MatTreeModule} from '@angular/material/tree';

import {AngularSplitModule} from '../../vendor/angular-split/public_api';

import {DirectiveExplorerComponent} from './directive-explorer.component';
import {DirectiveForestModule} from './directive-forest/directive-forest.module';
import {PropertyTabModule} from './property-tab/property-tab.module';

@NgModule({
  declarations: [DirectiveExplorerComponent],
  exports: [DirectiveExplorerComponent],
  imports: [
    MatTreeModule,
    MatCardModule,
    ScrollingModule,
    MatIconModule,
    CommonModule,
    PropertyTabModule,
    MatButtonModule,
    MatSnackBarModule,
    AngularSplitModule,
    DirectiveForestModule,
    MatTooltipModule,
  ],
})
export class DirectiveExplorerModule {
}
