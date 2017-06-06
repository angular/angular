import { Injector } from 'angular2/src/core/di/injector';
import { AppView } from './view';
export declare class ElementInjector extends Injector {
    private _view;
    private _nodeIndex;
    constructor(_view: AppView<any>, _nodeIndex: number);
    get(token: any, notFoundValue?: any): any;
}
