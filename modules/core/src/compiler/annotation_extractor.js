import {Type} from 'facade/lang';
import {Directive} from '../annotations/directive'

/**
 * Interface representing a way of extracting [Directive] annotations from
 * [Type]. This interface has three native implementations:
 *
 * 1) JavaScript native implementation
 * 2) Dart reflective implementation
 * 3) Dart transformer generated implementation
 */
export class AnnotationsExtractor {
  extract(type:Type):Directive {
    return null;
  }
}
