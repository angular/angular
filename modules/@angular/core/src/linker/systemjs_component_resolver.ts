import { ComponentResolver } from './component_resolver';
import { Type, isString, global } from '../facade/lang';
import { ComponentFactory } from './component_factory';
import { InjectorFactory } from '../linker/injector_factory';

/**
 * Component resolver that can load components lazily
 * @experimental
 */
export class SystemJsComponentResolver implements ComponentResolver {
  constructor(private _resolver: ComponentResolver) {}

  resolveComponent(componentType:string|Type):Promise<ComponentFactory<any>> {
    if (isString(componentType)) {
      return (<any>global).System.import(componentType).then(module =>
        this._resolver.resolveComponent(module.default));
    } else {
      return this._resolver.resolveComponent(<Type>componentType);
    }
  }

  createInjectorFactory(config: Type, extraProviders?: any[]): InjectorFactory<any> {
    return this._resolver.createInjectorFactory(config, extraProviders);
  }

  loadInjectorFactory(configTypeModule: string): Promise<InjectorFactory<any>> {
    return (<any>global).System.import(configTypeModule).then(module =>
      this._resolver.resolveComponent(module.default));
  }

  clearCache() {}
}
