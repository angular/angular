import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectComponent } from './select/select.component';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    SelectComponent
  ],
  declarations: [
    SelectComponent
  ]
})
export class SharedModule {}
