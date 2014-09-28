import {Type} from 'facade/lang';
import {ElementServicesFunction} from './facade';
import {ABSTRACT} from 'facade/lang';


@ABSTRACT
export class Directive {
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
    this.lightDomServices = lightDomServices;
		this.selector = selector;
	}
}
