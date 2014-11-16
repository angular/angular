import 'dart:collection';

class MapWrapper {

}

class ArrayWrapper<E> extends ListBase<E> {
  List innerList = new List();

  int get length => innerList.length;

  void set length(int length) {
    innerList.length = length;
  }

  void operator[]=(int index, E value) {
    innerList[index] = value;
  }

  E operator [](int index) => innerList[index];

  void push(E value) => innerList.add(value);
}

class IterableList extends Object with IterableMixin {
  List values;
  IterableList(values) {
    this.values = values;
  }
  Iterator get iterator => values.iterator;
}
