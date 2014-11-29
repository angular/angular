export class MapWrapper {

}

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
