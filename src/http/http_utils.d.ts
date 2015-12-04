import { RequestMethods } from './enums';
export declare function normalizeMethodName(method: any): RequestMethods;
export declare const isSuccess: (status: number) => boolean;
export declare function getResponseURL(xhr: any): string;
export { isJsObject } from 'angular2/src/facade/lang';
