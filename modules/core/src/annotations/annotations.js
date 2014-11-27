import {ABSTRACT, CONST, normalizeBlank} from 'facade/lang';
import {List} from 'facade/collection';
import {TemplateConfig} from './template_config';


@ABSTRACT()
export class Directive {
  selector:any; //string;
  bind:any;
  lightDomServices:any; //List;
  implementsTypes:any; //List;
  @CONST()
  constructor({
      selector,
      bind,
      lightDomServices,
      implementsTypes
    }:{
      selector:string,
      bind:any,
      lightDomServices:List,
      implementsTypes:List
    }={})
  {
    this.selector = selector;
    this.lightDomServices = lightDomServices;
    this.implementsTypes = implementsTypes;
    this.bind = bind;
  }
}

export class Component extends Directive {
  //TODO: vsavkin: uncomment it once the issue with defining fields in a sublass works
  template:any; //TemplateConfig;
  lightDomServices:any; //List;
  shadowDomServices:any; //List;
  componentServices:any; //List;

  @CONST()
  constructor({
    selector,
    bind,
    template,
    lightDomServices,
    shadowDomServices,
    componentServices,
    implementsTypes
    }:{
    selector:String,
      bind:Object,
      template:TemplateConfig,
      lightDomServices:List,
      shadowDomServices:List,
      componentServices:List,
      implementsTypes:List
  }={})
  {
    super({
      selector: selector,
      bind: bind,
      lightDomServices: lightDomServices,
      implementsTypes: implementsTypes});

    this.template = template;
    this.lightDomServices = lightDomServices;
    this.shadowDomServices = shadowDomServices;
    this.componentServices = componentServices;
  }
}

export class Decorator extends Directive {
  @CONST()
  constructor({
      selector,
      bind,
      lightDomServices,
      implementsTypes
    }:{
      selector:string,
      bind:any,
      lightDomServices:List,
      implementsTypes:List
    }={})
  {
    super({
        selector: selector,
        bind: bind,
        lightDomServices: lightDomServices,
        implementsTypes: implementsTypes
    });
  }
}

export class Template extends Directive {
  @CONST()
  constructor({
      selector,
      bind,
      lightDomServices,
      implementsTypes
    }:{
      selector:string,
      bind:any,
      lightDomServices:List,
      implementsTypes:List
    }={})
  {
    super({
        selector: selector,
        bind: bind,
        lightDomServices: lightDomServices,
        implementsTypes: implementsTypes
    });
  }
}
