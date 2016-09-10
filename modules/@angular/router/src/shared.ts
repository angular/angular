/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @whatItDoes Name of the primary outlet.
 *
 * @stable
 */
export const PRIMARY_OUTLET = 'primary';

/**
 * A collection of parameters.
 *
 * @stable
 */
export type Params = {
  [key: string]: any
};

export class NavigationCancelingError extends Error {
  public stack: any;
  constructor(public message: string) {
    super(message);
    this.stack = (<any>new Error(message)).stack;
  }
  toString(): string { return this.message; }
}
