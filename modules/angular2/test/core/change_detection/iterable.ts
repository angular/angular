
export class TestIterable {
  list: number[];
  constructor() { this.list = []; }

  [Symbol.iterator]() { return this.list[Symbol.iterator](); }
}
