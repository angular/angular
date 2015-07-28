library angular2.directives.observable_list_iterable_diff;

import 'package:observe/observe.dart' show ObservableList;
import 'package:angular2/change_detection.dart';
import 'package:angular2/src/change_detection/pipes/iterable_changes.dart';
import 'dart:async';

class ObservableListDiff extends IterableChanges {
  ChangeDetectorRef _ref;
  ObservableListDiff(this._ref);

  bool _updated = true;
  ObservableList _collection;
  StreamSubscription _subscription;

  bool supports(obj) {
    if (obj is ObservableList) return true;
    throw "Cannot change the type of a collection";
  }

  onDestroy() {
    if (this._subscription != null) {
      this._subscription.cancel();
      this._subscription = null;
      this._collection = null;
    }
  }

  dynamic transform(ObservableList collection, [List args]) {
    // A new collection instance is passed in.
    // - We need to set up a listener.
    // - We need to transform collection.
    if (!identical(_collection, collection)) {
      _collection = collection;

      if (_subscription != null) _subscription.cancel();
      _subscription = collection.changes.listen((_) {
        _updated = true;
        _ref.requestCheck();
      });
      _updated = false;
      return super.transform(collection, args);

      // An update has been registered since the last change detection check.
      // - We reset the flag.
      // - We diff the collection.
    } else if (_updated) {
      _updated = false;
      return super.transform(collection, args);

      // No updates has been registered.
      // Returning this tells change detection that object has not change,
      // so it should NOT update the binding.
    } else {
      return this;
    }
  }
}

class ObservableListDiffFactory implements PipeFactory {
  const ObservableListDiffFactory();
  bool supports(obj) => obj is ObservableList;
  Pipe create(ChangeDetectorRef cdRef) {
    return new ObservableListDiff(cdRef);
  }
}
