import {__esDecorate, __runInitializers} from 'tslib';
import {Component, signal, computed} from '@angular/core';
import {bootstrapApplication} from '@angular/platform-browser';
let CookieRecipe = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-root',
      template: `
    <h2>Cookie recipe</h2>

    <label>
      # of cookies:
      <input type="range" min="10" max="100" step="10" [value]="count()" (input)="update($event)" />
      {{ count() }}
    </label>

    <p>Butter: {{ butter() }} cup(s)</p>
    <p>Sugar: {{ sugar() }} cup(s)</p>
    <p>Flour: {{ flour() }} cup(s)</p>
  `,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var CookieRecipe = class {
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
      CookieRecipe = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    count = signal(10);
    butter = computed(() => this.count() * 0.1);
    sugar = computed(() => this.count() * 0.05);
    flour = computed(() => this.count() * 0.2);
    update(event) {
      const input = event.target;
      this.count.set(parseInt(input.value));
    }
  };
  return (CookieRecipe = _classThis);
})();
export {CookieRecipe};
bootstrapApplication(CookieRecipe);
//# sourceMappingURL=main.js.map
