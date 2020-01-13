export declare class FakeMatIconRegistry implements PublicApi<MatIconRegistry>, OnDestroy {
    addSvgIcon(): this;
    addSvgIconInNamespace(): this;
    addSvgIconLiteral(): this;
    addSvgIconLiteralInNamespace(): this;
    addSvgIconSet(): this;
    addSvgIconSetInNamespace(): this;
    addSvgIconSetLiteral(): this;
    addSvgIconSetLiteralInNamespace(): this;
    classNameForFontAlias(alias: string): string;
    getDefaultFontSetClass(): string;
    getNamedSvgIcon(): Observable<SVGElement>;
    getSvgIconFromUrl(): Observable<SVGElement>;
    ngOnDestroy(): void;
    registerFontClassAlias(): this;
    setDefaultFontSetClass(): this;
    static ɵfac: i0.ɵɵFactoryDef<FakeMatIconRegistry>;
    static ɵprov: i0.ɵɵInjectableDef<FakeMatIconRegistry>;
}

export declare class MatIconTestingModule {
    static ɵinj: i0.ɵɵInjectorDef<MatIconTestingModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MatIconTestingModule, never, never, never>;
}
