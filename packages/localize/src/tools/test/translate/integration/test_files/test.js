var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
define("test", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function foo() {
        var name = 'World';
        var message = $localize(templateObject_1 || (templateObject_1 = __makeTemplateObject(["Hello, ", "!"], ["Hello, ", "!"])), name);
        console.log(message);
    }
    exports.foo = foo;
    var templateObject_1;
});
define("test2", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Bar = /** @class */ (function () {
        function Bar() {
            this.name = 'World';
            this.message = $localize(templateObject_2 || (templateObject_2 = __makeTemplateObject(["Hello, ", "!"], ["Hello, ", "!"])), name);
        }
        return Bar;
    }());
    exports.Bar = Bar;
    var templateObject_2;
});
//# sourceMappingURL=test.js.map