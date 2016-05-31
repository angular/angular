import {Type, isBlank, isString, stringify} from '../facade/lang';
import {BaseException} from '../facade/exceptions';
import {PromiseWrapper} from '../facade/async';
import {reflector} from '../reflection/reflection';
import {ComponentFactory} from './component_factory';
import {Injectable} from '../di/decorators';

/**
 * Low-level service for loading {@link ComponentFactory}s, which
 * can later be used to create and render a Component instance.
 * @experimental
 */
export abstract class ComponentResolver {
  abstract resolveComponent(component: Type|string): Promise<ComponentFactory<any>>;
  abstract clearCache();
}

function _isComponentFactory(type: any): boolean {
  return type instanceof ComponentFactory;
}

@Injectable()
export class ReflectorComponentResolver extends ComponentResolver {
  resolveComponent(component: Type|string): Promise<ComponentFactory<any>> {
    if (isString(component)) {
      return PromiseWrapper.reject(new BaseException(`Cannot resolve component using '${component}'.`), null);
    }

    var metadatas = reflector.annotations(<Type>component);
    var componentFactory = metadatas.find(_isComponentFactory);

    if (isBlank(componentFactory)) {
      throw new BaseException(`No precompiled component ${stringify(component)} found`);
    }
    return PromiseWrapper.resolve(componentFactory);
  }
  clearCache() {}
}
