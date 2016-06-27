/** @experimental */
export declare class UpgradeAdapter {
    addProvider(provider: Type | Provider | any[] | any): void;
    bootstrap(element: Element, modules?: any[], config?: angular.IAngularBootstrapConfig): UpgradeAdapterRef;
    downgradeNg2Component(type: Type): Function;
    downgradeNg2Provider(token: any): Function;
    upgradeNg1Component(name: string): Type;
    upgradeNg1Provider(name: string, options?: {
        asToken: any;
    }): void;
}

/** @experimental */
export declare class UpgradeAdapterRef {
    ng1Injector: angular.IInjectorService;
    ng1RootScope: angular.IRootScopeService;
    ng2ApplicationRef: ApplicationRef;
    ng2Injector: Injector;
    dispose(): void;
    ready(fn: (upgradeAdapterRef?: UpgradeAdapterRef) => void): void;
}
