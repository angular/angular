library angular.core.facade.lang;

export 'dart:core' show Type;

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

String stringify(obj) => obj.toString();

class StringWrapper {
  static String fromCharCode(int code) {
    return new String.fromCharCode(code);
  }

  static charCodeAt(String s, int index) {
    return s.codeUnitAt(index);
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
}

