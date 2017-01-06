/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

class RollupNG2 {
  resolveId(id, from) {
    if (id.startsWith('@angular/')) {
      return `${__dirname}/../../packages-dist/${id.split('/')[1]}/esm/index.js`;
    }

    // if(id.startsWith('rxjs/')){
    //   return `${__dirname}/../../../node_modules/rxjs-es/${id.replace('rxjs/', '')}.js`;
    // }
  }
}

export default {
  entry: 'test.js',
  format: 'es6',
  plugins: [
    new RollupNG2(),
  ]
};
