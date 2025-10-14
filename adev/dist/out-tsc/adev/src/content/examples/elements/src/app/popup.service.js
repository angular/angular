import {__esDecorate, __runInitializers} from 'tslib';
import {createComponent, Injectable} from '@angular/core';
import {PopupComponent} from './popup.component';
let PopupService = (() => {
  let _classDecorators = [Injectable()];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var PopupService = class {
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
      PopupService = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    injector;
    applicationRef;
    constructor(injector, applicationRef) {
      this.injector = injector;
      this.applicationRef = applicationRef;
    }
    // Previous dynamic-loading method required you to set up infrastructure
    // before adding the popup to the DOM.
    showAsComponent(message) {
      // Create element
      const popup = document.createElement('popup-component');
      // Create the component and wire it up with the element
      const popupComponentRef = createComponent(PopupComponent, {
        environmentInjector: this.injector,
        hostElement: popup,
      });
      // Attach to the view so that the change detector knows to run
      this.applicationRef.attachView(popupComponentRef.hostView);
      // Listen to the close event
      popupComponentRef.instance.closed.subscribe(() => {
        document.body.removeChild(popup);
        this.applicationRef.detachView(popupComponentRef.hostView);
      });
      // Set the message
      popupComponentRef.instance.message = message;
      // Add to the DOM
      document.body.appendChild(popup);
    }
    // This uses the new custom-element method to add the popup to the DOM.
    showAsElement(message) {
      // Create element
      const popupEl = document.createElement('popup-element');
      // Listen to the close event
      popupEl.addEventListener('closed', () => document.body.removeChild(popupEl));
      // Set the message
      popupEl.message = message;
      // Add to the DOM
      document.body.appendChild(popupEl);
    }
  };
  return (PopupService = _classThis);
})();
export {PopupService};
//# sourceMappingURL=popup.service.js.map
