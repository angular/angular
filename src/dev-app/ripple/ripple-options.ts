/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '@angular/core';
import {RippleGlobalOptions} from '@angular/material';

/**
 * Global ripple options for the dev-app. The ripple options are used as a class
 * so that the global options can be changed at runtime.
 */
@Injectable({providedIn: 'root'})
export class DevAppRippleOptions implements RippleGlobalOptions {

  /** Whether ripples should be disabled */
  disabled: boolean = false;
}
