import { RequestMethod } from './enums';
export declare function normalizeMethodName(method: any): RequestMethod;
export declare const isSuccess: (status: number) => boolean;
export declare function getResponseURL(xhr: any): string;
export { isJsObject } from 'angular2/src/facade/lang';
