import {getSymbolIterator} from 'angular2/src/facade/lang';

export class TestIterable {
  list: number[];
  constructor() { this.list = []; }

  [getSymbolIterator()]() { return this.list[getSymbolIterator()](); }
}
