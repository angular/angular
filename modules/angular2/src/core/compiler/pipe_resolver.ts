import {resolveForwardRef, Injectable} from 'angular2/di';
import {Type, isPresent, BaseException, stringify} from 'angular2/src/core/facade/lang';
import {PipeMetadata} from '../metadata/directives';
import {reflector} from 'angular2/src/core/reflection/reflection';

/**
 * Resolve a `Type` for {@link PipeMetadata}.
 *
 * This interface can be overridden by the application developer to create custom behavior.
 *
 * See {@link Compiler}
 */
@Injectable()
export class PipeResolver {
  /**
   * Return {@link PipeMetadata} for a given `Type`.
   */
  resolve(type: Type): PipeMetadata {
    var metas = reflector.annotations(resolveForwardRef(type));
    if (isPresent(metas)) {
      for (var i = 0; i < metas.length; i++) {
        var annotation = metas[i];
        if (annotation instanceof PipeMetadata) {
          return annotation;
        }
      }
    }
    throw new BaseException(`No Pipe decorator found on ${stringify(type)}`);
  }
}
