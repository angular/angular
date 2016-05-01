import { OnDestroy } from 'angular2/core';
import { Router } from '../router';
import { RouteSegment } from '../segments';
export declare class RouterLink implements OnDestroy {
    private _routeSegment;
    private _router;
    target: string;
    private _changes;
    private _subscription;
    private href;
    constructor(_routeSegment: RouteSegment, _router: Router);
    ngOnDestroy(): void;
    routerLink: any[];
    onClick(): boolean;
    private _updateTargetUrlAndHref();
}
