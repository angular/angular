export declare const RouterUpgradeInitializer: {
    provide: InjectionToken<((compRef: ComponentRef<any>) => void)[]>;
    multi: boolean;
    useFactory: (ngUpgrade: UpgradeModule) => () => void;
    deps: (typeof UpgradeModule)[];
};

export declare function setUpLocationSync(ngUpgrade: UpgradeModule, urlType?: 'path' | 'hash'): void;
