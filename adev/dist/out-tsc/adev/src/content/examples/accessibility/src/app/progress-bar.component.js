import {__esDecorate, __runInitializers} from 'tslib';
/* eslint-disable @angular-eslint/no-host-metadata-property */
// #docregion progressbar-component
import {Component, input} from '@angular/core';
/**
 * Example progressbar component.
 */
let ExampleProgressbarComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-example-progressbar',
      template: '<div class="bar" [style.width.%]="value()"></div>',
      styleUrls: ['./progress-bar.component.css'],
      host: {
        // Sets the role for this component to "progressbar"
        role: 'progressbar',
        // Sets the minimum and maximum values for the progressbar role.
        'aria-valuemin': '0',
        'aria-valuemax': '100',
        // Binding that updates the current value of the progressbar.
        '[attr.aria-valuenow]': 'value',
      },
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var ExampleProgressbarComponent = class {
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
      ExampleProgressbarComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    /** Current value of the progressbar. */
    value = input(0);
  };
  return (ExampleProgressbarComponent = _classThis);
})();
export {ExampleProgressbarComponent};
// #enddocregion progressbar-component
//# sourceMappingURL=progress-bar.component.js.map
