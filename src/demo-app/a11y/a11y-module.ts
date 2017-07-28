import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {ACCESSIBILITY_DEMO_ROUTES} from './routes';
import {DemoMaterialModule} from '../demo-material-module';
import {AccessibilityHome, AccessibilityDemo} from './a11y';
import {ButtonAccessibilityDemo} from './button/button-a11y';
import {CheckboxAccessibilityDemo} from './checkbox/checkbox-a11y';
import {RadioAccessibilityDemo} from './radio/radio-a11y';

@NgModule({
  imports: [
    RouterModule.forChild(ACCESSIBILITY_DEMO_ROUTES)
  ],
  exports: [
    RouterModule
  ]
})
export class AccessibilityRoutingModule {}

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AccessibilityRoutingModule,
    DemoMaterialModule,
  ],
  declarations: [
    AccessibilityDemo,
    AccessibilityHome,
    ButtonAccessibilityDemo,
    CheckboxAccessibilityDemo,
    RadioAccessibilityDemo,
  ]
})
export class AccessibilityDemoModule {}
