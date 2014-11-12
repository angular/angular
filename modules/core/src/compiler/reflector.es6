import {Type, isPresent, BaseException} from 'facade/lang';
import {Directive} from '../annotations/directive';
import {AnnotatedType} from './annotated_type';

/**
 * Interface representing a way of extracting [Directive] annotations from
 * [Type]. This interface has three native implementations:
 *
 * 1) JavaScript native implementation
 * 2) Dart reflective implementation
 * 3) Dart transformer generated implementation
 */
export class Reflector {
  annotatedType(type:Type):AnnotatedType {
    var annotations = type.annotations;
    if (annotations) {
      for (var i=0; i<annotations.length; i++) {
        var annotation = annotations[i];
        if (annotation instanceof Directive) {
          return new AnnotatedType(type, annotation);
        }
      }
    }
    throw new BaseException('No Directive annotation found on ' + type.name);
  }
}
