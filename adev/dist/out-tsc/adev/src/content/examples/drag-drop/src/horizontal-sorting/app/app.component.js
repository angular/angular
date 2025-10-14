import {__esDecorate, __runInitializers} from 'tslib';
import {CdkDrag, CdkDropList, moveItemInArray} from '@angular/cdk/drag-drop';
import {Component} from '@angular/core';
/**
 * @title Drag&Drop horizontal sorting
 */
let CdkDragDropHorizontalSortingExample = (() => {
  let _classDecorators = [
    Component({
      selector: 'cdk-drag-drop-horizontal-sorting-example',
      templateUrl: 'app.component.html',
      styleUrl: 'app.component.css',
      standalone: true,
      imports: [CdkDropList, CdkDrag],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var CdkDragDropHorizontalSortingExample = class {
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
      CdkDragDropHorizontalSortingExample = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    timePeriods = [
      'Bronze age',
      'Iron age',
      'Middle ages',
      'Early modern period',
      'Long nineteenth century',
    ];
    drop(event) {
      moveItemInArray(this.timePeriods, event.previousIndex, event.currentIndex);
    }
  };
  return (CdkDragDropHorizontalSortingExample = _classThis);
})();
export {CdkDragDropHorizontalSortingExample};
//# sourceMappingURL=app.component.js.map
