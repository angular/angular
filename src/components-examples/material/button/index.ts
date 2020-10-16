import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatDividerModule} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import {ButtonOverviewExample} from './button-overview/button-overview-example';
import {ButtonTypesExample} from './button-types/button-types-example';
import {ButtonHarnessExample} from './button-harness/button-harness-example';

export {
  ButtonOverviewExample,
  ButtonTypesExample,
  ButtonHarnessExample,
};

const EXAMPLES = [
  ButtonOverviewExample,
  ButtonTypesExample,
  ButtonHarnessExample,
];

@NgModule({
  imports: [
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
  entryComponents: EXAMPLES,
})
export class ButtonExamplesModule {
}
