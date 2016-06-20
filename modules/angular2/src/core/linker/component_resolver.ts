import {Injectable} from 'angular2/src/core/di';
import {Type, isBlank, isString, stringify} from 'angular2/src/facade/lang';
import {BaseException, unimplemented} from 'angular2/src/facade/exceptions';
import {PromiseWrapper} from 'angular2/src/facade/async';
import {reflector} from 'angular2/src/core/reflection/reflection';
import {ComponentFactory} from './component_factory';
import {CodegenInjectorFactory} from './injector_factory';

/**
 * Low-level service for loading {@link ComponentFactory}s, which
 * can later be used to create and render a Component instance.
 */
export abstract class ComponentResolver {
  abstract resolveComponent(componentType: Type): Promise<ComponentFactory>;
  abstract createInjectorFactory(injectorModule: Type,
                                 extraProviders?: any[]): CodegenInjectorFactory<any>;
  abstract clearCache();
}

function _isComponentFactory(type: any): boolean {
  return type instanceof ComponentFactory;
}

@Injectable()
export class ReflectorComponentResolver extends ComponentResolver {
  resolveComponent(componentType: Type): Promise<ComponentFactory> {
    var metadatas = reflector.annotations(componentType);
    var componentFactory = metadatas.find(_isComponentFactory);

    if (isBlank(componentFactory)) {
      throw new BaseException(`No precompiled component ${stringify(componentType)} found`);
    }
    return PromiseWrapper.resolve(componentFactory);
  }

  createInjectorFactory(injectorModule: Type, extraProviders?: any[]): CodegenInjectorFactory<any> {
    return unimplemented();
  }

  clearCache() {}
}
