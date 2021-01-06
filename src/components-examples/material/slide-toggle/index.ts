import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatRadioModule} from '@angular/material/radio';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {
  SlideToggleConfigurableExample
} from './slide-toggle-configurable/slide-toggle-configurable-example';
import {SlideToggleFormsExample} from './slide-toggle-forms/slide-toggle-forms-example';
import {SlideToggleOverviewExample} from './slide-toggle-overview/slide-toggle-overview-example';
import {SlideToggleHarnessExample} from './slide-toggle-harness/slide-toggle-harness-example';

export {
  SlideToggleConfigurableExample,
  SlideToggleFormsExample,
  SlideToggleHarnessExample,
  SlideToggleOverviewExample,
};

const EXAMPLES = [
  SlideToggleConfigurableExample,
  SlideToggleFormsExample,
  SlideToggleHarnessExample,
  SlideToggleOverviewExample,
];

@NgModule({
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatRadioModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class SlideToggleExamplesModule {
}
