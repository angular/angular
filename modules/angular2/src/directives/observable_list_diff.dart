library angular2.directives.observable_list_iterable_diff;

import 'package:observe/observe.dart' show ObservableList, ListChangeRecord;
import 'package:angular2/change_detection.dart';
import 'package:angular2/src/change_detection/pipes/iterable_changes.dart';
import 'dart:async';
import 'package:angular2/src/facade/lang.dart';

class ChangeRecord implements IIterableChangeRecord {
  final int currentIndex;
  final int previousIndex;
  final dynamic item;

  ChangeRecord(this.item, this.previousIndex, this.currentIndex);

  String toString() {
    return previousIndex == currentIndex ?
      item.toString() :
      "${item}[${previousIndex}->${currentIndex}]";
  }
}

class ObservableListDiffResult implements IIterableChangesResult {
  final ObservableList _collection;
  final List<ListChangeRecord> _listChanges;

  ObservableListDiffResult(this._collection, this._listChanges);

  void forEachAddedItem(Function fn) {
    _listChanges.forEach((r) {
      if (r.addedCount > 0) {
        for (var i = 0; i < r.addedCount; ++i) {
          final currentIndex = r.index + i;
          final item = _collection[currentIndex];
          fn(new ChangeRecord(item, null, currentIndex));
        }
      }
    });
  }

  void forEachMovedItem(Function fn) {
//    _listChanges.forEach((r) {
//      if (r.addedCount > 0 || r.removed.isNotEmpty) {
//        var delta = r.addedCount - r.removed.length;
//
//        for (var i = 0; i < r.addedCount; ++i) {
//          final currentIndex = r.index + i;
//          final item = _collection[currentIndex];
//          fn(new ChangeRecord(item, null, currentIndex));
//        }
//      }
//    });
  }

  void forEachRemovedItem(Function fn) {
    int shift = 0;
    _listChanges.forEach((r) {
      if (! r.removed.isEmpty) {
        for (var i = 0; i < r.removed.length; ++i) {
          final currentIndex = r.index + i;
          fn(new ChangeRecord(r.removed[i], currentIndex + shift, null));
        }
//        shift += r.removed.length;
      }
    });
  }

  String toString() {
    var additions = [];
    forEachAddedItem(additions.add);

    var moves = [];
    forEachMovedItem(moves.add);

    var removals = [];
    forEachRemovedItem(removals.add);

    return "additions: ${additions.join(", ")} moves: ${moves.join(", ")} removals: ${removals.join(", ")}";
  }
}

class ObservableListDiff implements Pipe {
  // a set of changes between two change detection runs
  ObservableListDiffResult _diff;

  // a set of changes we are collecting between two change detection runs
  List<ListChangeRecord> _listChanges = [];

  ObservableList _collection;

  StreamSubscription _subscription;

  final ChangeDetectorRef _ref;

  ObservableListDiff(this._ref) {
    _collection = new ObservableList();
  }

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
    // - We need to calculate a diff between the new and the old collections.
    if (!identical(_collection, collection)) {
      _listChanges = ObservableList.calculateChangeRecords(_collection, collection);

      if (_subscription != null) _subscription.cancel();

      _subscription = collection.listChanges.listen((newRecords) {
        _listChanges.addAll(newRecords);
        _ref.requestCheck();
      });

      _collection = collection;
      _flushChanges();

    } else {
      _flushChanges();
    }

    return _diff;
  }

  void _flushChanges() {
    _diff = new ObservableListDiffResult(_collection, _listChanges);
    _listChanges = [];
  }
}

class ObservableListDiffFactory implements PipeFactory {
  const ObservableListDiffFactory();
  bool supports(obj) => obj is ObservableList;
  Pipe create(ChangeDetectorRef cdRef) {
    return new ObservableListDiff(cdRef);
  }
}
