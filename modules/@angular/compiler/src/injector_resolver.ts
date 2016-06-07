import {Injectable, resolveForwardRef, ProviderPropertyMetadata, InjectorMetadata, Provider} from '@angular/core';

import {ReflectorReader, reflector} from '../core_private';
import {ListWrapper, StringMapWrapper} from '../src/facade/collection';
import {BaseException} from '../src/facade/exceptions';
import {Type, isPresent, stringify} from '../src/facade/lang';

function _isInjectorMetadata(type: any): boolean {
  return type instanceof InjectorMetadata;
}

export class NoInjectorAnnotationError extends BaseException {
  constructor(type: Type) {
    super(`No InjectorConfig annotation found on ${stringify(type)}`);
  }
}

/*
 * Resolve a `Type` for {@link InjectorMetadata}.
 *
 * This interface can be overridden by the application developer to create custom behavior.
 *
 * See {@link Compiler}
 */
@Injectable()
export class InjectorResolver {
  private _reflector: ReflectorReader;

  constructor(_reflector?: ReflectorReader) {
    if (isPresent(_reflector)) {
      this._reflector = _reflector;
    } else {
      this._reflector = reflector;
    }
  }

  /**
   * Return {@link InjectorMetadata} for a given `Type`.
   */
  resolve(type: Type): InjectorMetadata {
    var typeMetadata = this._reflector.annotations(resolveForwardRef(type));
    if (isPresent(typeMetadata)) {
      var metadata = typeMetadata.find(_isInjectorMetadata);
      if (isPresent(metadata)) {
        var propertyMetadata = this._reflector.propMetadata(type);
        return this._mergeWithPropertyMetadata(metadata, propertyMetadata);
      }
    }

    throw new NoInjectorAnnotationError(type);
  }

  private _mergeWithPropertyMetadata(
      dm: InjectorMetadata, propertyMetadata: {[key: string]: any[]}): InjectorMetadata {
    var providers = [].concat(dm.providers);

    StringMapWrapper.forEach(propertyMetadata, (metadata: any[], propName: string) => {
      metadata.forEach(a => {
        if (a instanceof ProviderPropertyMetadata) {
          providers.push(new Provider(a.token, {multi: a.multi, useProperty: propName}));
        }
      });
    });
    return new InjectorMetadata({providers: providers});
  }
}
