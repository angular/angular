/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {ApplicationEnvironment} from '../../../ng-devtools';
import {environment} from '../environments/environment';
export class ChromeApplicationEnvironment extends ApplicationEnvironment {
  constructor() {
    super(...arguments);
    this.frameSelectorEnabled = true;
  }
  get environment() {
    return environment;
  }
}
//# sourceMappingURL=chrome-application-environment.js.map
