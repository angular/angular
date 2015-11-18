'use strict';var async_1 = require('angular2/src/facade/async');
var Rectangle = (function () {
    function Rectangle(left, top, width, height) {
        this.left = left;
        this.right = left + width;
        this.top = top;
        this.bottom = top + height;
        this.height = height;
        this.width = width;
    }
    return Rectangle;
})();
exports.Rectangle = Rectangle;
var Ruler = (function () {
    function Ruler(domAdapter) {
        this.domAdapter = domAdapter;
    }
    Ruler.prototype.measure = function (el) {
        var clntRect = this.domAdapter.getBoundingClientRect(el.nativeElement);
        // even if getBoundingClientRect is synchronous we use async API in preparation for further
        // changes
        return async_1.PromiseWrapper.resolve(new Rectangle(clntRect.left, clntRect.top, clntRect.width, clntRect.height));
    };
    return Ruler;
})();
exports.Ruler = Ruler;
//# sourceMappingURL=ruler.js.map