import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchResultsComponent } from './search-results/search-results.component';
import { SelectComponent } from './select/select.component';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
  ],
  exports: [
    SearchResultsComponent,
    SelectComponent,
    MatIconModule,
  ],
  declarations: [
    SearchResultsComponent,
    SelectComponent
  ]
})
export class SharedModule {}
