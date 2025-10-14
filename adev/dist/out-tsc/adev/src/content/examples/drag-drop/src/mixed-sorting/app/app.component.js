import {__esDecorate, __runInitializers} from 'tslib';
import {CdkDrag, CdkDropList, moveItemInArray} from '@angular/cdk/drag-drop';
import {Component} from '@angular/core';
/**
 * @title Drag&Drop horizontal wrapping list
 */
let CdkDragDropMixedSortingExample = (() => {
  let _classDecorators = [
    Component({
      selector: 'cdk-drag-drop-mixed-sorting-example',
      templateUrl: 'app.component.html',
      styleUrl: 'app.component.css',
      standalone: true,
      imports: [CdkDropList, CdkDrag],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var CdkDragDropMixedSortingExample = class {
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
      CdkDragDropMixedSortingExample = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    items = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    drop(event) {
      moveItemInArray(this.items, event.previousIndex, event.currentIndex);
    }
  };
  return (CdkDragDropMixedSortingExample = _classThis);
})();
export {CdkDragDropMixedSortingExample};
//# sourceMappingURL=app.component.js.map
