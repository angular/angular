import {NgModule} from '@angular/core';
import {MatLegacyButtonModule} from '@angular/material/legacy-button';
import {MatDividerModule} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import {ButtonOverviewExample} from './button-overview/button-overview-example';
import {ButtonTypesExample} from './button-types/button-types-example';
import {ButtonHarnessExample} from './button-harness/button-harness-example';

export {ButtonOverviewExample, ButtonTypesExample, ButtonHarnessExample};

const EXAMPLES = [ButtonOverviewExample, ButtonTypesExample, ButtonHarnessExample];

@NgModule({
  imports: [MatLegacyButtonModule, MatDividerModule, MatIconModule],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class ButtonExamplesModule {}
