import { ViewContainerRef, ComponentFactory, ResolvedReflectiveProvider } from '@angular/core';
import { RouterOutletMap } from '../router_outlet_map';
export declare class RouterOutlet {
    private location;
    private activated;
    outletMap: RouterOutletMap;
    constructor(parentOutletMap: RouterOutletMap, location: ViewContainerRef, name: string);
    readonly isActivated: boolean;
    readonly component: Object;
    deactivate(): void;
    activate(factory: ComponentFactory<any>, providers: ResolvedReflectiveProvider[], outletMap: RouterOutletMap): void;
}
