import {DragDropModule} from '@angular/cdk/drag-drop';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatChipsModule} from '@angular/material/chips';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {ChipsAutocompleteExample} from './chips-autocomplete/chips-autocomplete-example';
import {ChipsDragDropExample} from './chips-drag-drop/chips-drag-drop-example';
import {ChipsInputExample} from './chips-input/chips-input-example';
import {ChipsOverviewExample} from './chips-overview/chips-overview-example';
import {ChipsStackedExample} from './chips-stacked/chips-stacked-example';
import {ChipsHarnessExample} from './chips-harness/chips-harness-example';

export {
  ChipsAutocompleteExample,
  ChipsDragDropExample,
  ChipsInputExample,
  ChipsOverviewExample,
  ChipsStackedExample,
  ChipsHarnessExample,
};

const EXAMPLES = [
  ChipsAutocompleteExample,
  ChipsDragDropExample,
  ChipsInputExample,
  ChipsOverviewExample,
  ChipsStackedExample,
  ChipsHarnessExample,
];

@NgModule({
  imports: [
    CommonModule,
    DragDropModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatIconModule,
    MatFormFieldModule,
    ReactiveFormsModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class ChipsExamplesModule {
}
