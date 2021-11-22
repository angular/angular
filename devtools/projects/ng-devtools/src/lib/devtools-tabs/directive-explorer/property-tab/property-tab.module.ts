import { NgModule } from '@angular/core';
import { PropertyTabComponent } from './property-tab.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PropertyViewModule } from './property-view/property-view.module';
import { ComponentMetadataComponent } from './component-metadata.component';
import { PropertyTabHeaderComponent } from './property-tab-header.component';

@NgModule({
  declarations: [PropertyTabComponent, PropertyTabHeaderComponent, ComponentMetadataComponent],
  imports: [PropertyViewModule, CommonModule, MatButtonModule, MatExpansionModule, MatIconModule, MatTooltipModule],
  exports: [PropertyTabComponent],
})
export class PropertyTabModule {}
