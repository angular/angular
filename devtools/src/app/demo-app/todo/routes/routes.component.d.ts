/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ActivatedRoute } from '@angular/router';
export declare class RoutesHomeComponent {
    private activatedRoute;
    routeData: any;
    routeParams: any;
    queryParams: any;
    routeQueryParmas: {
        message: string;
    };
    constructor(activatedRoute: ActivatedRoute);
    ngOnInit(): void;
}
export declare class RoutesAuxComponent {
}
export declare class RoutesOneComponent {
}
export declare class RoutesTwoComponent {
}
export declare class RoutesStandaloneComponent {
}
export declare class Service1 {
    value: string;
}
export declare class Service2 {
    value: string;
}
export declare class Service3 {
    value: string;
}
export declare class Service4 {
    value: string;
}
