/** @experimental */
export declare const RouterUpgradeInitializer: {
    provide: InjectionToken<((compRef: ComponentRef<any>) => void)[]>;
    multi: boolean;
    useFactory: (ngUpgrade: UpgradeModule) => () => void;
    deps: (typeof UpgradeModule)[];
};

/** @experimental */
export declare function setUpLocationSync(ngUpgrade: UpgradeModule): void;
