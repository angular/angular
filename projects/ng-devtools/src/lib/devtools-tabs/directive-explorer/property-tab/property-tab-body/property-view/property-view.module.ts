import { NgModule } from '@angular/core';
import { PropertyViewBodyComponent } from './property-view-body/property-view-body.component';
import { CommonModule } from '@angular/common';
import { MatTreeModule } from '@angular/material/tree';
import { PropertyEditorModule } from './property-view-body/property-editor/property-editor.module';
import { PropertyViewHeaderComponent } from './property-view-header/property-view-header.component';
import { PropertyViewComponent } from './property-view.component';

@NgModule({
  declarations: [PropertyViewBodyComponent, PropertyViewHeaderComponent, PropertyViewComponent],
  imports: [MatTreeModule, CommonModule, PropertyEditorModule],
  exports: [PropertyViewBodyComponent, PropertyViewHeaderComponent, PropertyViewComponent],
})
export class PropertyViewModule {}
