export declare class CdkCopyToClipboard implements OnDestroy {
    attempts: number;
    copied: EventEmitter<boolean>;
    text: string;
    constructor(_clipboard: Clipboard, _ngZone: NgZone, config?: CdkCopyToClipboardConfig);
    copy(attempts?: number): void;
    ngOnDestroy(): void;
    static ɵdir: i0.ɵɵDirectiveDefWithMeta<CdkCopyToClipboard, "[cdkCopyToClipboard]", never, { "text": "cdkCopyToClipboard"; "attempts": "cdkCopyToClipboardAttempts"; }, { "copied": "cdkCopyToClipboardCopied"; }, never>;
    static ɵfac: i0.ɵɵFactoryDef<CdkCopyToClipboard, [null, null, { optional: true; }]>;
}

export interface CdkCopyToClipboardConfig {
    attempts?: number;
}

export declare const CKD_COPY_TO_CLIPBOARD_CONFIG: InjectionToken<CdkCopyToClipboardConfig>;

export declare class Clipboard {
    constructor(document: any);
    beginCopy(text: string): PendingCopy;
    copy(text: string): boolean;
    static ɵfac: i0.ɵɵFactoryDef<Clipboard, never>;
    static ɵprov: i0.ɵɵInjectableDef<Clipboard>;
}

export declare class ClipboardModule {
    static ɵinj: i0.ɵɵInjectorDef<ClipboardModule>;
    static ɵmod: i0.ɵɵNgModuleDefWithMeta<ClipboardModule, [typeof i1.CdkCopyToClipboard], never, [typeof i1.CdkCopyToClipboard]>;
}

export declare class PendingCopy {
    constructor(text: string, _document: Document);
    copy(): boolean;
    destroy(): void;
}
