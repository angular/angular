import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
import {OpenCloseComponent} from './open-close.component';
let OpenClosePageComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-open-close-page',
      template: `
    <section>
      <h2>Open Close Component</h2>
      <input type="checkbox" id="log-checkbox" [checked]="logging" (click)="toggleLogging()"/>
      <label for="log-checkbox">Console Log Animation Events</label>

      <app-open-close [logging]="logging"></app-open-close>
    </section>
  `,
      imports: [OpenCloseComponent],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var OpenClosePageComponent = class {
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
      OpenClosePageComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    logging = false;
    toggleLogging() {
      this.logging = !this.logging;
    }
  };
  return (OpenClosePageComponent = _classThis);
})();
export {OpenClosePageComponent};
//# sourceMappingURL=open-close-page.component.js.map
