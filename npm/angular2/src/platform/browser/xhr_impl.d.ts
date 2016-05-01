import { XHR } from 'angular2/src/compiler/xhr';
export declare class XHRImpl extends XHR {
    get(url: string): Promise<string>;
}
