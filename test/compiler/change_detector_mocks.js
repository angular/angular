var lang_1 = require('angular2/src/facade/lang');
var TestDirective = (function () {
    function TestDirective() {
        this.eventLog = [];
    }
    TestDirective.prototype.onEvent = function (value) { this.eventLog.push(value); };
    return TestDirective;
})();
exports.TestDirective = TestDirective;
var TestDispatcher = (function () {
    function TestDispatcher(directives, detectors) {
        this.directives = directives;
        this.detectors = detectors;
        this.clear();
    }
    TestDispatcher.prototype.getDirectiveFor = function (di) { return this.directives[di.directiveIndex]; };
    TestDispatcher.prototype.getDetectorFor = function (di) { return this.detectors[di.directiveIndex]; };
    TestDispatcher.prototype.clear = function () { this.log = []; };
    TestDispatcher.prototype.notifyOnBinding = function (target, value) {
        this.log.push(target.mode + "(" + target.name + ")=" + this._asString(value));
    };
    TestDispatcher.prototype.logBindingUpdate = function (target, value) { };
    TestDispatcher.prototype.notifyAfterContentChecked = function () { };
    TestDispatcher.prototype.notifyAfterViewChecked = function () { };
    TestDispatcher.prototype.getDebugContext = function (a, b) { return null; };
    TestDispatcher.prototype._asString = function (value) { return (lang_1.isBlank(value) ? 'null' : value.toString()); };
    return TestDispatcher;
})();
exports.TestDispatcher = TestDispatcher;
var TestPipes = (function () {
    function TestPipes() {
    }
    TestPipes.prototype.get = function (type) { return null; };
    return TestPipes;
})();
exports.TestPipes = TestPipes;
//# sourceMappingURL=change_detector_mocks.js.map