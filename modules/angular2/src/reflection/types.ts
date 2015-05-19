import {Type} from 'angular2/src/facade/lang';
import {List} from 'angular2/src/facade/collection';

export {Function as GetterFn};
export {Function as SetterFn};
export {Function as MethodFn};

// TODO replace once dgeni is fixed
/**
export type SetterFn = (obj: any, value: any) => void;
export type GetterFn = (obj: any) => any;
export type MethodFn = (obj: any, args: List<any>) => any;
**/
