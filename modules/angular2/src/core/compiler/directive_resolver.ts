import {resolveForwardRef, Injectable} from 'angular2/di';
import {Type, isPresent, BaseException, stringify} from 'angular2/src/core/facade/lang';
import {DirectiveMetadata} from 'angular2/metadata';
import {reflector} from 'angular2/src/core/reflection/reflection';

/**
 * Resolve a `Type` for {@link DirectiveMetadata}.
 *
 * This interface can be overridden by the application developer to create custom behavior.
 *
 * See {@link Compiler}
 */
@Injectable()
export class DirectiveResolver {
  /**
   * Return {@link DirectiveMetadata} for a given `Type`.
   */
  resolve(type: Type): DirectiveMetadata {
    var annotations = reflector.annotations(resolveForwardRef(type));
    if (isPresent(annotations)) {
      for (var i = 0; i < annotations.length; i++) {
        var annotation = annotations[i];
        if (annotation instanceof DirectiveMetadata) {
          return annotation;
        }
      }
    }
    throw new BaseException(`No Directive annotation found on ${stringify(type)}`);
  }
}
