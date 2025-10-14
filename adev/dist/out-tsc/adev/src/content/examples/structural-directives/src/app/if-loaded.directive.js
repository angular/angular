import {__esDecorate, __runInitializers} from 'tslib';
import {Directive, effect, input} from '@angular/core';
let IfLoadedDirective = (() => {
  let _classDecorators = [
    Directive({
      selector: '[appIfLoaded]',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var IfLoadedDirective = class {
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
      IfLoadedDirective = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    viewContainerRef;
    templateRef;
    isViewCreated = false;
    state = input.required({alias: 'appIfLoaded'});
    constructor(viewContainerRef, templateRef) {
      this.viewContainerRef = viewContainerRef;
      this.templateRef = templateRef;
      effect(() => {
        if (!this.isViewCreated && this.state().type === 'loaded') {
          this.viewContainerRef.createEmbeddedView(this.templateRef);
          this.isViewCreated = true;
        } else if (this.isViewCreated && this.state().type !== 'loaded') {
          this.viewContainerRef.clear();
          this.isViewCreated = false;
        }
      });
    }
    static ngTemplateGuard_appIfLoaded(dir, state) {
      return true;
    }
  };
  return (IfLoadedDirective = _classThis);
})();
export {IfLoadedDirective};
//# sourceMappingURL=if-loaded.directive.js.map
