var testing_internal_1 = require('angular2/testing_internal');
var core_1 = require('angular2/core');
function main() {
    testing_internal_1.describe('provider', function () {
        testing_internal_1.describe('type errors', function () {
            testing_internal_1.it('should throw when trying to create a class provider and not passing a class', function () {
                testing_internal_1.expect(function () { core_1.bind('foo').toClass(0); })
                    .toThrowError('Trying to create a class provider but "0" is not a class!');
            });
            testing_internal_1.it('should throw when trying to create a factory provider and not passing a function', function () {
                testing_internal_1.expect(function () { core_1.bind('foo').toFactory(0); })
                    .toThrowError('Trying to create a factory provider but "0" is not a function!');
            });
        });
    });
}
exports.main = main;
//# sourceMappingURL=binding_spec.js.map