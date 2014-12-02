import 'dart:collection';

class MapWrapper {

}

/**
 * Generic iterable class to test for-of.  Provides iteration of the given list.
 */
class IterableList extends IterableBase {
  List values;
  IterableList(values) {
    this.values = values;
  }
  Iterator get iterator => values.iterator;
}
