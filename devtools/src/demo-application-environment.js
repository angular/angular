/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ApplicationEnvironment} from '../projects/ng-devtools';
import {environment} from './environments/environment';
export class DemoApplicationEnvironment extends ApplicationEnvironment {
  constructor() {
    super(...arguments);
    this.frameSelectorEnabled = false;
  }
  get environment() {
    return environment;
  }
}
//# sourceMappingURL=demo-application-environment.js.map
