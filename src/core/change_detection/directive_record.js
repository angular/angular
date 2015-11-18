'use strict';var lang_1 = require('angular2/src/facade/lang');
var constants_1 = require('./constants');
var DirectiveIndex = (function () {
    function DirectiveIndex(elementIndex, directiveIndex) {
        this.elementIndex = elementIndex;
        this.directiveIndex = directiveIndex;
    }
    Object.defineProperty(DirectiveIndex.prototype, "name", {
        get: function () { return this.elementIndex + "_" + this.directiveIndex; },
        enumerable: true,
        configurable: true
    });
    return DirectiveIndex;
})();
exports.DirectiveIndex = DirectiveIndex;
var DirectiveRecord = (function () {
    function DirectiveRecord(_a) {
        var _b = _a === void 0 ? {} : _a, directiveIndex = _b.directiveIndex, callAfterContentInit = _b.callAfterContentInit, callAfterContentChecked = _b.callAfterContentChecked, callAfterViewInit = _b.callAfterViewInit, callAfterViewChecked = _b.callAfterViewChecked, callOnChanges = _b.callOnChanges, callDoCheck = _b.callDoCheck, callOnInit = _b.callOnInit, changeDetection = _b.changeDetection;
        this.directiveIndex = directiveIndex;
        this.callAfterContentInit = lang_1.normalizeBool(callAfterContentInit);
        this.callAfterContentChecked = lang_1.normalizeBool(callAfterContentChecked);
        this.callOnChanges = lang_1.normalizeBool(callOnChanges);
        this.callAfterViewInit = lang_1.normalizeBool(callAfterViewInit);
        this.callAfterViewChecked = lang_1.normalizeBool(callAfterViewChecked);
        this.callDoCheck = lang_1.normalizeBool(callDoCheck);
        this.callOnInit = lang_1.normalizeBool(callOnInit);
        this.changeDetection = changeDetection;
    }
    DirectiveRecord.prototype.isDefaultChangeDetection = function () {
        return constants_1.isDefaultChangeDetectionStrategy(this.changeDetection);
    };
    return DirectiveRecord;
})();
exports.DirectiveRecord = DirectiveRecord;
//# sourceMappingURL=directive_record.js.map