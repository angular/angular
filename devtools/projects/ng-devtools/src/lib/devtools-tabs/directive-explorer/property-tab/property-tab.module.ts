/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatLegacyTooltipModule as MatTooltipModule} from '@angular/material/legacy-tooltip';

import {ComponentMetadataComponent} from './component-metadata.component';
import {PropertyTabHeaderComponent} from './property-tab-header.component';
import {PropertyTabComponent} from './property-tab.component';
import {PropertyViewModule} from './property-view/property-view.module';

@NgModule({
  declarations: [PropertyTabComponent, PropertyTabHeaderComponent, ComponentMetadataComponent],
  imports: [
    PropertyViewModule, CommonModule, MatButtonModule, MatExpansionModule, MatIconModule,
    MatTooltipModule
  ],
  exports: [PropertyTabComponent],
})
export class PropertyTabModule {
}
