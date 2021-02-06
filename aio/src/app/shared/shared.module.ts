import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchResultsComponent } from './search-results/search-results.component';
import { SelectComponent } from './select/select.component';
import { ThemePickerComponent } from './theme-picker/theme-picker.component';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    SearchResultsComponent,
    SelectComponent,
    ThemePickerComponent
  ],
  declarations: [
    SearchResultsComponent,
    SelectComponent,
    ThemePickerComponent
  ]
})
export class SharedModule {}
