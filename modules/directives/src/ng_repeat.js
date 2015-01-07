import {Template} from 'core/annotations/annotations';
import {OnChange} from 'core/compiler/interfaces';
import {ViewPort} from 'core/compiler/viewport';
import {View} from 'core/compiler/view';
import {isPresent, isBlank} from 'facade/lang';
import {ListWrapper} from 'facade/collection';

@Template({
  selector: '[ng-repeat]',
  bind: {
    'in': 'iterable[]'
  }
})
export class NgRepeat extends OnChange {
  viewPort: ViewPort;
  iterable;
  constructor(viewPort: ViewPort) {
    this.viewPort = viewPort;
  }
  onChange(changes) {
    var iteratorChanges = changes['iterable'];
    if (isBlank(iteratorChanges) || isBlank(iteratorChanges.currentValue)) {
      this.viewPort.clear();
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

    var insertTuples = NgRepeat.bulkRemove(recordViewTuples, this.viewPort);

    iteratorChanges.currentValue.forEachAddedItem(
      (addedRecord) => ListWrapper.push(insertTuples, new RecordViewTuple(addedRecord, null))
    );

    NgRepeat.bulkInsert(insertTuples, this.viewPort);

    for (var i = 0; i < insertTuples.length; i++) {
      this.perViewChange(insertTuples[i].view, insertTuples[i].record);
    }
  }

  perViewChange(view, record) {
    view.setLocal('ng-repeat', record.item);
    // Uncomment when binding is ready.
    // view.setLocal('index', record.item);
  }

  static bulkRemove(tuples, viewPort) {
    tuples.sort((a, b) => a.record.previousIndex - b.record.previousIndex);
    var movedTuples = [];
    for (var i = tuples.length - 1; i >= 0; i--) {
      var tuple = tuples[i];
      var view = viewPort.remove(tuple.record.previousIndex);
      if (isPresent(tuple.record.currentIndex)) {
        tuple.view = view;
        ListWrapper.push(movedTuples, tuple);
      }
    }
    return movedTuples;
  }

  static bulkInsert(tuples, viewPort) {
    tuples.sort((a, b) => a.record.currentIndex - b.record.currentIndex);
    for (var i = 0; i < tuples.length; i++) {
      var tuple = tuples[i];
      if (isPresent(tuple.view)) {
        viewPort.insert(tuple.view, tuple.record.currentIndex);
      } else {
        tuple.view = viewPort.create(tuple.record.currentIndex);
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
