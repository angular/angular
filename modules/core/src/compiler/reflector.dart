library facade.di.reflector;

import 'dart:mirrors';
import '../annotations/directive.dart';
import './annotated_type.dart';
import 'package:facade/lang.dart';

/**
 * Interface representing a way of extracting [Directive] annotations from
 * [Type]. This interface has three native implementations:
 *
 * 1) JavaScript native implementation
 * 2) Dart reflective implementation
 * 3) Dart transformer generated implementation
 */
class Reflector {
  AnnotatedType annotatedType(Type type) {
    var directiveAnnotations = reflectType(type).metadata
        .map( (im) => im.reflectee)
        .where( (annotation) => annotation is Directive);
    if (directiveAnnotations.isEmpty) {
      throw new BaseException('No Directive annotation found on '+stringify(type));
    }
    return new AnnotatedType(type, directiveAnnotations.first);
  }

}
