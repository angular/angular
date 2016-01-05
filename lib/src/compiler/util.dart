library angular2.src.compiler.util;

import "package:angular2/src/facade/lang.dart"
    show IS_DART, StringWrapper, isBlank, isPresent, isString, isArray;

var CAMEL_CASE_REGEXP = new RegExp(r'([A-Z])');
var DASH_CASE_REGEXP = new RegExp(r'-([a-z])');
var SINGLE_QUOTE_ESCAPE_STRING_RE = new RegExp(r'' + "'" + r'|\\|\n|\r|\$');
var DOUBLE_QUOTE_ESCAPE_STRING_RE = new RegExp(r'"|\\|\n|\r|\$');
var MODULE_SUFFIX = IS_DART ? ".dart" : ".js";
var CONST_VAR = IS_DART ? "const" : "var";
String camelCaseToDashCase(String input) {
  return StringWrapper.replaceAllMapped(input, CAMEL_CASE_REGEXP, (m) {
    return "-" + m[1].toLowerCase();
  });
}

String dashCaseToCamelCase(String input) {
  return StringWrapper.replaceAllMapped(input, DASH_CASE_REGEXP, (m) {
    return m[1].toUpperCase();
  });
}

String escapeSingleQuoteString(String input) {
  if (isBlank(input)) {
    return null;
  }
  return '''\'${ escapeString ( input , SINGLE_QUOTE_ESCAPE_STRING_RE )}\'''';
}

String escapeDoubleQuoteString(String input) {
  if (isBlank(input)) {
    return null;
  }
  return '''"${ escapeString ( input , DOUBLE_QUOTE_ESCAPE_STRING_RE )}"''';
}

String escapeString(String input, RegExp re) {
  return StringWrapper.replaceAllMapped(input, re, (match) {
    if (match[0] == "\$") {
      return IS_DART ? "\\\$" : "\$";
    } else if (match[0] == "\n") {
      return "\\n";
    } else if (match[0] == "\r") {
      return "\\r";
    } else {
      return '''\\${ match [ 0 ]}''';
    }
  });
}

String codeGenExportVariable(String name) {
  if (IS_DART) {
    return '''const ${ name} = ''';
  } else {
    return '''var ${ name} = exports[\'${ name}\'] = ''';
  }
}

String codeGenConstConstructorCall(String name) {
  if (IS_DART) {
    return '''const ${ name}''';
  } else {
    return '''new ${ name}''';
  }
}

String codeGenValueFn(List<String> params, String value, [String fnName = ""]) {
  if (IS_DART) {
    return '''${ codeGenFnHeader ( params , fnName )} => ${ value}''';
  } else {
    return '''${ codeGenFnHeader ( params , fnName )} { return ${ value}; }''';
  }
}

String codeGenFnHeader(List<String> params, [String fnName = ""]) {
  if (IS_DART) {
    return '''${ fnName}(${ params . join ( "," )})''';
  } else {
    return '''function ${ fnName}(${ params . join ( "," )})''';
  }
}

String codeGenToString(String expr) {
  if (IS_DART) {
    return '''\'\${${ expr}}\'''';
  } else {
    // JS automatically converts to string...
    return expr;
  }
}

List<String> splitAtColon(String input, List<String> defaultValues) {
  var parts = StringWrapper.split(input.trim(), new RegExp(r'\s*:\s*'));
  if (parts.length > 1) {
    return parts;
  } else {
    return defaultValues;
  }
}

class Statement {
  String statement;
  Statement(this.statement) {}
}

class Expression {
  String expression;
  var isArray;
  Expression(this.expression, [this.isArray = false]) {}
}

String escapeValue(dynamic value) {
  if (value is Expression) {
    return value.expression;
  } else if (isString(value)) {
    return escapeSingleQuoteString(value);
  } else if (isBlank(value)) {
    return "null";
  } else {
    return '''${ value}''';
  }
}

String codeGenArray(List<dynamic> data) {
  return '''[${ data . map ( escapeValue ) . toList ( ) . join ( "," )}]''';
}

String codeGenFlatArray(List<dynamic> values) {
  var result = "([";
  var isFirstArrayEntry = true;
  var concatFn = IS_DART ? ".addAll" : "concat";
  for (var i = 0; i < values.length; i++) {
    var value = values[i];
    if (value is Expression && ((value as Expression)).isArray) {
      result += ''']).${ concatFn}(${ value . expression}).${ concatFn}([''';
      isFirstArrayEntry = true;
    } else {
      if (!isFirstArrayEntry) {
        result += ",";
      }
      isFirstArrayEntry = false;
      result += escapeValue(value);
    }
  }
  result += "])";
  return result;
}

String codeGenStringMap(List<List<dynamic>> keyValueArray) {
  return '''{${ keyValueArray . map ( codeGenKeyValue ) . toList ( ) . join ( "," )}}''';
}

String codeGenKeyValue(List<dynamic> keyValue) {
  return '''${ escapeValue ( keyValue [ 0 ] )}:${ escapeValue ( keyValue [ 1 ] )}''';
}

addAll(List<dynamic> source, List<dynamic> target) {
  for (var i = 0; i < source.length; i++) {
    target.add(source[i]);
  }
}

List<dynamic> flattenArray(List<dynamic> source, List<dynamic> target) {
  if (isPresent(source)) {
    for (var i = 0; i < source.length; i++) {
      var item = source[i];
      if (isArray(item)) {
        flattenArray(item, target);
      } else {
        target.add(item);
      }
    }
  }
  return target;
}
