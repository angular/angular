import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PropertyViewBodyComponent } from './property-view-body.component';
import { PropertyViewHeaderComponent } from './property-view-header.component';
import { PropertyViewTreeComponent } from './property-view-tree.component';
import { PropertyViewComponent } from './property-view.component';
import { PropertyTabBodyComponent } from './property-tab-body.component';
import { PropertyPreviewComponent } from './property-preview.component';
import { PropertyEditorComponent } from './property-editor.component';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTreeModule } from '@angular/material/tree';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [
    PropertyViewComponent,
    PropertyViewTreeComponent,
    PropertyViewHeaderComponent,
    PropertyViewBodyComponent,
    PropertyTabBodyComponent,
    PropertyPreviewComponent,
    PropertyEditorComponent,
  ],
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatTreeModule,
    MatTooltipModule,
    CommonModule,
    MatExpansionModule,
    DragDropModule,
    FormsModule,
  ],
  exports: [
    PropertyViewComponent,
    PropertyViewTreeComponent,
    PropertyViewHeaderComponent,
    PropertyViewBodyComponent,
    PropertyTabBodyComponent,
    PropertyPreviewComponent,
    PropertyEditorComponent,
  ],
})
export class PropertyViewModule {}
