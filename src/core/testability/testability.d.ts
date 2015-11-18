import { NgZone } from '../zone/ng_zone';
/**
 * The Testability service provides testing hooks that can be accessed from
 * the browser and by services such as Protractor. Each bootstrapped Angular
 * application on the page will have an instance of Testability.
 */
export declare class Testability {
    constructor(_ngZone: NgZone);
    increasePendingRequestCount(): number;
    decreasePendingRequestCount(): number;
    isStable(): boolean;
    whenStable(callback: Function): void;
    getPendingRequestCount(): number;
    isAngularEventPending(): boolean;
    findBindings(using: any, provider: string, exactMatch: boolean): any[];
    findProviders(using: any, provider: string, exactMatch: boolean): any[];
}
export declare class TestabilityRegistry {
    constructor();
    registerApplication(token: any, testability: Testability): void;
    getTestability(elem: any): Testability;
    getAllTestabilities(): Testability[];
    findTestabilityInTree(elem: Node, findInAncestors?: boolean): Testability;
}
export interface GetTestability {
    addToWindow(registry: TestabilityRegistry): void;
    findTestabilityInTree(registry: TestabilityRegistry, elem: any, findInAncestors: boolean): Testability;
}
export declare function setTestabilityGetter(getter: GetTestability): void;
