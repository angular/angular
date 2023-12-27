import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FavoriteColorComponent } from './favorite-color/favorite-color.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  declarations: [FavoriteColorComponent],
  exports: [FavoriteColorComponent],
})
export class ReactiveModule { }
