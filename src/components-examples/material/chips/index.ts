import {DragDropModule} from '@angular/cdk/drag-drop';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {MatLegacyAutocompleteModule} from '@angular/material/legacy-autocomplete';
import {MatLegacyChipsModule} from '@angular/material/legacy-chips';
import {MatLegacyFormFieldModule} from '@angular/material/legacy-form-field';
import {MatIconModule} from '@angular/material/icon';
import {ChipsAutocompleteExample} from './chips-autocomplete/chips-autocomplete-example';
import {ChipsDragDropExample} from './chips-drag-drop/chips-drag-drop-example';
import {ChipsInputExample} from './chips-input/chips-input-example';
import {ChipsOverviewExample} from './chips-overview/chips-overview-example';
import {ChipsStackedExample} from './chips-stacked/chips-stacked-example';
import {ChipsHarnessExample} from './chips-harness/chips-harness-example';
import {ChipsFormControlExample} from './chips-form-control/chips-form-control-example';
import {ChipsAvatarExample} from './chips-avatar/chips-avatar-example';
import {MatLegacyButtonModule} from '@angular/material/legacy-button';

export {
  ChipsAutocompleteExample,
  ChipsDragDropExample,
  ChipsInputExample,
  ChipsOverviewExample,
  ChipsStackedExample,
  ChipsHarnessExample,
  ChipsFormControlExample,
  ChipsAvatarExample,
};

const EXAMPLES = [
  ChipsAutocompleteExample,
  ChipsDragDropExample,
  ChipsInputExample,
  ChipsOverviewExample,
  ChipsStackedExample,
  ChipsHarnessExample,
  ChipsFormControlExample,
  ChipsAvatarExample,
];

@NgModule({
  imports: [
    CommonModule,
    DragDropModule,
    MatLegacyAutocompleteModule,
    MatLegacyButtonModule,
    MatLegacyChipsModule,
    MatIconModule,
    MatLegacyFormFieldModule,
    ReactiveFormsModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class ChipsExamplesModule {}
