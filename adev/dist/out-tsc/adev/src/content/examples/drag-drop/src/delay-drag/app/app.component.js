import {__esDecorate, __runInitializers} from 'tslib';
import {CdkDrag} from '@angular/cdk/drag-drop';
import {Component} from '@angular/core';
/**
 * @title Delay dragging
 */
let CdkDragDropDelayExample = (() => {
  let _classDecorators = [
    Component({
      selector: 'cdk-drag-drop-delay-example',
      templateUrl: 'app.component.html',
      styleUrl: 'app.component.css',
      standalone: true,
      imports: [CdkDrag],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var CdkDragDropDelayExample = class {
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
      CdkDragDropDelayExample = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
  };
  return (CdkDragDropDelayExample = _classThis);
})();
export {CdkDragDropDelayExample};
//# sourceMappingURL=app.component.js.map
