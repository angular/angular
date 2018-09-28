import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FavoriteColorComponent } from './favorite-color/favorite-color.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [FavoriteColorComponent],
  exports: [FavoriteColorComponent]
})
export class TemplateModule { }
