import { NgModule } from '@angular/core';
import { PropertyViewComponent } from './property-view.component';
import { CommonModule } from '@angular/common';
import { MatTreeModule } from '@angular/material/tree';
import { PropertyEditorModule } from './property-editor/property-editor.module';

@NgModule({
  declarations: [PropertyViewComponent],
  imports: [MatTreeModule, CommonModule, PropertyEditorModule],
  exports: [PropertyViewComponent],
})
export class PropertyViewModule {}
