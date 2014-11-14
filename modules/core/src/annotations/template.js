import {Directive} from './directive';
import {CONST} from 'facade/lang';

export class Template extends Directive {
  @CONST()
  constructor({
      selector,
      bind,
      lightDomServices,
      implementsTypes
    }:{
      selector:String,
      bind:Object,
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
