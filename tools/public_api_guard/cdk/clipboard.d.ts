export declare class CdkCopyToClipboard {
    copied: EventEmitter<boolean>;
    text: string;
    constructor(_clipboard: Clipboard);
    copy(): void;
}

export declare class Clipboard {
    constructor(document: any);
    beginCopy(text: string): PendingCopy;
    copy(text: string): boolean;
}

export declare class ClipboardModule {
}

export declare class PendingCopy {
    constructor(text: string, _document: Document);
    copy(): boolean;
    destroy(): void;
}
