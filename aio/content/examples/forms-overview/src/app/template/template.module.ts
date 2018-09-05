import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateNameComponent } from './name/name.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [TemplateNameComponent],
  exports: [TemplateNameComponent]
})
export class TemplateModule { }
