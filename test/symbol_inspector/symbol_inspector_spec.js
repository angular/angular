var testing_internal_1 = require('angular2/testing_internal');
var symbol_inspector_1 = require('./symbol_inspector');
var symbol_differ_1 = require('./symbol_differ');
function main() {
    testing_internal_1.describe('symbol inspector', function () {
        testing_internal_1.it('should extract symbols', function () {
            var symbols = symbol_inspector_1.getSymbolsFromLibrary("simple_library");
            testing_internal_1.expect(new symbol_differ_1.SymbolsDiff(symbols, [
                'A',
                'A#staticField',
                'A#staticField=',
                'A#staticMethod()',
                'A.field',
                'A.field=',
                'A.getter',
                'A.method()',
                'A.methodWithFunc()',
                'ClosureParam',
                'ClosureReturn',
                'ConsParamType',
                'FieldType',
                'Generic',
                'Generic.getter',
                'GetterType',
                'MethodReturnType',
                'ParamType',
                'StaticFieldType',
                'TypedefParam',
                'TypedefReturnType',
                'SomeInterface:dart',
            ])
                .errors)
                .toEqual([]);
        });
        testing_internal_1.describe('assert', function () {
            testing_internal_1.it('should assert symbol names are correct', function () {
                var diffs = new symbol_differ_1.SymbolsDiff(['a()', 'c()', 'd()'], ['a()', 'b()', 'd()']);
                testing_internal_1.expect(diffs.errors).toEqual(['- b()', '+ c()']);
            });
        });
    });
}
exports.main = main;
//# sourceMappingURL=symbol_inspector_spec.js.map