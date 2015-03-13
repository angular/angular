import {ABSTRACT, CONST, normalizeBlank, isPresent} from 'angular2/src/facade/lang';
import {ListWrapper, List} from 'angular2/src/facade/collection';

/**
 * Directives allow you to attach behavior to the DOM elements. Directive is an abstract concept, instead use concrete
 * directives such as: [Component], [Decorator] or [Viewport].
 */
@ABSTRACT()
export class Directive {
  selector:any; //string;
  bind:any;
  implementsTypes:any; //List;
  lifecycle:any; //List
  events:any; //List
  @CONST()
  constructor({
      selector,
      bind,
      events,
      implementsTypes,
      lifecycle
    }:{
      selector:string,
      bind:any,
      events: any,
      implementsTypes:List,
      lifecycle:List
    }={})
  {
    this.selector = selector;
    this.implementsTypes = implementsTypes;
    this.bind = bind;
    this.events = events;
    this.lifecycle = lifecycle;
  }

  hasLifecycleHook(hook:string):boolean {
    return isPresent(this.lifecycle) ? ListWrapper.contains(this.lifecycle, hook) : false;
  }
}

export class Component extends Directive {
  //TODO: vsavkin: uncomment it once the issue with defining fields in a sublass works
  services:any; //List;

@CONST()
  constructor({
    selector,
    bind,
    events,
    services,
    implementsTypes,
    lifecycle
    }:{
      selector:String,
      bind:Object,
      events:Object,
      services:List,
      implementsTypes:List,
      lifecycle:List
    }={})
  {
    super({
      selector: selector,
      bind: bind,
      events: events,
      implementsTypes: implementsTypes,
      lifecycle: lifecycle
    });

    this.services = services;
  }
}

export class Decorator extends Directive {
  compileChildren: boolean;
  @CONST()
  constructor({
      selector,
      bind,
      events,
      implementsTypes,
      lifecycle,
      compileChildren = true,
    }:{
      selector:string,
      bind:any,
      events:any,
      implementsTypes:List,
      lifecycle:List,
      compileChildren:boolean
    }={})
  {
    this.compileChildren = compileChildren;
    super({
        selector: selector,
        bind: bind,
        events: events,
        implementsTypes: implementsTypes,
        lifecycle: lifecycle
    });
  }
}

export class Viewport extends Directive {
  @CONST()
  constructor({
      selector,
      bind,
      events,
      implementsTypes,
      lifecycle
    }:{
      selector:string,
      bind:any,
      implementsTypes:List,
      lifecycle:List
    }={})
  {
    super({
        selector: selector,
        bind: bind,
        events: events,
        implementsTypes: implementsTypes,
        lifecycle: lifecycle
    });
  }
}

export const onDestroy = "onDestroy";
export const onChange = "onChange";
