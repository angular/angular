import {__esDecorate, __runInitializers} from 'tslib';
// #docplaster
// #docregion import-canvas-patch
// Import patch to make async `HTMLCanvasElement` methods (such as `.toBlob()`) Zone.js-aware.
// Either import in `polyfills.ts` (if used in more than one places in the app) or in the component
// file using `HTMLCanvasElement` (if it is only used in a single file).
import 'zone.js/plugins/zone-patch-canvas';
// #enddocregion import-canvas-patch
// #docregion main
import {Component, ViewChild} from '@angular/core';
let CanvasComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'sample-canvas',
      template: '<canvas #sampleCanvas width="200" height="200"></canvas>',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _sampleCanvas_decorators;
  let _sampleCanvas_initializers = [];
  let _sampleCanvas_extraInitializers = [];
  var CanvasComponent = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      _sampleCanvas_decorators = [ViewChild('sampleCanvas')];
      __esDecorate(
        null,
        null,
        _sampleCanvas_decorators,
        {
          kind: 'field',
          name: 'sampleCanvas',
          static: false,
          private: false,
          access: {
            has: (obj) => 'sampleCanvas' in obj,
            get: (obj) => obj.sampleCanvas,
            set: (obj, value) => {
              obj.sampleCanvas = value;
            },
          },
          metadata: _metadata,
        },
        _sampleCanvas_initializers,
        _sampleCanvas_extraInitializers,
      );
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      CanvasComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    blobSize = 0;
    sampleCanvas = __runInitializers(this, _sampleCanvas_initializers, void 0);
    ngAfterViewInit() {
      const canvas = this.sampleCanvas.nativeElement;
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, 200, 200);
      context.fillStyle = '#FF1122';
      context.fillRect(0, 0, 200, 200);
      canvas.toBlob((blob) => {
        this.blobSize = blob?.size ?? 0;
      });
    }
    constructor() {
      __runInitializers(this, _sampleCanvas_extraInitializers);
    }
  };
  return (CanvasComponent = _classThis);
})();
export {CanvasComponent};
// #enddocregion main
//# sourceMappingURL=canvas.component.js.map
