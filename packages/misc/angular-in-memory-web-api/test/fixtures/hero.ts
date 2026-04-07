/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

export class Hero {
  constructor(
    public id = 0,
    public name = '',
  ) {}
  clone() {
    return new Hero(this.id, this.name);
  }
}
