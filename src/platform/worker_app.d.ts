import { NgZone } from 'angular2/src/core/zone/ng_zone';
import { Type } from 'angular2/src/facade/lang';
import { Provider } from 'angular2/src/core/di';
export declare function setupWebWorker(zone: NgZone): Promise<Array<Type | Provider | any[]>>;
