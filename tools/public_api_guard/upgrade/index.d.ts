export declare class UpgradeAdapter {
    downgradeNg2Component(type: Type): Function;
    upgradeNg1Component(name: string): Type;
    bootstrap(element: Element, modules?: any[], config?: angular.IAngularBootstrapConfig): UpgradeAdapterRef;
    addProvider(provider: Type | Provider | any[] | any): void;
    upgradeNg1Provider(name: string, options?: {
        asToken: any;
    }): void;
    downgradeNg2Provider(token: any): Function;
}

export declare class UpgradeAdapterRef {
    ng1RootScope: angular.IRootScopeService;
    ng1Injector: angular.IInjectorService;
    ng2ApplicationRef: ApplicationRef;
    ng2Injector: Injector;
    ready(fn: (upgradeAdapterRef?: UpgradeAdapterRef) => void): void;
    dispose(): void;
}
