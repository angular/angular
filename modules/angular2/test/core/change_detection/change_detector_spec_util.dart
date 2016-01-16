library angular.change_detection.change_detector_spec_util;

import 'package:observe/observe.dart' show Observable;
import 'dart:async';

dynamic createObservableModel() {
  return new Entity();
}

class Entity implements Observable {
  Stream changes;
  StreamController controller;

  Entity() {
    controller = new StreamController.broadcast();
    changes = controller.stream;
  }

  pushUpdate() {
    controller.add("new");
  }

  bool get hasObservers => null;
  bool deliverChanges() => null;
  notifyPropertyChange(Symbol field, Object oldValue, Object newValue) => null;
  void notifyChange(record) {}
}
