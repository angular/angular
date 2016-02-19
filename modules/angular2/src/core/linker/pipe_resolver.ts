import {resolveForwardRef, Injectable} from 'angular2/src/core/di';
import {Type, isPresent, stringify} from 'angular2/src/facade/lang';
import {BaseException} from 'angular2/src/facade/exceptions';
import {PipeMetadata} from 'angular2/src/core/metadata';
import {reflector} from 'angular2/src/core/reflection/reflection';

function _isPipeMetadata(type: any): boolean {
  return type instanceof PipeMetadata;
}

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
      var annotation = metas.find(_isPipeMetadata);
      if (isPresent(annotation)) {
        return annotation;
      }
    }
    throw new BaseException(`No Pipe decorator found on ${stringify(type)}`);
  }
}

export var CODEGEN_PIPE_RESOLVER = new PipeResolver();
