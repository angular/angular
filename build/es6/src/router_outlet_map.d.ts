import { RouterOutlet } from './directives/router_outlet';
export declare class RouterOutletMap {
    _outlets: {
        [name: string]: RouterOutlet;
    };
    registerOutlet(name: string, outlet: RouterOutlet): void;
}
