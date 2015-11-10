var di_1 = require('angular2/src/core/di');
var exceptions_1 = require('angular2/src/facade/exceptions');
var dom_adapter_1 = require('angular2/src/core/dom/dom_adapter');
exports.EXCEPTION_PROVIDER = di_1.provide(exceptions_1.ExceptionHandler, { useFactory: function () { return new exceptions_1.ExceptionHandler(dom_adapter_1.DOM, false); }, deps: [] });
exports.EXCEPTION_BINDING = exports.EXCEPTION_PROVIDER;
//# sourceMappingURL=platform_bindings.js.map