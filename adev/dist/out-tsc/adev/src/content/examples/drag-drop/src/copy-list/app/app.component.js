import {__esDecorate, __runInitializers} from 'tslib';
import {CdkDrag, CdkDropList, copyArrayItem, moveItemInArray} from '@angular/cdk/drag-drop';
import {Component} from '@angular/core';
/**
 * @title Drag&Drop copy between lists
 */
let CdkDragDropCopyListExample = (() => {
  let _classDecorators = [
    Component({
      selector: 'cdk-drag-drop-copy-list-example',
      templateUrl: 'app.component.html',
      styleUrl: 'app.component.css',
      imports: [CdkDropList, CdkDrag],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var CdkDragDropCopyListExample = class {
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
      CdkDragDropCopyListExample = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    products = ['Bananas', 'Oranges', 'Bread', 'Butter', 'Soda', 'Eggs'];
    cart = ['Tomatoes'];
    drop(event) {
      if (event.previousContainer === event.container) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      } else {
        copyArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex,
        );
      }
    }
  };
  return (CdkDragDropCopyListExample = _classThis);
})();
export {CdkDragDropCopyListExample};
//# sourceMappingURL=app.component.js.map
