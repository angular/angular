// import {Type} from 'facade/lang';
// import {ElementServicesFunction} from './facade';
import {ABSTRACT, CONST} from 'facade/lang';


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
      lightDomServices:ElementServicesFunction,
      implementsTypes:Array<Type>
    })
  {
    this.selector = selector;
    this.lightDomServices = lightDomServices;
    this.implementsTypes = implementsTypes;
    this.bind = bind;
  }
}
