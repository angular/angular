import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
import {trigger, transition, state, animate, style, keyframes} from '@angular/animations';
let StatusSliderComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-status-slider',
      templateUrl: 'status-slider.component.html',
      styleUrls: ['status-slider.component.css'],
      animations: [
        trigger('slideStatus', [
          state('inactive', style({backgroundColor: 'blue'})),
          state('active', style({backgroundColor: '#754600'})),
          // #docregion keyframesWithOffsets
          transition('* => active', [
            animate(
              '2s',
              keyframes([
                style({backgroundColor: 'blue', offset: 0}),
                style({backgroundColor: 'red', offset: 0.8}),
                style({backgroundColor: '#754600', offset: 1.0}),
              ]),
            ),
          ]),
          transition('* => inactive', [
            animate(
              '2s',
              keyframes([
                style({backgroundColor: '#754600', offset: 0}),
                style({backgroundColor: 'red', offset: 0.2}),
                style({backgroundColor: 'blue', offset: 1.0}),
              ]),
            ),
          ]),
          // #enddocregion keyframesWithOffsets
          // #docregion keyframes
          transition('* => active', [
            animate(
              '2s',
              keyframes([
                style({backgroundColor: 'blue'}),
                style({backgroundColor: 'red'}),
                style({backgroundColor: 'orange'}),
              ]),
            ),
            // #enddocregion keyframes
          ]),
        ]),
      ],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var StatusSliderComponent = class {
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
      StatusSliderComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    status = 'inactive';
    toggle() {
      if (this.status === 'active') {
        this.status = 'inactive';
      } else {
        this.status = 'active';
      }
    }
  };
  return (StatusSliderComponent = _classThis);
})();
export {StatusSliderComponent};
//# sourceMappingURL=status-slider.component.js.map
