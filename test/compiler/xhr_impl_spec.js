var testing_internal_1 = require('angular2/testing_internal');
var xhr_impl_1 = require('angular2/src/compiler/xhr_impl');
var async_1 = require('angular2/src/facade/async');
function main() {
    testing_internal_1.describe('XHRImpl', function () {
        var xhr;
        var url200 = '/base/modules/angular2/test/core/services/static_assets/200.html';
        var url404 = '/base/modules/angular2/test/core/services/static_assets/404.html';
        testing_internal_1.beforeEach(function () { xhr = new xhr_impl_1.XHRImpl(); });
        testing_internal_1.it('should resolve the Promise with the file content on success', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            xhr.get(url200).then(function (text) {
                testing_internal_1.expect(text.trim()).toEqual('<p>hey</p>');
                async.done();
            });
        }), 10000);
        testing_internal_1.it('should reject the Promise on failure', testing_internal_1.inject([testing_internal_1.AsyncTestCompleter], function (async) {
            async_1.PromiseWrapper.catchError(xhr.get(url404), function (e) {
                testing_internal_1.expect(e).toEqual("Failed to load " + url404);
                async.done();
                return null;
            });
        }), 10000);
    });
}
exports.main = main;
//# sourceMappingURL=xhr_impl_spec.js.map