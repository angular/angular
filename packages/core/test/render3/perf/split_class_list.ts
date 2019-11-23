/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {processClassToken, splitClassList} from '@angular/core/src/render3/styling/class_differ';

import {createBenchmark} from './micro_bench';

const benchmark = createBenchmark('split_class_list');
const splitTime = benchmark('String.split(" ")');
const splitRegexpTime = benchmark('String.split(/\\s+/)');
const splitClassListTime = benchmark('splitClassList');

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const CLASSES: string[] = [LETTERS];
for (let i = 0; i < LETTERS.length; i++) {
  CLASSES.push(LETTERS.substring(0, i) + ' ' + LETTERS.substring(i, LETTERS.length));
}

let index = 0;
let changes = new Map<string, boolean|null>();
let parts: string[] = [];
while (splitTime()) {
  changes = clearArray(changes);
  const classes = CLASSES[index++];
  parts = classes.split(' ');
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part !== '') {
      processClassToken(changes, part, false);
    }
  }
  if (index === CLASSES.length) index = 0;
}

const WHITESPACE = /\s+/m;
while (splitRegexpTime()) {
  changes = clearArray(changes);
  const classes = CLASSES[index++];
  parts = classes.split(WHITESPACE);
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part !== '') {
      processClassToken(changes, part, false);
    }
  }
  if (index === CLASSES.length) index = 0;
}

while (splitClassListTime()) {
  changes = clearArray(changes);
  splitClassList(CLASSES[index++], changes, false);
  if (index === CLASSES.length) index = 0;
}

benchmark.report();

function clearArray(a: Map<any, any>): any {
  a.clear();
}