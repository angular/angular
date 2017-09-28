/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, TemplateRef} from '@angular/core';
import {CdkStepLabel} from '@angular/cdk/stepper';

/** Workaround for https://github.com/angular/angular/issues/17849 */
export const _MatStepLabel = CdkStepLabel;

@Directive({
  selector: '[matStepLabel]',
})
export class MatStepLabel extends _MatStepLabel {
  constructor(template: TemplateRef<any>) {
    super(template);
  }
}
