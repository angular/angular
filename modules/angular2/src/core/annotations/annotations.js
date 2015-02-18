import {ABSTRACT, CONST, normalizeBlank, isPresent} from 'angular2/src/facade/lang';
import {ListWrapper, List} from 'angular2/src/facade/collection';

@ABSTRACT()
export class Directive {
  selector:any; //string;
  bind:any;
  lightDomServices:any; //List;
  implementsTypes:any; //List;
  lifecycle:any; //List
  @CONST()
  constructor({
      selector,
      bind,
      lightDomServices,
      implementsTypes,
      lifecycle
    }: any/*{
      // should be
      selector?:string,
      bind?:any,
      lightDomServices?:List<any>,
      implementsTypes?:List<any>,
      lifecycle?:List<any>
    }*/ = {})
  {
    this.selector = selector;
    this.lightDomServices = lightDomServices;
    this.implementsTypes = implementsTypes;
    this.bind = bind;
    this.lifecycle = lifecycle;
  }

  hasLifecycleHook(hook:string):boolean {
    return isPresent(this.lifecycle) ? ListWrapper.contains(this.lifecycle, hook) : false;
  }
}

export class Component extends Directive {
  //TODO: vsavkin: uncomment it once the issue with defining fields in a sublass works
  lightDomServices:any; //List;
  shadowDomServices:any; //List;
  componentServices:any; //List;
  lifecycle:any; //List

@CONST()
  constructor({
    selector,
    bind,
    lightDomServices,
    shadowDomServices,
    componentServices,
    implementsTypes,
    lifecycle
    }:any /*{
      // should be
      selector?:string,
      bind?:Object,
      lightDomServices?:List<any>,
      shadowDomServices?:List<any>,
      componentServices?:List<any>,
      implementsTypes?:List<any>,
      lifecycle?:List<any>
    }*/ = {})
  {
    super({
      selector: selector,
      bind: bind,
      lightDomServices: lightDomServices,
      implementsTypes: implementsTypes,
      lifecycle: lifecycle
    });

    this.lightDomServices = lightDomServices;
    this.shadowDomServices = shadowDomServices;
    this.componentServices = componentServices;
    this.lifecycle = lifecycle;
  }
}

export class Decorator extends Directive {
  compileChildren: boolean;
  @CONST()
  constructor({
      selector,
      bind,
      lightDomServices,
      implementsTypes,
      lifecycle,
      compileChildren = true,
    }: any/*{
      // should be
      selector?:string,
      bind?:any,
      lightDomServices?:List<any>,
      implementsTypes?:List<any>,
      lifecycle?:List<any>,
      compileChildren?:boolean
    }*/ = {})
  {
    this.compileChildren = compileChildren;
    super({
        selector: selector,
        bind: bind,
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
      lightDomServices,
      implementsTypes,
      lifecycle
    }: any/*{
      // should be
      selector?:string,
      bind?:any,
      lightDomServices?:List<any>,
      implementsTypes?:List<any>,
      lifecycle?:List<any>
    }*/ = {})
  {
    super({
        selector: selector,
        bind: bind,
        lightDomServices: lightDomServices,
        implementsTypes: implementsTypes,
        lifecycle: lifecycle
    });
  }
}

export const onDestroy = "onDestroy";
export const onChange = "onChange";
