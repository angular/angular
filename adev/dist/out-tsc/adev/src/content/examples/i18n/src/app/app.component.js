import {__esDecorate, __runInitializers} from 'tslib';
// #docregion
import {Component, computed, signal} from '@angular/core';
import {$localize} from '@angular/localize/init';
let AppComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-root',
      templateUrl: './app.component.html',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var AppComponent = class {
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
      AppComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    minutes = 0;
    gender = 'female';
    fly = true;
    logo = '${this.baseUrl}/angular.svg';
    toggle = signal(false);
    toggleAriaLabel = computed(() => {
      return this.toggle()
        ? $localize`:Toggle Button|A button to toggle status:Show`
        : $localize`:Toggle Button|A button to toggle status:Hide`;
    });
    inc(i) {
      this.minutes = Math.min(5, Math.max(0, this.minutes + i));
    }
    male() {
      this.gender = 'male';
    }
    female() {
      this.gender = 'female';
    }
    other() {
      this.gender = 'other';
    }
    toggleDisplay() {
      this.toggle.update((toggle) => !toggle);
    }
  };
  return (AppComponent = _classThis);
})();
export {AppComponent};
//# sourceMappingURL=app.component.js.map
