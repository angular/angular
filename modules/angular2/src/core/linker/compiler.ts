import {HostViewFactoryRef} from 'angular2/src/core/linker/view_ref';

import {Injectable} from 'angular2/src/core/di';
import {Type, isBlank, stringify} from 'angular2/src/facade/lang';
import {BaseException} from 'angular2/src/facade/exceptions';
import {Promise, PromiseWrapper} from 'angular2/src/facade/async';
import {reflector} from 'angular2/src/core/reflection/reflection';
import {HostViewFactory} from 'angular2/src/core/linker/view';
import {HostViewFactoryRef_} from 'angular2/src/core/linker/view_ref';

/**
 * Low-level service for compiling {@link Component}s into {@link ProtoViewRef ProtoViews}s, which
 * can later be used to create and render a Component instance.
 *
 * Most applications should instead use higher-level {@link DynamicComponentLoader} service, which
 * both compiles and instantiates a Component.
 */
export abstract class Compiler {
  abstract compileInHost(componentType: Type): Promise<HostViewFactoryRef>;
  abstract clearCache();
}

function isHostViewFactory(type: any): boolean {
  return type instanceof HostViewFactory;
}

@Injectable()
export class Compiler_ extends Compiler {
  compileInHost(componentType: Type): Promise<HostViewFactoryRef_> {
    var metadatas = reflector.annotations(componentType);
    var hostViewFactory = metadatas.find(isHostViewFactory);

    if (isBlank(hostViewFactory)) {
      throw new BaseException(`No precompiled component ${stringify(componentType)} found`);
    }
    return PromiseWrapper.resolve(new HostViewFactoryRef_(hostViewFactory));
  }

  clearCache() {}
}
