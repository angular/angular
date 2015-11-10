var testability_1 = require('angular2/src/core/testability/testability');
var lang_1 = require('angular2/src/facade/lang');
var PublicTestability = (function () {
    function PublicTestability(testability) {
        this._testability = testability;
    }
    PublicTestability.prototype.isStable = function () { return this._testability.isStable(); };
    PublicTestability.prototype.whenStable = function (callback) { this._testability.whenStable(callback); };
    PublicTestability.prototype.findBindings = function (using, provider, exactMatch) {
        return this.findProviders(using, provider, exactMatch);
    };
    PublicTestability.prototype.findProviders = function (using, provider, exactMatch) {
        return this._testability.findBindings(using, provider, exactMatch);
    };
    return PublicTestability;
})();
var BrowserGetTestability = (function () {
    function BrowserGetTestability() {
    }
    BrowserGetTestability.init = function () { testability_1.setTestabilityGetter(new BrowserGetTestability()); };
    BrowserGetTestability.prototype.addToWindow = function (registry) {
        lang_1.global.getAngularTestability = function (elem, findInAncestors) {
            if (findInAncestors === void 0) { findInAncestors = true; }
            var testability = registry.findTestabilityInTree(elem, findInAncestors);
            if (testability == null) {
                throw new Error('Could not find testability for element.');
            }
            return new PublicTestability(testability);
        };
        lang_1.global.getAllAngularTestabilities = function () {
            var testabilities = registry.getAllTestabilities();
            return testabilities.map(function (testability) { return new PublicTestability(testability); });
        };
    };
    return BrowserGetTestability;
})();
exports.BrowserGetTestability = BrowserGetTestability;
//# sourceMappingURL=browser_testability.js.map