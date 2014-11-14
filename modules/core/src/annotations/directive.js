import {ABSTRACT, CONST} from 'facade/lang';
import {List} from 'facade/collection';


@ABSTRACT()
export class Directive {
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
    })
  {
    this.selector = selector;
    this.lightDomServices = lightDomServices;
    this.implementsTypes = implementsTypes;
    this.bind = bind;
  }
}
