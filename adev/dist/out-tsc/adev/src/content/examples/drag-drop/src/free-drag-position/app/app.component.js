import {__esDecorate, __runInitializers} from 'tslib';
import {CdkDrag} from '@angular/cdk/drag-drop';
import {Component} from '@angular/core';
/**
 * @title Programmatically setting the free drag position
 */
let CdkDragDropFreeDragPositionExample = (() => {
  let _classDecorators = [
    Component({
      selector: 'cdk-drag-drop-free-drag-position-example',
      templateUrl: 'app.component.html',
      styleUrl: 'app.component.css',
      standalone: true,
      imports: [CdkDrag],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var CdkDragDropFreeDragPositionExample = class {
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
      CdkDragDropFreeDragPositionExample = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    dragPosition = {x: 0, y: 0};
    changePosition() {
      this.dragPosition = {x: this.dragPosition.x + 50, y: this.dragPosition.y + 50};
    }
  };
  return (CdkDragDropFreeDragPositionExample = _classThis);
})();
export {CdkDragDropFreeDragPositionExample};
//# sourceMappingURL=app.component.js.map
