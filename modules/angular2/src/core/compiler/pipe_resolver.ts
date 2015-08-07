import {resolveForwardRef, Injectable} from 'angular2/di';
import {Type, isPresent, BaseException, stringify} from 'angular2/src/facade/lang';
import {Pipe} from '../annotations_impl/annotations';
import {reflector} from 'angular2/src/reflection/reflection';

/**
 * Resolve a `Type` for {@link Pipe}.
 *
 * This interface can be overridden by the application developer to create custom behavior.
 *
 * See {@link Compiler}
 */
@Injectable()
export class PipeResolver {
  /**
   * Return {@link Pipe} for a given `Type`.
   */
  resolve(type: Type): Pipe {
    var metas = reflector.annotations(resolveForwardRef(type));
    if (isPresent(metas)) {
      for (var i = 0; i < metas.length; i++) {
        var annotation = metas[i];
        if (annotation instanceof Pipe) {
          return annotation;
        }
      }
    }
    throw new BaseException(`No Pipe decorator found on ${stringify(type)}`);
  }
}
