import {FIELD} from 'facade/lang';

/**

Difference beteween di.Injector and ElementInjector

di.Injector (di.Module):
 - imperative based (can create child injectors imperativly)
 - Lazy loading of code
 - Component/App Level services which are usually not DOM Related.


ElementInjector (ElementModule):
  - ProtoBased (Injector structure fixed at compile time)
  - understands @Ancestor, @Parent, @Child, @Descendent
  - Fast
  - Query mechanism for children
  - 1:1 to DOM structure.
 */

export class ProtoElementInjector {
  @FIELD('final _parent:ProtoElementInjector')
  /// Temporory instance while instantiating
  @FIELD('_clone:ElementInjector')
  constructor(parent:ProtoElementInjector) {
    this._parent = parent;
  }

  instantiate():ElementInjector {
    return new ElementInjector(this);
  }
}

export class ElementInjector {
  @FIELD('final protoInjector:ProtoElementInjector')
  constructor(protoInjector:ProtoElementInjector) {
    this.protoInjector = protoInjector;
  }

}

