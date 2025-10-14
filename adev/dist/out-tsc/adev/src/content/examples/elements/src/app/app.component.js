import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
import {createCustomElement} from '@angular/elements';
import {PopupComponent} from './popup.component';
import {PopupService} from './popup.service';
let AppComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-root',
      template: `
    <input #input value="Message" />
    <button type="button" (click)="popup.showAsComponent(input.value)">Show as component</button>
    <button type="button" (click)="popup.showAsElement(input.value)">Show as element</button>
  `,
      providers: [PopupService],
      imports: [PopupComponent],
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
    popup;
    constructor(injector, popup) {
      this.popup = popup;
      // Convert `PopupComponent` to a custom element.
      const PopupElement = createCustomElement(PopupComponent, {injector});
      // Register the custom element with the browser.
      customElements.define('popup-element', PopupElement);
    }
  };
  return (AppComponent = _classThis);
})();
export {AppComponent};
//# sourceMappingURL=app.component.js.map
