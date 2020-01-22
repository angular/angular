import {OverlayModule} from '@angular/cdk/overlay';
import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatFormFieldModule} from '@angular/material-experimental/mdc-form-field';
import {MatInputModule} from '@angular/material-experimental/mdc-input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatCommonModule, MatOptionModule} from '@angular/material/core';
import {MatInputHarness} from '@angular/material/input/testing';
import {
  MAT_SELECT_SCROLL_STRATEGY_PROVIDER,
  MatSelect,
  MatSelectTrigger
} from '@angular/material/select';
import {MatSelectHarness} from '@angular/material/select/testing';
import {runHarnessTests} from '@angular/material/form-field/testing/shared.spec';
import {MatFormFieldHarness} from './form-field-harness';

// TODO: remove this once there is a `MatSelect` module which does not come
// with the form-field module provided. This is a copy of the `MatSelect` module
// that does not provide any form-field module.
@NgModule({
  imports: [CommonModule, OverlayModule, MatOptionModule, MatCommonModule],
  exports: [MatSelect, MatSelectTrigger, MatOptionModule, MatCommonModule],
  declarations: [MatSelect, MatSelectTrigger],
  providers: [MAT_SELECT_SCROLL_STRATEGY_PROVIDER]
})
export class SelectWithoutFormFieldModule {
}

describe('MDC-based MatFormFieldHarness', () => {
  runHarnessTests(
      [MatFormFieldModule, MatAutocompleteModule, MatInputModule, SelectWithoutFormFieldModule], {
        formFieldHarness: MatFormFieldHarness as any,
        inputHarness: MatInputHarness,
        selectHarness: MatSelectHarness,
        isMdcImplementation: true,
      });
});
