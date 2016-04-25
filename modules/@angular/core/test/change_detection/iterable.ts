import {getSymbolIterator} from '@angular/facade';

export class TestIterable {
  list: number[];
  constructor() { this.list = []; }

  [getSymbolIterator()]() { return this.list[getSymbolIterator()](); }
}
