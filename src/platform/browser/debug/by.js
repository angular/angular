var lang_1 = require('angular2/src/facade/lang');
var dom_adapter_1 = require('angular2/src/core/dom/dom_adapter');
var By = (function () {
    function By() {
    }
    By.all = function () { return function (debugElement) { return true; }; };
    By.css = function (selector) {
        return function (debugElement) {
            return lang_1.isPresent(debugElement.nativeElement) ?
                dom_adapter_1.DOM.elementMatches(debugElement.nativeElement, selector) :
                false;
        };
    };
    By.directive = function (type) {
        return function (debugElement) { return debugElement.hasDirective(type); };
    };
    return By;
})();
exports.By = By;
//# sourceMappingURL=by.js.map