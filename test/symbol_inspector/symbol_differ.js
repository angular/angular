var lang_1 = require('angular2/src/facade/lang');
var IS_FIELD = lang_1.RegExpWrapper.create('^\\w+[\\.|\\#]\\w+=?$');
var IS_INTERFACE = lang_1.RegExpWrapper.create('^\\{.+\\}');
var IS_DART = lang_1.RegExpWrapper.create('\\:dart$');
var IS_JS = lang_1.RegExpWrapper.create('\\:js$');
var IS_OPTIONAL = lang_1.RegExpWrapper.create('\\:optional$');
var JS = 'JS';
var DART = 'Dart';
var MODE = lang_1.isJsObject({}) ? JS : DART;
var SymbolsDiff = (function () {
    function SymbolsDiff(actual, expected) {
        this.actual = actual;
        this.expected = expected;
        this.missing = [];
        this.extra = [];
        this.errors = [];
        this.actual.sort(compareIgnoreLang);
        this.expected.sort(compareIgnoreLang);
        this.computeDiff();
    }
    SymbolsDiff.prototype.computeDiff = function () {
        for (var i = 0, j = 0, length = this.expected.length + this.actual.length; i + j < length;) {
            var expectedName = i < this.expected.length ? this.expected[i] : '~';
            var actualName = j < this.actual.length ? this.actual[j] : '~';
            if (stripLang(expectedName) == stripLang(actualName)) {
                i++;
                j++;
            }
            else if (lang_1.StringWrapper.compare(stripLang(expectedName), stripLang(actualName)) > 0) {
                // JS does not see fields so ignore none method symbols
                if (!this.shouldIgnore(expectedName)) {
                    this.extra.push(actualName);
                    this.errors.push('+ ' + actualName);
                }
                j++;
            }
            else {
                if (!this.shouldIgnore(expectedName)) {
                    this.missing.push(expectedName);
                    this.errors.push('- ' + expectedName);
                }
                i++;
            }
        }
    };
    SymbolsDiff.prototype.shouldIgnore = function (expected) {
        var ignore = false;
        if (MODE == JS) {
            ignore = lang_1.RegExpWrapper.test(IS_FIELD, expected) ||
                lang_1.RegExpWrapper.test(IS_INTERFACE, expected) ||
                lang_1.RegExpWrapper.test(IS_DART, expected) || lang_1.RegExpWrapper.test(IS_OPTIONAL, expected);
        }
        else {
            ignore = lang_1.RegExpWrapper.test(IS_JS, expected) || lang_1.RegExpWrapper.test(IS_OPTIONAL, expected);
        }
        return ignore;
    };
    return SymbolsDiff;
})();
exports.SymbolsDiff = SymbolsDiff;
function stripLang(text) {
    var index = text.indexOf(':');
    if (index >= 0)
        text = text.substring(0, index);
    return text;
}
function compareIgnoreLang(a, b) {
    return lang_1.StringWrapper.compare(stripLang(a), stripLang(b));
}
//# sourceMappingURL=symbol_differ.js.map