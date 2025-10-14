import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
import {StatusSliderComponent} from './status-slider.component';
let StatusSliderPageComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-status-slider-page',
      template: `
    <section>
      <h2>Status Slider</h2>
      <app-status-slider></app-status-slider>
    </section>
  `,
      imports: [StatusSliderComponent],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var StatusSliderPageComponent = class {
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
      StatusSliderPageComponent = _classThis = _classDescriptor.value;
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
  return (StatusSliderPageComponent = _classThis);
})();
export {StatusSliderPageComponent};
//# sourceMappingURL=status-slider-page.component.js.map
