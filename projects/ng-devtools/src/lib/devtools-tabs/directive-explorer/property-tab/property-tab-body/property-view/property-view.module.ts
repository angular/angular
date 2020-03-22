import { NgModule } from '@angular/core';
import { PropertyViewBodyComponent } from './property-view-body/property-view-body.component';
import { CommonModule } from '@angular/common';
import { MatTreeModule } from '@angular/material/tree';
import { PropertyEditorModule } from './property-view-body/property-editor/property-editor.module';
import { PropertyViewHeaderComponent } from './property-view-header/property-view-header.component';
import { PropertyViewComponent } from './property-view.component';
import { MatButtonModule } from '@angular/material/button';
import { PropertyViewTreeComponent } from './property-view-body/property-view-tree/property-view-tree.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [
    PropertyViewBodyComponent,
    PropertyViewHeaderComponent,
    PropertyViewComponent,
    PropertyViewTreeComponent,
  ],
  imports: [MatTreeModule, CommonModule, PropertyEditorModule, MatButtonModule, MatExpansionModule, DragDropModule],
  exports: [PropertyViewBodyComponent, PropertyViewHeaderComponent, PropertyViewComponent],
})
export class PropertyViewModule {}
