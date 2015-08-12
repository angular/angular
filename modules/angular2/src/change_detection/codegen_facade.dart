library angular2.src.change_detection.codegen_facade;

import 'dart:convert' show JSON;

/// Converts `funcOrValue` to a string which can be used in generated code.
String codify(funcOrValue) => JSON.encode(funcOrValue).replaceAll(r'$', r'\$');

/// Combine the strings of generated code into a single interpolated string.
/// Each element of `vals` is expected to be a string literal or a codegen'd
/// call to a method returning a string.
/// The return format interpolates each value as an expression which reads
/// poorly, but the resulting code is easily flattened by dart2js.
String combineGeneratedStrings(List<String> vals) {
  return '"${vals.map((v) => '\${$v}').join('')}"';
}

String rawString(String str) {
  return "r'$str'";
}