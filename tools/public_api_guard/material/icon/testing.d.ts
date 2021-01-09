export declare class FakeMatIconRegistry implements PublicApi<MatIconRegistry>, OnDestroy {
    addSvgIcon(): this;
    addSvgIconInNamespace(): this;
    addSvgIconLiteral(): this;
    addSvgIconLiteralInNamespace(): this;
    addSvgIconResolver(): this;
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
    static ɵfac: i0.ɵɵFactoryDef<FakeMatIconRegistry, never>;
    static ɵprov: i0.ɵɵInjectableDef<FakeMatIconRegistry>;
}

export interface IconHarnessFilters extends BaseHarnessFilters {
    name?: string | RegExp;
    namespace?: string | null | RegExp;
    type?: IconType;
}

export declare const enum IconType {
    SVG = 0,
    FONT = 1
}

export declare class MatIconHarness extends ComponentHarness {
    getName(): Promise<string | null>;
    getNamespace(): Promise<string | null>;
    getType(): Promise<IconType>;
    isInline(): Promise<boolean>;
    static hostSelector: string;
    static with(options?: IconHarnessFilters): HarnessPredicate<MatIconHarness>;
}

export declare class MatIconTestingModule {
    static ɵinj: i0.ɵɵInjectorDef<MatIconTestingModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<MatIconTestingModule, never, never, never>;
}
