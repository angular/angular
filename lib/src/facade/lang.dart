library angular.core.facade.lang;

export 'dart:core' show Type, RegExp, print, DateTime;
import 'dart:math' as math;
import 'dart:convert' as convert;
import 'dart:async' show Future;

String getTypeNameForDebugging(Type type) => type.toString();

class Math {
  static final _random = new math.Random();
  static int floor(num n) => n.floor();
  static double random() => _random.nextDouble();
}

class CONST {
  const CONST();
}

const IS_DART = true;

bool isPresent(obj) => obj != null;
bool isBlank(obj) => obj == null;
bool isString(obj) => obj is String;
bool isFunction(obj) => obj is Function;
bool isType(obj) => obj is Type;
bool isStringMap(obj) => obj is Map;
bool isArray(obj) => obj is List;
bool isPromise(obj) => obj is Future;
bool isNumber(obj) => obj is num;
bool isDate(obj) => obj is DateTime;

String stringify(obj) => obj.toString();

int serializeEnum(val) {
  return val.index;
}

/**
 * Deserializes an enum
 * val should be the indexed value of the enum (sa returned from @Link{serializeEnum})
 * values should be a map from indexes to values for the enum that you want to deserialize.
 */
dynamic deserializeEnum(num val, Map<num, dynamic> values) {
  return values[val];
}

class StringWrapper {
  static String fromCharCode(int code) {
    return new String.fromCharCode(code);
  }

  static int charCodeAt(String s, int index) {
    return s.codeUnitAt(index);
  }

  static List<String> split(String s, RegExp regExp) {
    var parts = <String>[];
    var lastEnd = 0;
    regExp.allMatches(s).forEach((match) {
      parts.add(s.substring(lastEnd, match.start));
      lastEnd = match.end;
      for (var i = 0; i < match.groupCount; i++) {
        parts.add(match.group(i + 1));
      }
    });
    parts.add(s.substring(lastEnd));
    return parts;
  }

  static bool equals(String s, String s2) {
    return s == s2;
  }

  static String stripLeft(String s, String charVal) {
    if (isPresent(s) && s.length > 0) {
      var pos = 0;
      for (var i = 0; i < s.length; i++) {
        if (s[i] != charVal) break;
        pos++;
      }
      s = s.substring(pos);
    }
    return s;
  }

  static String stripRight(String s, String charVal) {
    if (isPresent(s) && s.length > 0) {
      var pos = s.length;
      for (var i = s.length - 1; i >= 0; i--) {
        if (s[i] != charVal) break;
        pos--;
      }
      s = s.substring(0, pos);
    }
    return s;
  }

  static String replace(String s, Pattern from, String replace) {
    return s.replaceFirst(from, replace);
  }

  static String replaceAll(String s, RegExp from, String replace) {
    return s.replaceAll(from, replace);
  }

  static String slice(String s, [int start = 0, int end]) {
    start = _startOffset(s, start);
    end = _endOffset(s, end);
    //in JS if start > end an empty string is returned
    if (end != null && start > end) {
      return "";
    }
    return s.substring(start, end);
  }

  static String replaceAllMapped(String s, RegExp from, Function cb) {
    return s.replaceAllMapped(from, cb);
  }

  static bool contains(String s, String substr) {
    return s.contains(substr);
  }

  static int compare(String a, String b) => a.compareTo(b);

  // JS slice function can take start < 0 which indicates a position relative to
  // the end of the string
  static int _startOffset(String s, int start) {
    int len = s.length;
    return start < 0 ? math.max(len + start, 0) : math.min(start, len);
  }

  // JS slice function can take end < 0 which indicates a position relative to
  // the end of the string
  static int _endOffset(String s, int end) {
    int len = s.length;
    if (end == null) return len;
    return end < 0 ? math.max(len + end, 0) : math.min(end, len);
  }
}

class StringJoiner {
  final List<String> _parts = <String>[];

  void add(String part) {
    _parts.add(part);
  }

  String toString() => _parts.join("");
}

class NumberWrapper {
  static String toFixed(num n, int fractionDigits) {
    return n.toStringAsFixed(fractionDigits);
  }

  static bool equal(num a, num b) {
    return a == b;
  }

  static int parseIntAutoRadix(String text) {
    return int.parse(text);
  }

  static int parseInt(String text, int radix) {
    return int.parse(text, radix: radix);
  }

  static double parseFloat(String text) {
    return double.parse(text);
  }

  static double get NaN => double.NAN;

  static bool isNaN(num value) => value.isNaN;

  static bool isInteger(value) => value is int;
}

class RegExpWrapper {
  static RegExp create(regExpStr, [String flags = '']) {
    bool multiLine = flags.contains('m');
    bool caseSensitive = !flags.contains('i');
    return new RegExp(regExpStr,
        multiLine: multiLine, caseSensitive: caseSensitive);
  }

  static Match firstMatch(RegExp regExp, String input) {
    return regExp.firstMatch(input);
  }

  static bool test(RegExp regExp, String input) {
    return regExp.hasMatch(input);
  }

  static Iterator<Match> matcher(RegExp regExp, String input) {
    return regExp.allMatches(input).iterator;
  }
}

class RegExpMatcherWrapper {
  static _JSLikeMatch next(Iterator<Match> matcher) {
    if (matcher.moveNext()) {
      return new _JSLikeMatch(matcher.current);
    }
    return null;
  }
}

class _JSLikeMatch {
  Match _m;

  _JSLikeMatch(this._m);

  String operator [](index) => _m[index];
  int get index => _m.start;
  int get length => _m.groupCount + 1;
}

class FunctionWrapper {
  static apply(Function fn, posArgs) {
    return Function.apply(fn, posArgs);
  }
}

const _NAN_KEY = const Object();

// Dart can have identical(str1, str2) == false while str1 == str2. Moreover,
// after compiling with dart2js identical(str1, str2) might return true.
// (see dartbug.com/22496 for details).
bool looseIdentical(a, b) =>
    a is String && b is String ? a == b : identical(a, b);

// Dart compare map keys by equality and we can have NaN != NaN
dynamic getMapKey(value) {
  if (value is! num) return value;
  return value.isNaN ? _NAN_KEY : value;
}

// TODO: remove with https://github.com/angular/angular/issues/3055
dynamic normalizeBlank(obj) => obj;

bool normalizeBool(bool obj) {
  return isBlank(obj) ? false : obj;
}

bool isJsObject(o) {
  return false;
}

bool _forceDevMode = false;
bool _devModeLocked = false;

void lockDevMode() {
  _devModeLocked = true;
}

void enableDevMode() {
  if (_forceDevMode) {
    return;
  }
  if (_devModeLocked) {
    throw new Exception("Cannot enable dev mode after platform setup.");
  }
  _forceDevMode = true;
}

bool assertionsEnabled() {
  var k = false;
  assert((k = true));
  return _forceDevMode || k;
}

// Can't be all uppercase as our transpiler would think it is a special directive...
class Json {
  static parse(String s) => convert.JSON.decode(s);
  static String stringify(data) {
    var encoder = new convert.JsonEncoder.withIndent("  ");
    return encoder.convert(data);
  }
}

class DateWrapper {
  static DateTime create(int year,
      [int month = 1,
      int day = 1,
      int hour = 0,
      int minutes = 0,
      int seconds = 0,
      int milliseconds = 0]) {
    return new DateTime(year, month, day, hour, minutes, seconds, milliseconds);
  }

  static DateTime fromISOString(String str) {
    return DateTime.parse(str);
  }

  static DateTime fromMillis(int ms) {
    return new DateTime.fromMillisecondsSinceEpoch(ms, isUtc: true);
  }

  static int toMillis(DateTime date) {
    return date.millisecondsSinceEpoch;
  }

  static DateTime now() {
    return new DateTime.now();
  }

  static String toJson(DateTime date) {
    return date.toUtc().toIso8601String();
  }
}

// needed to match the exports from lang.js
var global = null;
