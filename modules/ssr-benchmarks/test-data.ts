/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

let data: {name: string; id: string}[] = [];

export function testData() {
  return data;
}

// We can drop this and use crypto.randomUUID() once we move to node 20
function randomUUID() {
  let uuid = '';
  const chars = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
  for (let i = 0; i < chars.length; i++) {
    const randomValue = (Math.random() * 16) | 0; // Generate random value (0-15)
    if (chars[i] === 'x') {
      uuid += randomValue.toString(16); // Replace 'x' with random hex value
    } else if (chars[i] === 'y') {
      uuid += ((randomValue & 0x3) | 0x8).toString(16); // Replace 'y' with a value between 8 and 11
    } else {
      uuid += chars[i]; // Preserve the dashes and '4' in the template
    }
  }
  return uuid;
}

export function initData(count: number) {
  data = Array.from({length: count}, () => ({id: randomUUID(), name: randomUUID()}));
}
