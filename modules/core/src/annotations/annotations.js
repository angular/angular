import {ABSTRACT, CONST, normalizeBlank} from 'facade/src/lang';
import {List} from 'facade/src/collection';
import {TemplateConfig} from './template_config';
import {ShadowDomStrategy} from '../compiler/shadow_dom';


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
    }:{
      selector:string,
      bind:any,
      lightDomServices:List,
      implementsTypes:List,
      lifecycle:List
    }={})
  {
    this.selector = selector;
    this.lightDomServices = lightDomServices;
    this.implementsTypes = implementsTypes;
    this.bind = bind;
    this.lifecycle = lifecycle;
  }
}

export class Component extends Directive {
  //TODO: vsavkin: uncomment it once the issue with defining fields in a sublass works
  template:any; //TemplateConfig;
  lightDomServices:any; //List;
  shadowDomServices:any; //List;
  componentServices:any; //List;
  shadowDom:any; //ShadowDomStrategy;
  lifecycle:any; //List

@CONST()
  constructor({
    selector,
    bind,
    template,
    lightDomServices,
    shadowDomServices,
    componentServices,
    implementsTypes,
    shadowDom,
    lifecycle
    }:{
      selector:String,
      bind:Object,
      template:TemplateConfig,
      lightDomServices:List,
      shadowDomServices:List,
      componentServices:List,
      implementsTypes:List,
      shadowDom:ShadowDomStrategy,
      lifecycle:List
    }={})
  {
    super({
      selector: selector,
      bind: bind,
      lightDomServices: lightDomServices,
      implementsTypes: implementsTypes,
      lifecycle: lifecycle
    });

    this.template = template;
    this.lightDomServices = lightDomServices;
    this.shadowDomServices = shadowDomServices;
    this.componentServices = componentServices;
    this.shadowDom = shadowDom;
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
    }:{
      selector:string,
      bind:any,
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
        lightDomServices: lightDomServices,
        implementsTypes: implementsTypes,
        lifecycle: lifecycle
    });
  }
}

export class Template extends Directive {
  @CONST()
  constructor({
      selector,
      bind,
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
        lightDomServices: lightDomServices,
        implementsTypes: implementsTypes,
        lifecycle: lifecycle
    });
  }
}

export var onDestroy = "onDestroy";
