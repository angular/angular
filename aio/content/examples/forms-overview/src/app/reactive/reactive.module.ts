import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveNameComponent } from './name/name.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  declarations: [ReactiveNameComponent],
  exports: [ReactiveNameComponent],
})
export class ReactiveModule { }
