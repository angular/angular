import {describe, it, expect} from 'angular2/test_lib';
import {ListWrapper, MapWrapper} from 'angular2/src/facade/collection';
import {IterableList} from './fixtures/facade';

export function main() {
  // TODO(tbosch): For ... of is not supported by our Dart transpiler right now.
  // Vojta had a traceur branch that reverted https://github.com/google/traceur-compiler/commit/2d12b2f9cea86e4f234c90dcc188b4c7a2881359
  // to make it work, but we should first implement this in a proper way before we start using it!

  // describe('for..of', function() {
  //   it('should iterate iterable', function() {
  //     var values = ['a', 'b', 'c'];
  //     var result = ListWrapper.create();
  //     for (var value of new IterableList(values)) {
  //       ListWrapper.push(result, value);
  //     }
  //     expect(result).toEqual(values);
  //   });

  //   it('should iterate iterable without var declaration list', function() {
  //     var values = ['a', 'b', 'c'];
  //     var result = ListWrapper.create();
  //     var value;
  //     for (value of new IterableList(values)) {
  //       ListWrapper.push(result, value);
  //     }
  //     expect(value).toEqual('c');
  //     expect(result).toEqual(values);
  //   });

  //   it('should iterate maps', function() {
  //     var values = [['a', 1], ['b', 2], ['c', 3]];
  //     var result = ListWrapper.create();
  //     var map = MapWrapper.createFromPairs(values);
  //     for (var [key, value] of MapWrapper.iterable(map)) {
  //       ListWrapper.push(result, [key, value]);
  //     }
  //     expect(result).toEqual(values);
  //   });

  //   it('should iterate maps without var declaration list', function() {
  //     var values = [['a', 1], ['b', 2], ['c', 3]];
  //     var result = ListWrapper.create();
  //     var map = MapWrapper.createFromPairs(values);
  //     var key, value;
  //     for ([key, value] of MapWrapper.iterable(map)) {
  //       ListWrapper.push(result, [key, value]);
  //     }
  //     expect(key).toEqual('c');
  //     expect(value).toEqual(3);
  //     expect(result).toEqual(values);
  //   });
  // });
}

