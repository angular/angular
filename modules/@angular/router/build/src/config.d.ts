import { Type } from '@angular/core';
export declare type RouterConfig = Route[];
export interface Route {
    index?: boolean;
    path?: string;
    component: Type | string;
    outlet?: string;
    canActivate?: any[];
    canDeactivate?: any[];
    children?: Route[];
}
