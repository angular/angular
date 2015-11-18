'use strict';var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var ElementBinder = (function () {
    function ElementBinder(index, parent, distanceToParent, protoElementInjector, componentDirective, nestedProtoView) {
        this.index = index;
        this.parent = parent;
        this.distanceToParent = distanceToParent;
        this.protoElementInjector = protoElementInjector;
        this.componentDirective = componentDirective;
        this.nestedProtoView = nestedProtoView;
        if (lang_1.isBlank(index)) {
            throw new exceptions_1.BaseException('null index not allowed.');
        }
    }
    return ElementBinder;
})();
exports.ElementBinder = ElementBinder;
//# sourceMappingURL=element_binder.js.map