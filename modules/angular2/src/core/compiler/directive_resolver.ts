import {resolveForwardRef, Injectable} from 'angular2/di';
import {Type, isPresent, BaseException, stringify} from 'angular2/src/facade/lang';
import {Directive} from '../annotations_impl/annotations';
import {reflector} from 'angular2/src/reflection/reflection';

@Injectable()
export class DirectiveResolver {
  resolve(type: Type): Directive {
    var annotations = reflector.annotations(resolveForwardRef(type));
    if (isPresent(annotations)) {
      for (var i = 0; i < annotations.length; i++) {
        var annotation = annotations[i];
        if (annotation instanceof Directive) {
          return annotation;
        }
      }
    }
    throw new BaseException(`No Directive annotation found on ${stringify(type)}`);
  }
}
