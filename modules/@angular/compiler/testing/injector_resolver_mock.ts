import {InjectorMetadata, Injectable} from '@angular/core';

import {Map} from '../src/facade/collection';
import {Type, isPresent} from '../src/facade/lang';
import {InjectorResolver} from '../src/injector_resolver';


/**
 * An implementation of {@link InjectorResolver} that allows overriding
 * various properties of directives.
 */
@Injectable()
export class MockInjectorResolver extends InjectorResolver {
  private _providerOverrides = new Map<Type, any[]>();

  resolve(type: Type): InjectorMetadata {
    var dm = super.resolve(type);

    var providerOverrides = this._providerOverrides.get(type);

    var providers = dm.providers;
    if (isPresent(providerOverrides)) {
      var originalViewProviders: any[] = isPresent(dm.providers) ? dm.providers : [];
      providers = originalViewProviders.concat(providerOverrides);
    }

    return new InjectorMetadata({providers: providers});
  }

  setProvidersOverride(type: Type, providers: any[]): void {
    this._providerOverrides.set(type, providers);
  }
}
