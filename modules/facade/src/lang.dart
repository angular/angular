library angular.core.facade.lang;

export 'dart:core' show Type, RegExp;
import 'dart:math' as math;

class Math {
  static final _random = new math.Random();
  static int floor(num n) => n.floor();
  static double random() => _random.nextDouble();
}

class FIELD {
  final String definition;
  const FIELD(this.definition);
}

class CONST {
  const CONST();
}
class ABSTRACT {
  const ABSTRACT();
}
class IMPLEMENTS {
  final interfaceClass;
  const IMPLEMENTS(this.interfaceClass);
}

bool isPresent(obj) => obj != null;
bool isBlank(obj) => obj == null;
bool toBool(x) {
  if (x is bool) return x;
  if (x is num) return x != 0;
  return false;
}

autoConvertAdd(a, b) {
  if (a != null && b != null) {
    if (a is String && b is! String) {
      return a + b.toString();
    }
    if (a is! String && b is String) {
      return a.toString() + b;
    }
    return a + b;
  }
  if (a != null) return a;
  if (b != null) return b;
  return 0;
}

String stringify(obj) => obj.toString();

class StringWrapper {
  static String fromCharCode(int code) {
    return new String.fromCharCode(code);
  }

  static charCodeAt(String s, int index) {
    return s.codeUnitAt(index);
  }

  static split(String s, RegExp regExp) {
    var parts = [];
    var lastEnd = 0;
    regExp.allMatches(s).forEach((match) {
      parts.add(s.substring(lastEnd, match.start));
      lastEnd = match.end;
      for (var i=0; i<match.groupCount; i++) {
        parts.add(match.group(i+1));
      }
    });
    parts.add(s.substring(lastEnd));
    return parts;
  }

  static equals(String s, String s2) {
    return s == s2;
  }

  static String replaceAll(String s, RegExp from, String replace) {
    return s.replaceAll(from, replace);
  }
}

class StringJoiner {
  List<String> _parts = <String>[];

  void add(String part) {
    _parts.add(part);
  }

  String toString() => _parts.join("");
}


class NumberWrapper {
  static int parseIntAutoRadix(String text) {
    return int.parse(text);
  }

  static int parseInt(String text, int radix) {
    return int.parse(text, radix: radix);
  }

  static double parseFloat(String text) {
    return double.parse(text);
  }

  static get NaN => double.NAN;

  static bool isNaN(num value) => value.isNaN;
}

class RegExpWrapper {
  static RegExp create(regExpStr) {
    return new RegExp(regExpStr);
  }
  static firstMatch(regExp, input) {
    return regExp.firstMatch(input);
  }
  static matcher(regExp, input) {
    return regExp.allMatches(input).iterator;
  }
}

class RegExpMatcherWrapper {
  static next(matcher) {
    if (matcher.moveNext()) {
      return matcher.current;
    }
    return null;
  }
}

class FunctionWrapper {
  static apply(Function fn, posArgs) {
    return Function.apply(fn, posArgs);
  }
}

class BaseException extends Error {
  final String message;

  BaseException(this.message);

  String toString() {
    return this.message;
  }
}

const _NAN_KEY = const Object();

// Dart can have identical(str1, str2) == false while str1 == str2
bool looseIdentical(a, b) => a is String && b is String ? a == b : identical(a, b);

// Dart compare map keys by equality and we can have NaN != NaN
dynamic getMapKey(value) {
  if (value is! num) return value;
  return value.isNaN ? _NAN_KEY : value;
}

normalizeBlank(obj) {
  return isBlank(obj) ? null : obj;
}