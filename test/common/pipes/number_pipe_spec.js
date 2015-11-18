var testing_internal_1 = require('angular2/testing_internal');
var core_1 = require('angular2/core');
function main() {
    // TODO(mlaval): enable tests when Intl API is no longer used, see
    // https://github.com/angular/angular/issues/3333
    if (testing_internal_1.browserDetection.supportsIntlApi) {
        testing_internal_1.describe("DecimalPipe", function () {
            var pipe;
            testing_internal_1.beforeEach(function () { pipe = new core_1.DecimalPipe(); });
            testing_internal_1.describe("transform", function () {
                testing_internal_1.it('should return correct value for numbers', function () {
                    testing_internal_1.expect(pipe.transform(12345, [])).toEqual('12,345');
                    testing_internal_1.expect(pipe.transform(123, ['.2'])).toEqual('123.00');
                    testing_internal_1.expect(pipe.transform(1, ['3.'])).toEqual('001');
                    testing_internal_1.expect(pipe.transform(1.1, ['3.4-5'])).toEqual('001.1000');
                    testing_internal_1.expect(pipe.transform(1.123456, ['3.4-5'])).toEqual('001.12346');
                    testing_internal_1.expect(pipe.transform(1.1234, [])).toEqual('1.123');
                });
                testing_internal_1.it("should not support other objects", function () { testing_internal_1.expect(function () { return pipe.transform(new Object(), []); }).toThrowError(); });
            });
        });
        testing_internal_1.describe("PercentPipe", function () {
            var pipe;
            testing_internal_1.beforeEach(function () { pipe = new core_1.PercentPipe(); });
            testing_internal_1.describe("transform", function () {
                testing_internal_1.it('should return correct value for numbers', function () {
                    testing_internal_1.expect(pipe.transform(1.23, [])).toEqual('123%');
                    testing_internal_1.expect(pipe.transform(1.2, ['.2'])).toEqual('120.00%');
                });
                testing_internal_1.it("should not support other objects", function () { testing_internal_1.expect(function () { return pipe.transform(new Object(), []); }).toThrowError(); });
            });
        });
        testing_internal_1.describe("CurrencyPipe", function () {
            var pipe;
            testing_internal_1.beforeEach(function () { pipe = new core_1.CurrencyPipe(); });
            testing_internal_1.describe("transform", function () {
                testing_internal_1.it('should return correct value for numbers', function () {
                    testing_internal_1.expect(pipe.transform(123, [])).toEqual('USD123');
                    testing_internal_1.expect(pipe.transform(12, ['EUR', false, '.2'])).toEqual('EUR12.00');
                });
                testing_internal_1.it("should not support other objects", function () { testing_internal_1.expect(function () { return pipe.transform(new Object(), []); }).toThrowError(); });
            });
        });
    }
}
exports.main = main;
//# sourceMappingURL=number_pipe_spec.js.map