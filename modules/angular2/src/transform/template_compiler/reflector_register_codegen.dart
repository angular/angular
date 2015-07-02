library angular2.transform.template_compiler.reflector_register_codegen;

import 'package:angular2/src/transform/common/names.dart';
import 'package:angular2/src/transform/common/property_utils.dart' as prop;
import 'reflection_capabilities.dart';

class Codegen {
  final StringBuffer _buf = new StringBuffer();

  void generate(RecordingReflectionCapabilities recording) {
    if (recording != null) {
      var calls = _generateGetters(recording.getterNames);
      if (calls.isNotEmpty) {
        _buf.write('..${REGISTER_GETTERS_METHOD_NAME}'
            '({${calls.join(', ')}})');
      }
      calls = _generateSetters(recording.setterNames);
      if (calls.isNotEmpty) {
        _buf.write('..${REGISTER_SETTERS_METHOD_NAME}'
            '({${calls.join(', ')}})');
      }
      calls = _generateMethods(recording.methodNames);
      if (calls.isNotEmpty) {
        _buf.write('..${REGISTER_METHODS_METHOD_NAME}'
            '({${calls.join(', ')}})');
      }
    }
  }

  bool get isEmpty => _buf.isEmpty;

  @override
  String toString() => '$_buf';
}

Iterable<String> _generateGetters(Iterable<String> getterNames) {
  return getterNames.map((getterName) {
    if (!prop.isValid(getterName)) {
      // TODO(kegluenq): Eagerly throw here once #1295 is addressed.
      return prop.lazyInvalidGetter(getterName);
    } else {
      return ''' '${prop.sanitize(getterName)}': (o) => o.$getterName''';
    }
  });
}

Iterable<String> _generateSetters(Iterable<String> setterName) {
  return setterName.map((setterName) {
    if (!prop.isValid(setterName)) {
      // TODO(kegluenq): Eagerly throw here once #1295 is addressed.
      return prop.lazyInvalidSetter(setterName);
    } else {
      return ''' '${prop.sanitize(setterName)}': '''
          ''' (o, v) => o.$setterName = v ''';
    }
  });
}

Iterable<String> _generateMethods(Iterable<String> methodNames) {
  return methodNames.map((methodName) {
    if (!prop.isValid(methodName)) {
      // TODO(kegluenq): Eagerly throw here once #1295 is addressed.
      return prop.lazyInvalidMethod(methodName);
    } else {
      return ''' '${prop.sanitize(methodName)}': '''
          '(o, List args) => Function.apply(o.$methodName, args) ';
    }
  });
}
