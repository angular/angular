import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IconsModule } from 'app/shared/icons/icons.module';
import { SearchResultsComponent } from './search-results/search-results.component';
import { SelectComponent } from './select/select.component';

@NgModule({
  imports: [
    CommonModule,
    IconsModule,
  ],
  exports: [
    IconsModule,
    SearchResultsComponent,
    SelectComponent,
  ],
  declarations: [
    SearchResultsComponent,
    SelectComponent
  ]
})
export class SharedModule {}
