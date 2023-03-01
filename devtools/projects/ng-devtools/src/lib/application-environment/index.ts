/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

interface Env {
  LATEST_SHA: string;
}

export interface Environment {
  production: boolean;
  LATEST_SHA: string;
}

export abstract class ApplicationEnvironment {
  abstract get environment(): Environment;
}
