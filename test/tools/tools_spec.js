var testing_internal_1 = require('angular2/testing_internal');
var tools_1 = require('angular2/tools');
var spies_1 = require('./spies');
function main() {
    testing_internal_1.describe('profiler', function () {
        testing_internal_1.beforeEach(function () { tools_1.enableDebugTools((new spies_1.SpyComponentRef())); });
        testing_internal_1.afterEach(function () { tools_1.disableDebugTools(); });
        testing_internal_1.it('should time change detection', function () { spies_1.callNgProfilerTimeChangeDetection(); });
        testing_internal_1.it('should time change detection with recording', function () { spies_1.callNgProfilerTimeChangeDetection({ 'record': true }); });
    });
}
exports.main = main;
//# sourceMappingURL=tools_spec.js.map