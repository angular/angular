import {__esDecorate, __runInitializers} from 'tslib';
import {
  CdkDrag,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import {Component} from '@angular/core';
/**
 * @title Drag&Drop disabled sorting
 */
let CdkDragDropDisabledSortingExample = (() => {
  let _classDecorators = [
    Component({
      selector: 'cdk-drag-drop-disabled-sorting-example',
      templateUrl: 'app.component.html',
      styleUrl: 'app.component.css',
      standalone: true,
      imports: [CdkDropListGroup, CdkDropList, CdkDrag],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var CdkDragDropDisabledSortingExample = class {
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
      CdkDragDropDisabledSortingExample = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    items = ['Carrots', 'Tomatoes', 'Onions', 'Apples', 'Avocados'];
    basket = ['Oranges', 'Bananas', 'Cucumbers'];
    drop(event) {
      if (event.previousContainer === event.container) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      } else {
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex,
        );
      }
    }
  };
  return (CdkDragDropDisabledSortingExample = _classThis);
})();
export {CdkDragDropDisabledSortingExample};
//# sourceMappingURL=app.component.js.map
