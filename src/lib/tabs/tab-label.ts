/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive} from '@angular/core';
import {CdkPortal} from '@angular/cdk/portal';

// TODO(devversion): Workaround for https://github.com/angular/material2/issues/12760
export const _CdkPortal = CdkPortal;

/** Used to flag tab labels for use with the portal directive */
@Directive({
  selector: '[mat-tab-label], [matTabLabel]',
})
export class MatTabLabel extends _CdkPortal {}
