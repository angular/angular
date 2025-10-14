import {__esDecorate, __runInitializers} from 'tslib';
import {Directive, effect, input} from '@angular/core';
let TrigonometryDirective = (() => {
  let _classDecorators = [
    Directive({
      selector: '[appTrigonometry]',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var TrigonometryDirective = class {
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
      TrigonometryDirective = _classThis = _classDescriptor.value;
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
    context = new TrigonometryContext();
    angleInDegrees = input.required({alias: 'appTrigonometry'});
    constructor(viewContainerRef, templateRef) {
      this.viewContainerRef = viewContainerRef;
      this.templateRef = templateRef;
      effect(() => {
        const angleInRadians = toRadians(this.angleInDegrees());
        this.context.sin = Math.sin(angleInRadians);
        this.context.cos = Math.cos(angleInRadians);
        this.context.tan = Math.tan(angleInRadians);
        if (!this.isViewCreated) {
          this.viewContainerRef.createEmbeddedView(this.templateRef, this.context);
          this.isViewCreated = true;
        }
      });
    }
    // Make sure the template checker knows the type of the context with which the
    // template of this directive will be rendered
    static ngTemplateContextGuard(directive, context) {
      return true;
    }
  };
  return (TrigonometryDirective = _classThis);
})();
export {TrigonometryDirective};
class TrigonometryContext {
  sin = 0;
  cos = 0;
  tan = 0;
}
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}
//# sourceMappingURL=trigonometry.directive.js.map
