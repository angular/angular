import {StringWrapper, RegExpWrapper, isJsObject} from 'angular2/src/core/facade/lang';

var IS_FIELD = RegExpWrapper.create('^\\w+[\\.|\\#]\\w+=?$');
var IS_INTERFACE = RegExpWrapper.create('^\\{\\w+\\}');
var IS_DART = RegExpWrapper.create('\\:dart$');
var IS_JS = RegExpWrapper.create('\\:js$');
var IS_OPTIONAL = RegExpWrapper.create('\\:optional$');
var JS = 'JS';
var DART = 'Dart';
var MODE = isJsObject({}) ? JS : DART;

export class SymbolsDiff {
  missing: string[] = [];
  extra: string[] = [];
  errors: string[] = [];

  constructor(public actual: string[], public expected: string[]) {
    this.actual.sort(compareIgnoreLang);
    this.expected.sort(compareIgnoreLang);
    this.computeDiff();
  }

  computeDiff(): void {
    for (var i = 0, j = 0, length = this.expected.length + this.actual.length; i + j < length;) {
      var expectedName: string = i < this.expected.length ? this.expected[i] : '~';
      var actualName: string = j < this.actual.length ? this.actual[j] : '~';
      if (stripLang(expectedName) == stripLang(actualName)) {
        i++;
        j++;
      } else if (StringWrapper.compare(stripLang(expectedName), stripLang(actualName)) > 0) {
        // JS does not see fields so ignore none method symbols
        if (!this.shouldIgnore(expectedName)) {
          this.extra.push(actualName);
          this.errors.push('+ ' + actualName);
        }
        j++;
      } else {
        if (!this.shouldIgnore(expectedName)) {
          this.missing.push(expectedName);
          this.errors.push('- ' + expectedName);
        }
        i++;
      }
    }
  }

  shouldIgnore(expected: string): boolean {
    var ignore = false;
    if (MODE == JS) {
      ignore = RegExpWrapper.test(IS_FIELD, expected) ||
               RegExpWrapper.test(IS_INTERFACE, expected) ||
               RegExpWrapper.test(IS_DART, expected) || RegExpWrapper.test(IS_OPTIONAL, expected)
    } else {
      ignore = RegExpWrapper.test(IS_JS, expected) || RegExpWrapper.test(IS_OPTIONAL, expected)
    }
    return ignore;
  }
}

function stripLang(text: string): string {
  var index = text.indexOf(':');
  if (index >= 0) text = text.substring(0, index);
  return text;
}

function compareIgnoreLang(a: string, b: string): number {
  return StringWrapper.compare(stripLang(a), stripLang(b));
}
