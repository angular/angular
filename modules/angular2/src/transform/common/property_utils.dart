library angular2.transform.common.property_utils;

import 'package:analyzer/src/generated/scanner.dart' show Keyword;

/// Whether `name` is a valid property name.
bool isValid(String name) => !Keyword.keywords.containsKey(name);

/// Prepares `name` to be emitted inside a string.
String sanitize(String name) => name.replaceAll('\$', '\\\$');

/// Get a string usable as a lazy invalid setter, that is, one which will
/// `throw` immediately upon use.
String lazyInvalidSetter(String setterName) {
  var sName = sanitize(setterName);
  return ''' '$sName': (o, v) => '''
      ''' throw 'Invalid setter name "$sName" is a Dart keyword.' ''';
}

/// Get a string usable as a lazy invalid getter, that is, one which will
/// `throw` immediately upon use.
String lazyInvalidGetter(String getterName) {
  var sName = sanitize(getterName);
  return ''' '$sName': (o) => '''
      ''' throw 'Invalid getter name "$sName" is a Dart keyword.' ''';
}

/// Get a string usable as a lazy invalid method, that is, one which will
/// `throw` immediately upon use.
String lazyInvalidMethod(String methodName) {
  var sName = sanitize(methodName);
  return ''' '$sName': (o, args) => '''
      ''' throw 'Invalid method name "$sName" is a Dart keyword.' ''';
}
