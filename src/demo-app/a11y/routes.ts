import {Routes} from '@angular/router';
import {ButtonAccessibilityDemo} from './button/button-a11y';
import {CheckboxAccessibilityDemo} from './checkbox/checkbox-a11y';
import {RadioAccessibilityDemo} from './radio/radio-a11y';
import {AccessibilityHome} from './a11y';

export const ACCESSIBILITY_DEMO_ROUTES: Routes = [
  {path: '', component: AccessibilityHome},
  {path: 'button', component: ButtonAccessibilityDemo},
  {path: 'checkbox', component: CheckboxAccessibilityDemo},
  {path: 'radio', component: RadioAccessibilityDemo},
];
