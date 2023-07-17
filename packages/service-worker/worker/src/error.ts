/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export class SwCriticalError extends Error {
  readonly isCritical: boolean = true;
}

export function errorToString(error: any): string {
  if (error instanceof Error) {
    return `${error.message}\n${error.stack}`;
  } else {
    return `${error}`;
  }
}

export class SwUnrecoverableStateError extends SwCriticalError {
  readonly isUnrecoverableState: boolean = true;
}
