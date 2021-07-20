import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';

import {PropertyTabBodyComponent} from './property-tab-body/property-tab-body.component';
import {PropertyViewModule} from './property-tab-body/property-view/property-view.module';
import {ComponentMetadataComponent} from './property-tab-header/component-metadata/component-metadata.component';
import {PropertyTabHeaderComponent} from './property-tab-header/property-tab-header.component';
import {PropertyTabComponent} from './property-tab.component';

@NgModule({
  declarations: [
    PropertyTabComponent,
    PropertyTabHeaderComponent,
    PropertyTabBodyComponent,
    ComponentMetadataComponent,
  ],
  imports: [
    PropertyViewModule, CommonModule, MatButtonModule, MatExpansionModule, MatIconModule,
    MatTooltipModule
  ],
  exports: [PropertyTabComponent],
})
export class PropertyTabModule {
}
