import {MapWrapper} from 'facade/collection';
import {BaseException} from 'facade/lang';

export class ContextWithVariableBindings {
  parent:any;
  /// varBindings' keys are read-only. adding/removing keys is not supported.
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

  set(name:string, value) {
    // TODO(rado): consider removing this check if we can guarantee this is not
    // exposed to the public API.
    if (this.hasBinding(name)) {
      MapWrapper.set(this.varBindings, name, value);
    } else {
      throw new BaseException(
        'VariableBindings do not support setting of new keys post-construction.');
    }
  }

  clearValues() {
    for (var [k, v] of MapWrapper.iterable(this.varBindings)) {
      MapWrapper.set(this.varBindings, k, null);
    }
  }
}
