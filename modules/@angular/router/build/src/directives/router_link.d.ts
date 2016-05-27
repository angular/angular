import { Router } from '../router';
import { ActivatedRoute } from '../router_state';
export declare class RouterLink {
    private router;
    private route;
    target: string;
    private commands;
    href: string;
    constructor(router: Router, route: ActivatedRoute);
    routerLink: any[] | string;
    onClick(): boolean;
    private updateTargetUrlAndHref();
}
