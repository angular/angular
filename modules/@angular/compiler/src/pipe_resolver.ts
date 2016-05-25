import {resolveForwardRef, Injectable, PipeMetadata} from '@angular/core';

import {ReflectorReader, reflector} from '../core_private';

import {Type, isPresent, stringify} from '../src/facade/lang';
import {BaseException} from '../src/facade/exceptions';

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
  private _reflector: ReflectorReader;
  constructor(_reflector?: ReflectorReader) {
    if (isPresent(_reflector)) {
      this._reflector = _reflector;
    } else {
      this._reflector = reflector;
    }
  }

  /**
   * Return {@link PipeMetadata} for a given `Type`.
   */
  resolve(type: Type): PipeMetadata {
    var metas = this._reflector.annotations(resolveForwardRef(type));
    if (isPresent(metas)) {
      var annotation = metas.find(_isPipeMetadata);
      if (isPresent(annotation)) {
        return annotation;
      }
    }
    throw new BaseException(`No Pipe decorator found on ${stringify(type)}`);
  }
}

export var CODEGEN_PIPE_RESOLVER = new PipeResolver(reflector);
