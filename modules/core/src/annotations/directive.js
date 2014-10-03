// import {Type} from 'facade/lang';
// import {ElementServicesFunction} from './facade';
import {ABSTRACT, CONST} from 'facade/lang';


@ABSTRACT()
export class Directive {
  @CONST()
  constructor({
      selector,
      lightDomServices,
      implementsTypes
    }:{
      selector:String,
      lightDomServices:ElementServicesFunction,
      implementsTypes:Array<Type>
    })
  {
    this.selector = selector;
    this.lightDomServices = lightDomServices;
    this.implementsTypes = implementsTypes;
  }
}
