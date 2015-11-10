var testing_internal_1 = require('angular2/testing_internal');
var core_1 = require('angular2/core');
var lang_1 = require('angular2/src/facade/lang');
var pipe_resolver_1 = require('angular2/src/core/linker/pipe_resolver');
function main() {
    testing_internal_1.describe("DatePipe", function () {
        var date;
        var pipe;
        testing_internal_1.beforeEach(function () {
            date = lang_1.DateWrapper.create(2015, 6, 15, 21, 43, 11);
            pipe = new core_1.DatePipe();
        });
        testing_internal_1.it('should be marked as pure', function () { testing_internal_1.expect(new pipe_resolver_1.PipeResolver().resolve(core_1.DatePipe).pure).toEqual(true); });
        testing_internal_1.describe("supports", function () {
            testing_internal_1.it("should support date", function () { testing_internal_1.expect(pipe.supports(date)).toBe(true); });
            testing_internal_1.it("should support int", function () { testing_internal_1.expect(pipe.supports(123456789)).toBe(true); });
            testing_internal_1.it("should not support other objects", function () {
                testing_internal_1.expect(pipe.supports(new Object())).toBe(false);
                testing_internal_1.expect(pipe.supports(null)).toBe(false);
            });
        });
        // TODO(mlaval): enable tests when Intl API is no longer used, see
        // https://github.com/angular/angular/issues/3333
        if (testing_internal_1.browserDetection.supportsIntlApi) {
            testing_internal_1.describe("transform", function () {
                testing_internal_1.it('should format each component correctly', function () {
                    testing_internal_1.expect(pipe.transform(date, ['y'])).toEqual('2015');
                    testing_internal_1.expect(pipe.transform(date, ['yy'])).toEqual('15');
                    testing_internal_1.expect(pipe.transform(date, ['M'])).toEqual('6');
                    testing_internal_1.expect(pipe.transform(date, ['MM'])).toEqual('06');
                    testing_internal_1.expect(pipe.transform(date, ['MMM'])).toEqual('Jun');
                    testing_internal_1.expect(pipe.transform(date, ['MMMM'])).toEqual('June');
                    testing_internal_1.expect(pipe.transform(date, ['d'])).toEqual('15');
                    testing_internal_1.expect(pipe.transform(date, ['E'])).toEqual('Mon');
                    testing_internal_1.expect(pipe.transform(date, ['EEEE'])).toEqual('Monday');
                    testing_internal_1.expect(pipe.transform(date, ['H'])).toEqual('21');
                    testing_internal_1.expect(pipe.transform(date, ['j'])).toEqual('9 PM');
                    testing_internal_1.expect(pipe.transform(date, ['m'])).toEqual('43');
                    testing_internal_1.expect(pipe.transform(date, ['s'])).toEqual('11');
                });
                testing_internal_1.it('should format common multi component patterns', function () {
                    testing_internal_1.expect(pipe.transform(date, ['yMEd'])).toEqual('Mon, 6/15/2015');
                    testing_internal_1.expect(pipe.transform(date, ['MEd'])).toEqual('Mon, 6/15');
                    testing_internal_1.expect(pipe.transform(date, ['MMMd'])).toEqual('Jun 15');
                    testing_internal_1.expect(pipe.transform(date, ['yMMMMEEEEd'])).toEqual('Monday, June 15, 2015');
                    testing_internal_1.expect(pipe.transform(date, ['jms'])).toEqual('9:43:11 PM');
                    testing_internal_1.expect(pipe.transform(date, ['ms'])).toEqual('43:11');
                });
                testing_internal_1.it('should format with pattern aliases', function () {
                    testing_internal_1.expect(pipe.transform(date, ['medium'])).toEqual('Jun 15, 2015, 9:43:11 PM');
                    testing_internal_1.expect(pipe.transform(date, ['short'])).toEqual('6/15/2015, 9:43 PM');
                    testing_internal_1.expect(pipe.transform(date, ['fullDate'])).toEqual('Monday, June 15, 2015');
                    testing_internal_1.expect(pipe.transform(date, ['longDate'])).toEqual('June 15, 2015');
                    testing_internal_1.expect(pipe.transform(date, ['mediumDate'])).toEqual('Jun 15, 2015');
                    testing_internal_1.expect(pipe.transform(date, ['shortDate'])).toEqual('6/15/2015');
                    testing_internal_1.expect(pipe.transform(date, ['mediumTime'])).toEqual('9:43:11 PM');
                    testing_internal_1.expect(pipe.transform(date, ['shortTime'])).toEqual('9:43 PM');
                });
            });
        }
    });
}
exports.main = main;
//# sourceMappingURL=date_pipe_spec.js.map