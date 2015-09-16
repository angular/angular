import {getSymbolIterator} from 'angular2/src/core/facade/lang';

export class TestIterable {
  list: number[];
  constructor() { this.list = []; }

  [getSymbolIterator()]() { return this.list[getSymbolIterator()](); }
}
