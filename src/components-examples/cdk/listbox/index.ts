import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CdkListboxActivedescendantExample} from './cdk-listbox-activedescendant/cdk-listbox-activedescendant-example';
import {CdkListboxCompareWithExample} from './cdk-listbox-compare-with/cdk-listbox-compare-with-example';
import {CdkListboxCustomNavigationExample} from './cdk-listbox-custom-navigation/cdk-listbox-custom-navigation-example';
import {CdkListboxCustomTypeaheadExample} from './cdk-listbox-custom-typeahead/cdk-listbox-custom-typeahead-example';
import {CdkListboxDisabledExample} from './cdk-listbox-disabled/cdk-listbox-disabled-example';
import {CdkListboxFormsValidationExample} from './cdk-listbox-forms-validation/cdk-listbox-forms-validation-example';
import {CdkListboxHorizontalExample} from './cdk-listbox-horizontal/cdk-listbox-horizontal-example';
import {CdkListboxMultipleExample} from './cdk-listbox-multiple/cdk-listbox-multiple-example';
import {CdkListboxOverviewExample} from './cdk-listbox-overview/cdk-listbox-overview-example';
import {CdkListboxReactiveFormsExample} from './cdk-listbox-reactive-forms/cdk-listbox-reactive-forms-example';
import {CdkListboxTemplateFormsExample} from './cdk-listbox-template-forms/cdk-listbox-template-forms-example';
import {CdkListboxValueBindingExample} from './cdk-listbox-value-binding/cdk-listbox-value-binding-example';
import {CdkListboxModule} from '@angular/cdk/listbox';

export {
  CdkListboxActivedescendantExample,
  CdkListboxCompareWithExample,
  CdkListboxCustomNavigationExample,
  CdkListboxCustomTypeaheadExample,
  CdkListboxDisabledExample,
  CdkListboxFormsValidationExample,
  CdkListboxHorizontalExample,
  CdkListboxMultipleExample,
  CdkListboxOverviewExample,
  CdkListboxReactiveFormsExample,
  CdkListboxTemplateFormsExample,
  CdkListboxValueBindingExample,
};

const EXAMPLES = [
  CdkListboxActivedescendantExample,
  CdkListboxCompareWithExample,
  CdkListboxCustomNavigationExample,
  CdkListboxCustomTypeaheadExample,
  CdkListboxDisabledExample,
  CdkListboxFormsValidationExample,
  CdkListboxHorizontalExample,
  CdkListboxMultipleExample,
  CdkListboxOverviewExample,
  CdkListboxReactiveFormsExample,
  CdkListboxTemplateFormsExample,
  CdkListboxValueBindingExample,
];

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, CdkListboxModule],
  declarations: EXAMPLES,
  exports: EXAMPLES,
})
export class CdkListboxExamplesModule {}
