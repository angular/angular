import { Promise } from 'angular2/src/facade/promise';
import { XHR } from 'angular2/src/compiler/xhr';
export declare class XHRImpl extends XHR {
    get(url: string): Promise<string>;
}
