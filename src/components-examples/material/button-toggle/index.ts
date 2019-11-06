import {NgModule} from '@angular/core';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatIconModule} from '@angular/material/icon';
import {
  ButtonToggleAppearanceExample
} from './button-toggle-appearance/button-toggle-appearance-example';
import {
  ButtonToggleExclusiveExample
} from './button-toggle-exclusive/button-toggle-exclusive-example';
import {ButtonToggleOverviewExample} from './button-toggle-overview/button-toggle-overview-example';

export {
  ButtonToggleAppearanceExample,
  ButtonToggleExclusiveExample,
  ButtonToggleOverviewExample,
};

const EXAMPLES = [
  ButtonToggleAppearanceExample,
  ButtonToggleExclusiveExample,
  ButtonToggleOverviewExample,
];

@NgModule({
  imports: [
    MatButtonToggleModule,
    MatIconModule,
  ],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class ButtonToggleExamplesModule {
}
