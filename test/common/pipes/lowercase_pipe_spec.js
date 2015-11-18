var testing_internal_1 = require('angular2/testing_internal');
var core_1 = require('angular2/core');
function main() {
    testing_internal_1.describe("LowerCasePipe", function () {
        var upper;
        var lower;
        var pipe;
        testing_internal_1.beforeEach(function () {
            lower = 'something';
            upper = 'SOMETHING';
            pipe = new core_1.LowerCasePipe();
        });
        testing_internal_1.describe("transform", function () {
            testing_internal_1.it("should return lowercase", function () {
                var val = pipe.transform(upper);
                testing_internal_1.expect(val).toEqual(lower);
            });
            testing_internal_1.it("should lowercase when there is a new value", function () {
                var val = pipe.transform(upper);
                testing_internal_1.expect(val).toEqual(lower);
                var val2 = pipe.transform('WAT');
                testing_internal_1.expect(val2).toEqual('wat');
            });
            testing_internal_1.it("should not support other objects", function () { testing_internal_1.expect(function () { return pipe.transform(new Object()); }).toThrowError(); });
        });
    });
}
exports.main = main;
//# sourceMappingURL=lowercase_pipe_spec.js.map