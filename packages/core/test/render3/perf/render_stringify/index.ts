/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {createBenchmark} from '../micro_bench';

// These benchmarks compare various implementations of the `renderStringify` utility
// which vary in subtle ways which end up having an effect on performance.

/** Uses string concatenation to convert a value into a string. */
function renderStringifyConcat(value: any): string {
  if (typeof value === 'string') return value;
  if (value == null) return '';
  return '' + value;
}

/** Uses `toString` to convert a value into a string. */
function renderStringifyToString(value: any): string {
  if (typeof value === 'string') return value;
  if (value == null) return '';
  return value.toString();
}

/** Uses the `String` constructor to convert a value into a string. */
function renderStringifyConstructor(value: any): string {
  if (typeof value === 'string') return value;
  if (value == null) return '';
  return String(value);
}

const objects: any[] = [];
const objectsWithToString: any[] = [];

// Allocate a bunch of objects with a unique structure.
for (let i = 0; i < 1000000; i++) {
  objects.push({['foo_' + i]: i});
  objectsWithToString.push({['foo_' + i]: i, toString: () => 'x'});
}
const max = objects.length - 1;
let i = 0;

const benchmarkRefresh = createBenchmark('renderStringify');
const renderStringifyConcatTime = benchmarkRefresh('concat');
const renderStringifyConcatWithToStringTime = benchmarkRefresh('concat with toString');
const renderStringifyToStringTime = benchmarkRefresh('toString');
const renderStringifyToStringWithToStringTime = benchmarkRefresh('toString with toString');
const renderStringifyConstructorTime = benchmarkRefresh('constructor');
const renderStringifyConstructorWithToStringTime = benchmarkRefresh('constructor with toString');
const renderStringifyToStringMonoTime = benchmarkRefresh('toString mono');
const renderStringifyToStringWithToStringMonoTime = benchmarkRefresh('toString with toString mono');

// Important! This code is somewhat repetitive, but we can't move it out into something like
// `benchmark(name, stringifyFn)`, because passing in the function as a parameter breaks inlining.

// String concatenation
while (renderStringifyConcatTime()) {
  renderStringifyConcat(objects[i]);
  i = i < max ? i + 1 : 0;
}

while (renderStringifyConcatWithToStringTime()) {
  renderStringifyConcat(objectsWithToString[i]);
  i = i < max ? i + 1 : 0;
}
/////////////

// String()
while (renderStringifyConstructorTime()) {
  renderStringifyConstructor(objects[i]);
  i = i < max ? i + 1 : 0;
}

while (renderStringifyConstructorWithToStringTime()) {
  renderStringifyConstructor(objectsWithToString[i]);
  i = i < max ? i + 1 : 0;
}
/////////////

// toString
while (renderStringifyToStringTime()) {
  renderStringifyToString(objects[i]);
  i = i < max ? i + 1 : 0;
}

while (renderStringifyToStringWithToStringTime()) {
  renderStringifyToString(objectsWithToString[i]);
  i = i < max ? i + 1 : 0;
}
/////////////

// toString mono
while (renderStringifyToStringMonoTime()) {
  renderStringifyToString(objects[0]);
}

while (renderStringifyToStringWithToStringMonoTime()) {
  renderStringifyToString(objectsWithToString[0]);
}
/////////////

benchmarkRefresh.report();
