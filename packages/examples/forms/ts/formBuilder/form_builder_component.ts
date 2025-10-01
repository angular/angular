/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {DisabledFormControlComponent, FormBuilderComp} from './form_builder_example';

@Component({
  selector: 'example-app',
  imports: [FormBuilderComp, DisabledFormControlComponent],
  template: `
  <app-form-builder />
  <hr />
  <app-disabled-form-control />
  `,
})
export class AppComponent {}
