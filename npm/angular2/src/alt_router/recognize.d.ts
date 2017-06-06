import { UrlTree, RouteTree } from './segments';
import { Type } from 'angular2/src/facade/lang';
import { ComponentResolver } from 'angular2/core';
export declare function recognize(componentResolver: ComponentResolver, type: Type, url: UrlTree): Promise<RouteTree>;
