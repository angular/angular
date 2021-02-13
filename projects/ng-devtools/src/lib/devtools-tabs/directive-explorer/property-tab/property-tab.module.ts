import { NgModule } from '@angular/core';
import { PropertyViewModule } from './property-tab-body/property-view/property-view.module';
import { PropertyTabComponent } from './property-tab.component';
import { PropertyTabHeaderComponent } from './property-tab-header/property-tab-header.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { PropertyTabBodyComponent } from './property-tab-body/property-tab-body.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { ComponentMetadataComponent } from './property-tab-header/component-metadata/component-metadata.component';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [
    PropertyTabComponent,
    PropertyTabHeaderComponent,
    PropertyTabBodyComponent,
    ComponentMetadataComponent,
  ],
  imports: [PropertyViewModule, CommonModule, MatButtonModule, MatExpansionModule, MatIconModule],
  exports: [PropertyTabComponent],
})
export class PropertyTabModule {}
