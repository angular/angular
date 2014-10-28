library change_detection.facade;

@MirrorsUsed(targets: const [FieldGetterFactory], metaTargets: const [] )
import 'dart:mirrors';

typedef SetterFn(Object obj, value);

const _NAN_KEY = const Object();

class FieldGetterFactory {
  getter(Object object, String name) {
    Symbol symbol = new Symbol(name);
    InstanceMirror instanceMirror = reflect(object);
    return (Object object) => instanceMirror.getField(symbol).reflectee;
  }
}

// Dart can have identical(str1, str2) == false while str1 == str2
bool looseIdentical(a, b) => a is String && b is String ? a == b : identical(a, b);

// Dart compare map keys by equality and we can have NaN != NaN
dynamic getMapKey(value) {
  if (value is! num) return value;
  return value.isNaN ? _NAN_KEY : value;
}

