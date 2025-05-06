/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

const JSDOCS_RAWCONTENT_FILE = `
// #docregion class
class Foo {}
// #enddocregion

// #docregion function
function bar() {}
// #enddocregion
`;

const SINGLE_EXAMPLE_FILE = `
import {foo} from 'bar';

// #docregion foo
foo('Hello world!');
// #enddocregion
`;

const MULTIPLE_EXAMPLES_FILE = `
import {foo} from 'bar';

// #docregion example-1
foo(null);
// #enddocregion

foo('');

// #docregion example-2
type Test = 'a' | 'b';
// #enddocregion
`;

const NESTED_EXAMPLES_FILE = `
import {foo} from 'bar';

// #docregion out
function baz() {
  // #docregion in
  const leet = 1337;
  // #enddocregion
}
// #enddocregion
`;

const REGIONS_EXAMPLE_FILE = `
import {foo} from 'bar';

// #docregion fn
function baz() {
// #enddocregion
  const leet = 1337;

  if (true) {
    console.log(leet);
  }

// #docregion fn
}
// #enddocregion
`;

const OVERLAP_PARAM_EXAMPLE_FILE = `
// #docregion 1st
import {foo} from 'bar';

// #docregion 2nd
class Baz {
  constructor () {}
  // #enddocregion 1st

  example () {}
}
// #enddocregion 2nd
`;

const COMPLEX_EXAMPLE_FILE = `
import {foo} from 'bar';
// #docregion ex-1
import {baz} from 'foo';
// #enddocregion

// #docregion ex-2
function test() {}
// #enddocregion

// #docregion ex-3
function test2() {
  // #docregion ex-4
  const leet = 1337;
  // #enddocregion
}
// #enddocregion

// #docregion ex-2
baz();
// #enddocregion

// #docregion ex-5
const A = 'a';
// #docregion ex-6
const B = 'b';
// #enddocregion ex-5
const C = 'c';
// #enddocregion ex-6
`;

const HTML_EXAMPLE_FILE = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Angular</title>
  </head>
  <body>
    <!-- #docregion tags -->
    <i>Foo</i>
    <!-- #enddocregion -->
    <strong>Bar</strong>
    <!-- #docregion tags -->
    <p>Baz</p>
    <!-- #enddocregion -->
  </body>
</html>
`;

export const mockReadFileSync = (path: string): string => {
  switch (path.split('/').pop()) {
    case 'jsdocs_raw.ts':
      return JSDOCS_RAWCONTENT_FILE;
    case 'single.ts':
      return SINGLE_EXAMPLE_FILE;
    case 'multi.ts':
      return MULTIPLE_EXAMPLES_FILE;
    case 'nested.ts':
      return NESTED_EXAMPLES_FILE;
    case 'regions.ts':
      return REGIONS_EXAMPLE_FILE;
    case 'overlap.ts':
      return OVERLAP_PARAM_EXAMPLE_FILE;
    case 'complex.ts':
      return COMPLEX_EXAMPLE_FILE;
    case 'index.html':
      return HTML_EXAMPLE_FILE;
  }
  return '';
};
