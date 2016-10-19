/** @stable */
export declare class UpgradeAdapter {
    constructor(ng2AppModule: Type<any>, compilerOptions?: CompilerOptions);
    bootstrap(element: Element, modules?: any[], config?: {
        strictDi?: boolean;
    }): UpgradeAdapterRef;
    downgradeNg2Component(type: Type<any>): any;
    downgradeNg2Provider(token: any): Function;
    upgradeNg1Component(name: string): Type<any>;
    upgradeNg1Provider(name: string, options?: {
        asToken: any;
    }): void;
}

/** @stable */
export declare class UpgradeAdapterRef {
    ng1Injector: any;
    ng1RootScope: any;
    ng2Injector: Injector;
    ng2ModuleRef: NgModuleRef<any>;
    dispose(): void;
    ready(fn: (upgradeAdapterRef?: UpgradeAdapterRef) => void): void;
}
