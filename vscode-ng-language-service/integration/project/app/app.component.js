'use strict';
var __esDecorate =
  (this && this.__esDecorate) ||
  function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) {
      if (f !== void 0 && typeof f !== 'function') throw new TypeError('Function expected');
      return f;
    }
    var kind = contextIn.kind,
      key = kind === 'getter' ? 'get' : kind === 'setter' ? 'set' : 'value';
    var target = !descriptorIn && ctor ? (contextIn['static'] ? ctor : ctor.prototype) : null;
    var descriptor =
      descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _,
      done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
      var context = {};
      for (var p in contextIn) context[p] = p === 'access' ? {} : contextIn[p];
      for (var p in contextIn.access) context.access[p] = contextIn.access[p];
      context.addInitializer = function (f) {
        if (done) throw new TypeError('Cannot add initializers after decoration has completed');
        extraInitializers.push(accept(f || null));
      };
      var result = (0, decorators[i])(
        kind === 'accessor' ? {get: descriptor.get, set: descriptor.set} : descriptor[key],
        context,
      );
      if (kind === 'accessor') {
        if (result === void 0) continue;
        if (result === null || typeof result !== 'object') throw new TypeError('Object expected');
        if ((_ = accept(result.get))) descriptor.get = _;
        if ((_ = accept(result.set))) descriptor.set = _;
        if ((_ = accept(result.init))) initializers.unshift(_);
      } else if ((_ = accept(result))) {
        if (kind === 'field') initializers.unshift(_);
        else descriptor[key] = _;
      }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
  };
var __runInitializers =
  (this && this.__runInitializers) ||
  function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
      value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
  };
var __setFunctionName =
  (this && this.__setFunctionName) ||
  function (f, name, prefix) {
    if (typeof name === 'symbol') name = name.description ? '['.concat(name.description, ']') : '';
    return Object.defineProperty(f, 'name', {
      configurable: true,
      value: prefix ? ''.concat(prefix, ' ', name) : name,
    });
  };
Object.defineProperty(exports, '__esModule', {value: true});
exports.AppComponent = void 0;
const core_1 = require('@angular/core');
let AppComponent = (() => {
  let _classDecorators = [
    (0, core_1.Component)({
      selector: 'my-app',
      template: `<h1>Hello {{name}}</h1>`,
      standalone: false,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _appInput_decorators;
  let _appInput_initializers = [];
  let _appInput_extraInitializers = [];
  let _appOutput_decorators;
  let _appOutput_initializers = [];
  let _appOutput_extraInitializers = [];
  var AppComponent = (_classThis = class {
    constructor() {
      this.name = 'Angular';
      this.appInput = __runInitializers(this, _appInput_initializers, '');
      this.appOutput =
        (__runInitializers(this, _appInput_extraInitializers),
        __runInitializers(this, _appOutput_initializers, new core_1.EventEmitter()));
      __runInitializers(this, _appOutput_extraInitializers);
    }
  });
  __setFunctionName(_classThis, 'AppComponent');
  (() => {
    const _metadata =
      typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
    _appInput_decorators = [(0, core_1.Input)()];
    _appOutput_decorators = [(0, core_1.Output)()];
    __esDecorate(
      null,
      null,
      _appInput_decorators,
      {
        kind: 'field',
        name: 'appInput',
        static: false,
        private: false,
        access: {
          has: (obj) => 'appInput' in obj,
          get: (obj) => obj.appInput,
          set: (obj, value) => {
            obj.appInput = value;
          },
        },
        metadata: _metadata,
      },
      _appInput_initializers,
      _appInput_extraInitializers,
    );
    __esDecorate(
      null,
      null,
      _appOutput_decorators,
      {
        kind: 'field',
        name: 'appOutput',
        static: false,
        private: false,
        access: {
          has: (obj) => 'appOutput' in obj,
          get: (obj) => obj.appOutput,
          set: (obj, value) => {
            obj.appOutput = value;
          },
        },
        metadata: _metadata,
      },
      _appOutput_initializers,
      _appOutput_extraInitializers,
    );
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
  })();
  return (AppComponent = _classThis);
})();
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map
