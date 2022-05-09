import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchResultsComponent } from './search-results/search-results.component';
import { SelectComponent } from './select/select.component';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
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
