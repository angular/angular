import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyEditorComponent } from './property-editor.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [PropertyEditorComponent],
  imports: [CommonModule, FormsModule],
  exports: [PropertyEditorComponent],
})
export class PropertyEditorModule {}
