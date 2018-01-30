/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Input, TemplateRef} from '@angular/core';

/**
 * Template to be used to override the icons inside the step header.
 */
@Directive({
  selector: 'ng-template[matStepperIcon]',
})
export class MatStepperIcon {
  /** Name of the icon to be overridden. */
  @Input('matStepperIcon') name: 'edit' | 'done';

  constructor(public templateRef: TemplateRef<any>) { }
}
