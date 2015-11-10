library angular2.test.symbol_inspector.symbol_differ;

import "package:angular2/src/facade/lang.dart"
    show StringWrapper, RegExpWrapper, isJsObject;

var IS_FIELD = RegExpWrapper.create("^\\w+[\\.|\\#]\\w+=?\$");
var IS_INTERFACE = RegExpWrapper.create("^\\{.+\\}");
var IS_DART = RegExpWrapper.create("\\:dart\$");
var IS_JS = RegExpWrapper.create("\\:js\$");
var IS_OPTIONAL = RegExpWrapper.create("\\:optional\$");
var JS = "JS";
var DART = "Dart";
var MODE = isJsObject({}) ? JS : DART;

class SymbolsDiff {
  List<String> actual;
  List<String> expected;
  List<String> missing = [];
  List<String> extra = [];
  List<String> errors = [];
  SymbolsDiff(this.actual, this.expected) {
    this.actual.sort(compareIgnoreLang);
    this.expected.sort(compareIgnoreLang);
    this.computeDiff();
  }
  void computeDiff() {
    for (var i = 0, j = 0, length = this.expected.length + this.actual.length;
        i + j < length;) {
      String expectedName = i < this.expected.length ? this.expected[i] : "~";
      String actualName = j < this.actual.length ? this.actual[j] : "~";
      if (stripLang(expectedName) == stripLang(actualName)) {
        i++;
        j++;
      } else if (StringWrapper.compare(
              stripLang(expectedName), stripLang(actualName)) >
          0) {
        // JS does not see fields so ignore none method symbols
        if (!this.shouldIgnore(expectedName)) {
          this.extra.add(actualName);
          this.errors.add("+ " + actualName);
        }
        j++;
      } else {
        if (!this.shouldIgnore(expectedName)) {
          this.missing.add(expectedName);
          this.errors.add("- " + expectedName);
        }
        i++;
      }
    }
  }

  bool shouldIgnore(String expected) {
    var ignore = false;
    if (MODE == JS) {
      ignore = RegExpWrapper.test(IS_FIELD, expected) ||
          RegExpWrapper.test(IS_INTERFACE, expected) ||
          RegExpWrapper.test(IS_DART, expected) ||
          RegExpWrapper.test(IS_OPTIONAL, expected);
    } else {
      ignore = RegExpWrapper.test(IS_JS, expected) ||
          RegExpWrapper.test(IS_OPTIONAL, expected);
    }
    return ignore;
  }
}

String stripLang(String text) {
  var index = text.indexOf(":");
  if (index >= 0) text = text.substring(0, index);
  return text;
}

num compareIgnoreLang(String a, String b) {
  return StringWrapper.compare(stripLang(a), stripLang(b));
}
