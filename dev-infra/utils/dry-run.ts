/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Argv} from 'yargs';

/**
 * Add a --dry-run flag to the available options for the yargs argv object. When present, sets an
 * environment variable noting dry run mode.
 */
export function addDryRunFlag<T>(args: Argv<T>) {
  return args.option('dry-run' as 'dryRun', {
    type: 'boolean',
    default: false,
    description: 'Whether to do a dry run',
    coerce: (dryRun: boolean) => {
      if (dryRun) {
        process.env['DRY_RUN'] = '1';
      }
      return dryRun;
    }
  });
}

/** Whether the current environment is in dry run mode. */
export function isDryRun(): boolean {
  return process.env['DRY_RUN'] !== undefined;
}

/** Error to be thrown when a function or method is called in dryRun mode and shouldn't be. */
export class DryRunError extends Error {
  constructor() {
    super('Cannot call this function in dryRun mode.');
    // Set the prototype explicitly because in ES5, the prototype is accidentally lost due to
    // a limitation in down-leveling.
    // https://github.com/Microsoft/TypeScript/wiki/FAQ#why-doesnt-extending-built-ins-like-error-array-and-map-work.
    Object.setPrototypeOf(this, DryRunError.prototype);
  }
}
