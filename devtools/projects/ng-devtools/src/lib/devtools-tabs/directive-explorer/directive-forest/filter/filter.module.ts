import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterComponent } from './filter.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [FilterComponent],
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  exports: [FilterComponent],
})
export class FilterModule {}
