import {Routes} from '@angular/router';
import {AutocompleteAccessibilityDemo} from './autocomplete/autocomplete-a11y';
import {ButtonAccessibilityDemo} from './button/button-a11y';
import {ButtonToggleAccessibilityDemo} from './button-toggle/button-toggle-a11y';
import {CheckboxAccessibilityDemo} from './checkbox/checkbox-a11y';
import {ChipsAccessibilityDemo} from './chips/chips-a11y';
import {GridListAccessibilityDemo} from './grid-list/grid-list-a11y';
import {RadioAccessibilityDemo} from './radio/radio-a11y';
import {AccessibilityHome} from './a11y';
import {DatepickerAccessibilityDemo} from './datepicker/datepicker-a11y';
import {IconAccessibilityDemo} from './icon/icon-a11y';
import {InputAccessibilityDemo} from './input/input-a11y';
import {ProgressSpinnerAccessibilityDemo} from './progress-spinner/progress-spinner-a11y';
import {SliderAccessibilityDemo} from './slider/slider-a11y';

export const ACCESSIBILITY_DEMO_ROUTES: Routes = [
  {path: '', component: AccessibilityHome},
  {path: 'autocomplete', component: AutocompleteAccessibilityDemo},
  {path: 'button', component: ButtonAccessibilityDemo},
  {path: 'button-toggle', component: ButtonToggleAccessibilityDemo},
  {path: 'checkbox', component: CheckboxAccessibilityDemo},
  {path: 'chips', component: ChipsAccessibilityDemo},
  {path: 'datepicker', component: DatepickerAccessibilityDemo},
  {path: 'grid-list', component: GridListAccessibilityDemo},
  {path: 'icon', component: IconAccessibilityDemo},
  {path: 'input', component: InputAccessibilityDemo},
  {path: 'progress-spinner', component: ProgressSpinnerAccessibilityDemo},
  {path: 'radio', component: RadioAccessibilityDemo},
  {path: 'slider', component: SliderAccessibilityDemo},
];
