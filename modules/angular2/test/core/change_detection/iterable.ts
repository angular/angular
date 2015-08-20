import {List} from 'angular2/src/core/facade/collection';

export class TestIterable {
  list: List<number>;
  constructor() { this.list = []; }

  [Symbol.iterator]() { return this.list[Symbol.iterator](); }
}
