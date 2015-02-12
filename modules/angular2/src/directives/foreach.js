import {Viewport, onChange} from 'angular2/src/core/annotations/annotations';
import {OnChange} from 'angular2/src/core/compiler/interfaces';
import {ViewContainer} from 'angular2/src/core/compiler/view_container';
import {View} from 'angular2/src/core/compiler/view';
import {isPresent, isBlank} from 'angular2/src/facade/lang';
import {ListWrapper} from 'angular2/src/facade/collection';

@Viewport({
  selector: '[foreach][in]',
  lifecycle: [onChange],
  bind: {
    'in': 'iterable[]'
  }
})
export class Foreach extends OnChange {
  viewContainer: ViewContainer;
  iterable;
  constructor(viewContainer: ViewContainer) {
    super();
    this.viewContainer = viewContainer;
  }
  onChange(changes) {
    var iteratorChanges = changes['iterable'];
    if (isBlank(iteratorChanges) || isBlank(iteratorChanges.currentValue)) {
      this.viewContainer.clear();
      return;
    }

    // TODO(rado): check if change detection can produce a change record that is
    // easier to consume than current.
    var recordViewTuples = [];
    iteratorChanges.currentValue.forEachRemovedItem(
      (removedRecord) => ListWrapper.push(recordViewTuples, new RecordViewTuple(removedRecord, null))
    );

    iteratorChanges.currentValue.forEachMovedItem(
      (movedRecord) => ListWrapper.push(recordViewTuples, new RecordViewTuple(movedRecord, null))
    );

    var insertTuples = Foreach.bulkRemove(recordViewTuples, this.viewContainer);

    iteratorChanges.currentValue.forEachAddedItem(
      (addedRecord) => ListWrapper.push(insertTuples, new RecordViewTuple(addedRecord, null))
    );

    Foreach.bulkInsert(insertTuples, this.viewContainer);

    for (var i = 0; i < insertTuples.length; i++) {
      this.perViewChange(insertTuples[i].view, insertTuples[i].record);
    }
  }

  perViewChange(view, record) {
    view.setLocal('\$implicit', record.item);
    view.setLocal('index', record.currentIndex);
  }

  static bulkRemove(tuples, viewContainer) {
    tuples.sort((a, b) => a.record.previousIndex - b.record.previousIndex);
    var movedTuples = [];
    for (var i = tuples.length - 1; i >= 0; i--) {
      var tuple = tuples[i];
      // separate moved views from removed views.
      if (isPresent(tuple.record.currentIndex)) {
        tuple.view = viewContainer.detach(tuple.record.previousIndex);
        ListWrapper.push(movedTuples, tuple);
      } else {
        viewContainer.remove(tuple.record.previousIndex);
      }
    }
    return movedTuples;
  }

  static bulkInsert(tuples, viewContainer) {
    tuples.sort((a, b) => a.record.currentIndex - b.record.currentIndex);
    for (var i = 0; i < tuples.length; i++) {
      var tuple = tuples[i];
      if (isPresent(tuple.view)) {
        viewContainer.insert(tuple.view, tuple.record.currentIndex);
      } else {
        tuple.view = viewContainer.create(tuple.record.currentIndex);
      }
    }
    return tuples;
  }
}

class RecordViewTuple {
  view: View;
  record: any;
  constructor(record, view) {
    this.record = record;
    this.view = view;
  }
}
