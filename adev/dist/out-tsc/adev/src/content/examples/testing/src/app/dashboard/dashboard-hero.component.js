import {__esDecorate, __runInitializers} from 'tslib';
// #docregion
import {Component, input, output} from '@angular/core';
import {UpperCasePipe} from '@angular/common';
// #docregion component
let DashboardHeroComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'dashboard-hero',
      template: `
    <button type="button" (click)="click()" class="hero">
      {{ hero().name | uppercase }}
    </button>
  `,
      styleUrls: ['./dashboard-hero.component.css'],
      imports: [UpperCasePipe],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var DashboardHeroComponent = class {
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
      DashboardHeroComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    hero = input.required();
    selected = output();
    click() {
      this.selected.emit(this.hero());
    }
  };
  return (DashboardHeroComponent = _classThis);
})();
export {DashboardHeroComponent};
// #enddocregion component, class
//# sourceMappingURL=dashboard-hero.component.js.map
