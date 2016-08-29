/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgProbeToken} from '@angular/platform-browser';
import {Router} from './src/router';

export const ROUTER_NG_PROBE_PROVIDER = {
  provide: NgProbeToken,
  multi: true,
  useValue: new NgProbeToken('router', Router)
};