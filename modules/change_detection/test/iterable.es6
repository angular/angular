export class TestIterable {
  constructor() {
    this.list = [];
  }

  [Symbol.iterator]() {
    return this.list[Symbol.iterator]();
  }
}
