import {ABSTRACT, CONST, normalizeBlank, isPresent} from 'angular2/src/facade/lang';
import {ListWrapper, List} from 'angular2/src/facade/collection';

@ABSTRACT()
export class Directive {
  selector:any; //string;
  bind:any;
  lightDomServices:any; //List;
  implementsTypes:any; //List;
  lifecycle:any; //List
  events:any; //List
  @CONST()
  constructor({
      selector,
      bind,
      events,
      lightDomServices,
      implementsTypes,
      lifecycle
    }:{
      selector:string,
      bind:any,
      events: any,
      lightDomServices:List,
      implementsTypes:List,
      lifecycle:List
    }={})
  {
    this.selector = selector;
    this.lightDomServices = lightDomServices;
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
  shadowDomServices:any; //List;
  componentServices:any; //List;

@CONST()
  constructor({
    selector,
    bind,
    events,
    lightDomServices,
    shadowDomServices,
    componentServices,
    implementsTypes,
    lifecycle
    }:{
      selector:String,
      bind:Object,
      events:Object,
      lightDomServices:List,
      shadowDomServices:List,
      componentServices:List,
      implementsTypes:List,
      lifecycle:List
    }={})
  {
    super({
      selector: selector,
      bind: bind,
      events: events,
      lightDomServices: lightDomServices,
      implementsTypes: implementsTypes,
      lifecycle: lifecycle
    });

    this.shadowDomServices = shadowDomServices;
    this.componentServices = componentServices;
  }
}

export class Decorator extends Directive {
  compileChildren: boolean;
  @CONST()
  constructor({
      selector,
      bind,
      events,
      lightDomServices,
      implementsTypes,
      lifecycle,
      compileChildren = true,
    }:{
      selector:string,
      bind:any,
      events:any,
      lightDomServices:List,
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
        lightDomServices: lightDomServices,
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
      lightDomServices,
      implementsTypes,
      lifecycle
    }:{
      selector:string,
      bind:any,
      lightDomServices:List,
      implementsTypes:List,
      lifecycle:List
    }={})
  {
    super({
        selector: selector,
        bind: bind,
        events: events,
        lightDomServices: lightDomServices,
        implementsTypes: implementsTypes,
        lifecycle: lifecycle
    });
  }
}

export const onDestroy = "onDestroy";
export const onChange = "onChange";
