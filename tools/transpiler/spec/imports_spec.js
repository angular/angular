import {Foo, Bar} from './foo';
// import {Foo as F} from './fixtures/foo';
import fooModule from './foo';

import {MapWrapper wraps Map} from './fixtures/facade';

import exportModule from './export';

import unittest from 'unittest/unittest';

function main() {
  assert(Foo == 'FOO');
  assert(Bar == 'BAR');
  // assert(F == 'FOO');
  assert(fooModule.Foo == 'FOO');
  assert(fooModule.Bar == 'BAR');

  assert(exportModule.Foo == 'FOO');
  assert(exportModule.Bar == 'BAR');

  assert(unittest.PASS != null);
}
