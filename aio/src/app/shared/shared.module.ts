import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchResultsComponent } from './search-results/search-results.component';
import { SelectComponent } from './select/select.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ThemePickerComponent } from './theme-picker/theme-picker.component';
import { ThemeStorageService } from './theme-picker/theme-storage/theme-storage.service';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule
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
  ],
  providers: [ThemeStorageService]
})
export class SharedModule {}
