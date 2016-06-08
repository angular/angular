import {Type, global, isString} from '../facade/lang';

import {ComponentFactory} from './component_factory';
import {ComponentResolver} from './component_resolver';


/**
 * Component resolver that can load components lazily
 * @experimental
 */
export class SystemJsComponentResolver implements ComponentResolver {
  constructor(private _resolver: ComponentResolver) {}

  resolveComponent(componentType: string|Type): Promise<ComponentFactory<any>> {
    if (isString(componentType)) {
      return (<any>global)
          .System.import(componentType)
          .then((module: any /** TODO #9100 */) => this._resolver.resolveComponent(module.default));
    } else {
      return this._resolver.resolveComponent(<Type>componentType);
    }
  }

  clearCache() {}
}
