import {Injectable} from 'angular2/src/core/di';
import {Type, isBlank, stringify} from 'angular2/src/facade/lang';
import {BaseException} from 'angular2/src/facade/exceptions';
import {PromiseWrapper} from 'angular2/src/facade/async';
import {reflector} from 'angular2/src/core/reflection/reflection';
import {ComponentFactory} from './component_factory';

/**
 * Low-level service for compiling {@link Component}s into {@link ProtoViewRef ProtoViews}s, which
 * can later be used to create and render a Component instance.
 *
 * Most applications should instead use higher-level {@link DynamicComponentLoader} service, which
 * both compiles and instantiates a Component.
 */
export abstract class Compiler {
  abstract compileComponent(componentType: Type): Promise<ComponentFactory>;
  abstract clearCache();
}

function _isComponentFactory(type: any): boolean {
  return type instanceof ComponentFactory;
}

@Injectable()
export class Compiler_ extends Compiler {
  compileComponent(componentType: Type): Promise<ComponentFactory> {
    var metadatas = reflector.annotations(componentType);
    var componentFactory = metadatas.find(_isComponentFactory);

    if (isBlank(componentFactory)) {
      throw new BaseException(`No precompiled component ${stringify(componentType)} found`);
    }
    return PromiseWrapper.resolve(componentFactory);
  }

  clearCache() {}
}
