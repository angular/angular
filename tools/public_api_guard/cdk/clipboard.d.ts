export declare class CdkCopyToClipboard {
    _deprecatedCopied: EventEmitter<boolean>;
    copied: EventEmitter<boolean>;
    text: string;
    constructor(_clipboard: Clipboard);
    copy(): void;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<CdkCopyToClipboard, "[cdkCopyToClipboard]", never, { 'text': "cdkCopyToClipboard" }, { 'copied': "cdkCopyToClipboardCopied", '_deprecatedCopied': "copied" }, never>;
    static ɵfac: i0.ɵɵFactoryDef<CdkCopyToClipboard>;
}

export declare class Clipboard {
    constructor(document: any);
    beginCopy(text: string): PendingCopy;
    copy(text: string): boolean;
    static ɵfac: i0.ɵɵFactoryDef<Clipboard>;
    static ɵprov: i0.ɵɵInjectableDef<Clipboard>;
}

export declare class ClipboardModule {
    static ɵinj: i0.ɵɵInjectorDef<ClipboardModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<ClipboardModule, [typeof i1.CdkCopyToClipboard], [typeof i2.CommonModule], [typeof i1.CdkCopyToClipboard]>;
}

export declare class PendingCopy {
    constructor(text: string, _document: Document);
    copy(): boolean;
    destroy(): void;
}
