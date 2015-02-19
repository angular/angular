import {ABSTRACT, CONST, normalizeBlank, isPresent, addAnnotation} from 'angular2/src/facade/lang';
import {ListWrapper, List} from 'angular2/src/facade/collection';

@ABSTRACT()
export class DirectiveAnnotation {
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

export function Directive(arg = undefined) {
    return c => addAnnotation(c, new DirectiveAnnotation(arg));
}

export class ComponentAnnotation extends DirectiveAnnotation {
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

export function Component(arg = undefined) {
    return c => addAnnotation(c, new ComponentAnnotation(arg));
}

export class DecoratorAnnotation extends DirectiveAnnotation {
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

export function Decorator(arg = undefined) {
    return c => addAnnotation(c, new DecoratorAnnotation(arg));
}

export class ViewportAnnotation extends DirectiveAnnotation {
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

export function Viewport(arg = undefined) {
    return c => addAnnotation(c, new ViewportAnnotation(arg));
}

export const onDestroy = "onDestroy";
export const onChange = "onChange";
