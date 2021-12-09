import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';

import {FilterComponent} from './filter.component';

@NgModule({
  declarations: [FilterComponent],
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  exports: [FilterComponent],
})
export class FilterModule {
}
