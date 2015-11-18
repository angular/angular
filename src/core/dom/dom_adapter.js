var lang_1 = require('angular2/src/facade/lang');
exports.DOM = null;
function setRootDomAdapter(adapter) {
    if (lang_1.isBlank(exports.DOM)) {
        exports.DOM = adapter;
    }
}
exports.setRootDomAdapter = setRootDomAdapter;
/* tslint:disable:requireParameterType */
/**
 * Provides DOM operations in an environment-agnostic way.
 */
var DomAdapter = (function () {
    function DomAdapter() {
    }
    return DomAdapter;
})();
exports.DomAdapter = DomAdapter;
//# sourceMappingURL=dom_adapter.js.map