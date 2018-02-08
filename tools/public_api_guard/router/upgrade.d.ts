/** @experimental */
export declare const RouterUpgradeInitializer: {
    provide: InjectionToken<((compRef: ComponentRef<any>) => void)[]>;
    multi: boolean;
    useFactory: typeof locationSyncBootstrapListener;
    deps: (typeof UpgradeModule)[];
};

/** @experimental */
export declare function setUpLocationSync(ngUpgrade: UpgradeModule): void;
