/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ApplicationEnvironment, Environment} from 'ng-devtools';

import {environment} from './environments/environment';

export class DemoApplicationEnvironment extends ApplicationEnvironment {
  get environment(): Environment {
    return environment;
  }
}
