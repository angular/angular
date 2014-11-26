import {MapWrapper} from 'facade/collection';

export class ContextWithVariableBindings {
  parent:any;
  /// varBindings are read-only. updating/adding keys is not supported.
  varBindings:Map;

  constructor(parent:any, varBindings:Map) {
    this.parent = parent;
    this.varBindings = varBindings;
  }

  hasBinding(name:string):boolean {
    return MapWrapper.contains(this.varBindings, name);
  }

  get(name:string) {
    return MapWrapper.get(this.varBindings, name);
  }
}