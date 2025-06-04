/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationEnvironment, Environment} from '../projects/ng-devtools';

import {environment} from './environments/environment';

export class DemoApplicationEnvironment extends ApplicationEnvironment {
  override frameSelectorEnabled = false;

  override get environment(): Environment {
    return environment;
  }
}
