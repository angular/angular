import 'dart:collection';

class MapWrapper {

}

class IterableList extends Object with IterableMixin {
  List values;
  IterableList(values) {
    this.values = values;
  }
  Iterator get iterator => values.iterator;
}
