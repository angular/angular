library angular2.src.compiler.util;

import "package:angular2/src/facade/lang.dart"
    show IS_DART, StringWrapper, isBlank;

var CAMEL_CASE_REGEXP = new RegExp(r'([A-Z])');
var DASH_CASE_REGEXP = new RegExp(r'-([a-z])');
var SINGLE_QUOTE_ESCAPE_STRING_RE = new RegExp(r'' + "'" + r'|\\|\n|\$');
var DOUBLE_QUOTE_ESCAPE_STRING_RE = new RegExp(r'"|\\|\n|\$');
var MODULE_SUFFIX = IS_DART ? ".dart" : ".js";
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
    return '''${ fnName}(${ params . join ( "," )}) => ${ value}''';
  } else {
    return '''function ${ fnName}(${ params . join ( "," )}) { return ${ value}; }''';
  }
}

String codeGenToString(String expr) {
  if (IS_DART) {
    return '''\'\${${ expr}}\'''';
  } else {
    // JS automatically convets to string...
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
