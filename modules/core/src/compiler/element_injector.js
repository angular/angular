import {FIELD} from 'facade/lang';

/**

Difference between di.Injector and ElementInjector

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

 PERF BENCHMARK: http://www.williambrownstreet.net/blog/2014/04/faster-angularjs-rendering-angularjs-and-reactjs/

 */

export class ProtoElementInjector {
  /**
  parent:ProtoDirectiveInjector;
  next:ProtoDirectiveInjector;
  prev:ProtoDirectiveInjector;
  head:ProtoDirectiveInjector;
  tail:ProtoDirectiveInjector;
  DirectiveInjector cloneingInstance;
  KeyMap keyMap;
  /// Because DI tree is sparse, this shows how far away is the Parent DI
  parentDistance:int = 1; /// 1 for non-sparse/normal depth.

  cKey:int; cFactory:Function; cParams:List<int>;
  keyId0:int; factory0:Function; params0:List<int>;
  keyId1:int; factory1:Function; params1:List<int>;
  keyId2:int; factory2:Function; params2:List<int>;
  keyId3:int; factory3:Function; params3:List<int>;
  keyId4:int; factory4:Function; params4:List<int>;
  keyId5:int; factory5:Function; params5:List<int>;
  keyId6:int; factory6:Function; params6:List<int>;
  keyId7:int; factory7:Function; params7:List<int>;
  keyId8:int; factory8:Function; params8:List<int>;
  keyId9:int; factory9:Function; params9:List<int>;

  queryKeyId0:int;
  queryKeyId1:int;

  textNodes:List<int>;
  hasProperties:boolean;
  events:Map<string, Expression>;

  elementInjector:ElementInjector;
  */
  constructor(parent:ProtoElementInjector) {
    this.hasProperties = false;
    this.textNodes = null;
  }

  instantiate():ElementInjector {
    return new ElementInjector(this);
  }
}

export class ElementInjector {
  /*
   _protoInjector:ProtoElementInjector;
   injector:Injector;
   _parent:ElementInjector;
   _next:ElementInjector;
   _prev:ElementInjector;
   _head:ElementInjector;
   _tail:ElementInjector;


  // For performance reasons the Injector only supports 10 directives per element.
  // NOTE: linear search over fields is faster than HashMap lookup.
  _cObj; // Component only
  _obj0;
  _obj1;
  _obj2;
  _obj3;
  _obj4;
  _obj5;
  _obj6;
  _obj7;
  _obj8;
  _obj9;

  element:Element;
  ngElement:NgElement;
  shadowRoot:ShadowRoot;
  elementProbe:ElementProbe;
  view:View;
  viewPort:ViewPort;
  viewFactory:ViewFactory;
  animate:Animate;
  destinationLightDom:DestinationLightDom;
  sourceLightDom:SourceLightDom;


  // For performance reasons the Injector only supports 2 [Query] per element.
  // NOTE: linear search over fields is faster than HashMap lookup.
  _query0:Query;
  _query1:Query;

   */
  @FIELD('final protoInjector:ProtoElementInjector')
  constructor(protoInjector:ProtoElementInjector) {
    this.protoInjector = protoInjector;
  }

}

