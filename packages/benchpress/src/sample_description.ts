/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * SampleDescription merges all available descriptions about a sample
 */
export class SampleDescription {
  description: {[key: string]: any};

  constructor(
    public id: string,
    descriptions: Array<{[key: string]: any}>,
    public metrics: {[key: string]: any},
  ) {
    this.description = {};
    descriptions.forEach((description) => {
      Object.keys(description).forEach((prop) => {
        this.description[prop] = description[prop];
      });
    });
  }

  toJson() {
    return {'id': this.id, 'description': this.description, 'metrics': this.metrics};
  }
}
