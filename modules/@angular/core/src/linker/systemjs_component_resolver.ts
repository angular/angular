import { ComponentResolver } from './component_resolver';
import { Type, isString, global } from '../../src/facade/lang';
import { ComponentFactory } from './component_factory';

/**
 * Component resolver that can load components lazily
 */
export class SystemJsComponentResolver implements ComponentResolver {
  constructor(private _resovler: ComponentResolver) {}

  resolveComponent(componentType:string|Type):Promise<ComponentFactory<any>> {
    if (isString(componentType)) {
      return (<any>global).System.import(componentType).then(module =>
        this._resovler.resolveComponent(module.default));
    } else {
      return this._resovler.resolveComponent(<Type>componentType);
    }
  }

  clearCache() {}
}
