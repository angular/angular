/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {RouterOutlet, Routes} from '@angular/router';
import * as formBuilderExample from './ts/formBuilder/form_builder_component';
import {NestedFormArray} from './ts/nestedFormArray/nested_form_array_example';
import {NestedFormGroupComp} from './ts/nestedFormGroup/nested_form_group_example';
import {NgModelGroupComp} from './ts/ngModelGroup/ng_model_group_example';
import {RadioButtonComp} from './ts/radioButtons/radio_button_example';
import {ReactiveRadioButtonComp} from './ts/reactiveRadioButtons/reactive_radio_button_example';
import {ReactiveSelectComp} from './ts/reactiveSelectControl/reactive_select_control_example';
import {SelectControlComp} from './ts/selectControl/select_control_example';
import {SimpleFormComp} from './ts/simpleForm/simple_form_example';
import {SimpleFormControl} from './ts/simpleFormControl/simple_form_control_example';
import {SimpleFormGroup} from './ts/simpleFormGroup/simple_form_group_example';
import {SimpleNgModelComp} from './ts/simpleNgModel/simple_ng_model_example';

@Component({
  selector: 'example-app',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class TestsAppComponent {}

export const routes: Routes = [
  {path: 'formBuilder', component: formBuilderExample.AppComponent},
  {path: 'nestedFormArray', component: NestedFormArray},
  {path: 'nestedFormGroup', component: NestedFormGroupComp},
  {path: 'ngModelGroup', component: NgModelGroupComp},
  {path: 'radioButtons', component: RadioButtonComp},
  {path: 'reactiveRadioButtons', component: ReactiveRadioButtonComp},
  {path: 'reactiveSelectControl', component: SelectControlComp},
  {path: 'selectControl', component: ReactiveSelectComp},
  {path: 'simpleForm', component: SimpleFormComp},
  {path: 'simpleFormControl', component: SimpleFormControl},
  {path: 'simpleFormGroup', component: SimpleFormGroup},
  {path: 'simpleNgModel', component: SimpleNgModelComp},
];
