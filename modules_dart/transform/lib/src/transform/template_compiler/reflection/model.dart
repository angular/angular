library angular2.transform.template_compiler.reflection.model;

import 'package:angular2/src/compiler/util.dart';

/// Defines the names of getters, setters, and methods which need to be
/// available to Angular 2 via the `reflector` at runtime.
/// See [angular2.src.reflection.reflector] for details.
abstract class CodegenModel {
  Iterable<ReflectiveAccessor> get getterNames;
  Iterable<ReflectiveAccessor> get methodNames;
  Iterable<ReflectiveAccessor> get setterNames;
}

/// Wraps a getter, setter, or method that we may need to access reflectively in
/// an Angular2 app.
/// This is essentially a wrapper for `sanitizedName`, which is the name of the
/// actual getter, setter, or method that will be registered. Note that
/// `operator==` and `hashCode` basically forward to `sanitizedName`.
class ReflectiveAccessor {
  /// The value in the Ast determining that we need this accessor. This is the
  /// value that is actually present in the template, which may not directly
  /// correspond to the model on the `Component`.
  final String astValue;

  /// The sanitized name of this accessor. This is the name of the getter,
  /// setter, or method on the `Component`.
  final String sanitizedName;

  ReflectiveAccessor(String astValue)
      : this.astValue = astValue,
        this.sanitizedName = sanitizePropertyName(astValue);

  @override
  bool operator ==(other) {
    if (other is! ReflectiveAccessor) return false;
    return sanitizedName == other.sanitizedName;
  }

  @override
  int get hashCode => sanitizedName.hashCode;
}

String sanitizePropertyName(String name) {
  // Angular supports renaming class property names
  // when used in a template.
  // Long syntax: 'classPropertyName: templateName'
  // Short syntax: 'classPropertyName'
  // This method always returns the 'classPropertyName'.
  var fieldName = name;
  var separatorIdx = name.indexOf(':');
  if (separatorIdx > -1) {
    fieldName = name.substring(0, separatorIdx).trim();
  }
  return dashCaseToCamelCase(fieldName);
}
