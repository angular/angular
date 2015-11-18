var lang_1 = require('angular2/src/facade/lang');
var TestIterable = (function () {
    function TestIterable() {
        this.list = [];
    }
    TestIterable.prototype[lang_1.getSymbolIterator()] = function () { return this.list[lang_1.getSymbolIterator()](); };
    return TestIterable;
})();
exports.TestIterable = TestIterable;
//# sourceMappingURL=iterable.js.map