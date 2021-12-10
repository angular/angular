/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Descriptor} from 'protocol';

import {Property} from './element-property-resolver';

export const arrayifyProps =
    (props: {[prop: string]: Descriptor}|Descriptor[], parent: Property|null = null): Property[] =>
        Object.keys(props).map((name) => ({name, descriptor: props[name], parent})).sort((a, b) => {
          const parsedA = parseInt(a.name, 10);
          const parsedB = parseInt(b.name, 10);

          if (isNaN(parsedA) || isNaN(parsedB)) {
            return a.name > b.name ? 1 : -1;
          }

          return parsedA - parsedB;
        });
