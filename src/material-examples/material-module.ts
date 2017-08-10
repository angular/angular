import {NgModule} from '@angular/core';

import {CdkTableModule} from '@angular/cdk/table';
import {
  MdAutocompleteModule, MdButtonModule, MdButtonToggleModule, MdPaginatorModule,
  MdCardModule, MdCheckboxModule, MdChipsModule, MdDatepickerModule,
  MdDialogModule, MdGridListModule, MdIconModule, MdInputModule,
  MdListModule, MdMenuModule, MdProgressBarModule, MdProgressSpinnerModule,
  MdRadioModule, MdSelectModule, MdSidenavModule, MdSliderModule, MdSortModule,
  MdSlideToggleModule, MdSnackBarModule, MdTableModule, MdTabsModule, MdToolbarModule,
  MdTooltipModule, MdFormFieldModule
} from '@angular/material';

@NgModule({
  exports: [
    CdkTableModule,
    MdAutocompleteModule,
    MdButtonModule,
    MdButtonToggleModule,
    MdCardModule,
    MdCheckboxModule,
    MdChipsModule,
    MdDatepickerModule,
    MdDialogModule,
    MdFormFieldModule,
    MdGridListModule,
    MdIconModule,
    MdInputModule,
    MdListModule,
    MdMenuModule,
    MdProgressBarModule,
    MdProgressSpinnerModule,
    MdRadioModule,
    MdSelectModule,
    MdSlideToggleModule,
    MdSliderModule,
    MdSidenavModule,
    MdSnackBarModule,
    MdTabsModule,
    MdToolbarModule,
    MdTooltipModule,
    MdPaginatorModule,
    MdSortModule,
    MdTableModule
  ]
})
export class ExampleMaterialModule {}
