var testing_internal_1 = require('angular2/testing_internal');
function main() {
    testing_internal_1.describe('Shim', function () {
        testing_internal_1.it('should provide correct function.name ', function () {
            var functionWithoutName = function (_) { };
            function foo(_) { }
            ;
            testing_internal_1.expect(functionWithoutName.name).toEqual('');
            testing_internal_1.expect(foo.name).toEqual('foo');
        });
    });
}
exports.main = main;
//# sourceMappingURL=shim_spec.js.map