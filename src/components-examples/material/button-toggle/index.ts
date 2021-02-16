import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatIconModule} from '@angular/material/icon';
import {
  ButtonToggleAppearanceExample
} from './button-toggle-appearance/button-toggle-appearance-example';
import {
  ButtonToggleExclusiveExample
} from './button-toggle-exclusive/button-toggle-exclusive-example';
import {ButtonToggleOverviewExample} from './button-toggle-overview/button-toggle-overview-example';
import {ButtonToggleHarnessExample} from './button-toggle-harness/button-toggle-harness-example';
import {ButtonToggleFormsExample} from './button-toggle-forms/button-toggle-forms-example';

export {
  ButtonToggleAppearanceExample,
  ButtonToggleExclusiveExample,
  ButtonToggleOverviewExample,
  ButtonToggleHarnessExample,
  ButtonToggleFormsExample,
};

const EXAMPLES = [
  ButtonToggleAppearanceExample,
  ButtonToggleExclusiveExample,
  ButtonToggleOverviewExample,
  ButtonToggleHarnessExample,
  ButtonToggleFormsExample,
];

@NgModule({
  imports: [
    FormsModule,
    MatButtonToggleModule,
    MatIconModule,
    ReactiveFormsModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class ButtonToggleExamplesModule {
}
