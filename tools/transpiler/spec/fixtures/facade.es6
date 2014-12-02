export class MapWrapper {

}

/**
 * Generic iterable class to test for-of.  Provides iteration of the given array.
 */
export class IterableList {
  constructor(values) {
    this.values = values;
  }

  *[Symbol.iterator]() {
    for (var value of this.values) {
      yield value;
    }
  }
}
