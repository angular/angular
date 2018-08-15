/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

const PARSE_TO_PAIRS = /([0-9]+[^0-9]+)/g;
const PAIR_SPLIT = /^([0-9]+)([dhmsu]+)$/;

export function parseDurationToMs(duration: string): number {
  const matches: string[] = [];

  let array: RegExpExecArray|null;
  while ((array = PARSE_TO_PAIRS.exec(duration)) !== null) {
    matches.push(array[0]);
  }
  return matches
      .map(match => {
        const res = PAIR_SPLIT.exec(match);
        if (res === null) {
          throw new Error(`Not a valid duration: ${match}`);
        }
        let factor: number = 0;
        switch (res[2]) {
          case 'd':
            factor = 86400000;
            break;
          case 'h':
            factor = 3600000;
            break;
          case 'm':
            factor = 60000;
            break;
          case 's':
            factor = 1000;
            break;
          case 'u':
            factor = 1;
            break;
          default:
            throw new Error(`Not a valid duration unit: ${res[2]}`);
        }
        return parseInt(res[1]) * factor;
      })
      .reduce((total, value) => total + value, 0);
}
