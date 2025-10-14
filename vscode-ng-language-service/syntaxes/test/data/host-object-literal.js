'use strict';
/* clang-format off */
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
exports.TMComponent = void 0;
let TMComponent = (() => {
  let _classDecorators = [
    Component({
      //// Quoted static attributes
      host: {
        'class': 'one two',
        'my-attr': 'my-value',
        'doubleQuotes': 'value',
        'backticksForValue': `my-attr-${value}`,
      },
      //// Unquoted static attributes
      host: {
        class: 'one two',
        myAttr: 'my-value',
        style: `color: red;`,
      },
      //// Attribute bindings
      host: {
        '[attr.one]': '123 + "hello"',
        '[attr.two]': '"something" + counter / 2',
      },
      //// Class bindings
      host: {
        '[class.one]': 'value',
        '[class.two]': 'foo || bar',
      },
      //// Property bindings
      host: {
        '[one]': 'value',
        '[two]': 'foo || bar',
        '[@three]': 'animation',
      },
      //// Event listeners
      host: {
        '(click)': 'handleClick(123, $event)',
        '(window:keydown)': 'globalKey()',
        '(document:keydown)': 'globalKey()',
        '(@animation.start)': 'handleStart()',
        '(@animation.end)': 'handleEnd()',
      },
      //// Quotes inside the value
      host: {
        '(click)': 'handleClick("hello `${name}`")',
      },
      //// Expression inside object literal
      host: Object.assign(
        Object.assign(Object.assign({}, before), {
          '(click)': 'handleClick("hello `${name}`")',
          'class': 'hello',
        }),
        after,
      ),
      //// Variable initializer
      host: HOST_BINDINGS,
      //// Variable values
      host: {
        '(click)': CLICK_LISTENER + OTHER_STUFF,
        'class': MY_CLASS + ' ' + MY_OTHER_CLASS + ` foo-${bar + 123}`,
      },
      //// One of each
      host: Object.assign(
        Object.assign(
          {'class': 'one two', myAttr: 'my-value', '[attr.greeting]': '"hello " + name'},
          extras,
        ),
        {'[class.is-visible]': 'isVisible()', '[id]': '_id', '(click)': 'handleClick($event)'},
      ),
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var TMComponent = (_classThis = class {});
  __setFunctionName(_classThis, 'TMComponent');
  (() => {
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
    TMComponent = _classThis = _classDescriptor.value;
    if (_metadata)
      Object.defineProperty(_classThis, Symbol.metadata, {
        enumerable: true,
        configurable: true,
        writable: true,
        value: _metadata,
      });
    __runInitializers(_classThis, _classExtraInitializers);
  })();
  return (TMComponent = _classThis);
})();
exports.TMComponent = TMComponent;
//# sourceMappingURL=host-object-literal.js.map
