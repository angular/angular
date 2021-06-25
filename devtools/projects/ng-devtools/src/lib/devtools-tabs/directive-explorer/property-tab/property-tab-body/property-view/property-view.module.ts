import {DragDropModule} from '@angular/cdk/drag-drop';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatTreeModule} from '@angular/material/tree';

import {PropertyViewBodyComponent} from './property-view-body/property-view-body.component';
import {PropertyEditorComponent} from './property-view-body/property-view-tree/property-editor/property-editor.component';
import {PropertyPreviewComponent} from './property-view-body/property-view-tree/property-preview/property-preview.component';
import {PropertyViewTreeComponent} from './property-view-body/property-view-tree/property-view-tree.component';
import {PropertyViewHeaderComponent} from './property-view-header/property-view-header.component';
import {PropertyViewComponent} from './property-view.component';

@NgModule({
  declarations: [
    PropertyViewBodyComponent,
    PropertyViewHeaderComponent,
    PropertyViewComponent,
    PropertyViewTreeComponent,
    PropertyEditorComponent,
    PropertyPreviewComponent,
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
  exports: [PropertyViewBodyComponent, PropertyViewHeaderComponent, PropertyViewComponent],
})
export class PropertyViewModule {
}
