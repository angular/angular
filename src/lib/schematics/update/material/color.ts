/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {bold, green, red} from 'chalk';

const colorFns = {
  'b': bold,
  'g': green,
  'r': red,
};

export function color(message: string): string {
  // 'r{{text}}' with red 'text', 'g{{text}}' with green 'text', and 'b{{text}}' with bold 'text'.
  return message.replace(/(.){{(.*?)}}/g, (_m, fnName, text) => {
    const fn = colorFns[fnName];
    return fn ? fn(text) : text;
  });
}
