import {__esDecorate, __runInitializers} from 'tslib';
import {CdkDrag, CdkDropList, moveItemInArray} from '@angular/cdk/drag-drop';
import {Component} from '@angular/core';
/**
 * @title Drag&Drop sort predicate
 */
let CdkDragDropSortPredicateExample = (() => {
  let _classDecorators = [
    Component({
      selector: 'cdk-drag-drop-sort-predicate-example',
      templateUrl: 'app.component.html',
      styleUrl: 'app.component.css',
      standalone: true,
      imports: [CdkDropList, CdkDrag],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var CdkDragDropSortPredicateExample = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      CdkDragDropSortPredicateExample = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    numbers = [1, 2, 3, 4, 5, 6, 7, 8];
    drop(event) {
      moveItemInArray(this.numbers, event.previousIndex, event.currentIndex);
    }
    /**
     * Predicate function that only allows even numbers to be
     * sorted into even indices and odd numbers at odd indices.
     */
    sortPredicate(index, item) {
      return (index + 1) % 2 === item.data % 2;
    }
  };
  return (CdkDragDropSortPredicateExample = _classThis);
})();
export {CdkDragDropSortPredicateExample};
//# sourceMappingURL=app.component.js.map
