/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';

import {ComponentMetadataComponent} from './component-metadata.component.js';
import {PropertyTabHeaderComponent} from './property-tab-header.component.js';
import {PropertyTabComponent} from './property-tab.component.js';
import {PropertyViewModule} from './property-view/property-view.module.js';

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
