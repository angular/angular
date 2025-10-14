/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { TransferStateValue } from '../../../../../protocol';
import { getFormattedValue } from '../../shared/utils/formatting';
interface TransferStateItem {
    key: string;
    value: TransferStateValue;
    type: string;
    size: string;
    isExpanded?: boolean;
    isCopied?: boolean;
}
export declare const LINE_CLAMP_LIMIT = 5;
export declare const COPY_FEEDBACK_TIMEOUT = 2000;
export declare class TransferStateComponent {
    private messageBus;
    private clipboard;
    readonly transferStateData: import("@angular/core").WritableSignal<Record<string, TransferStateValue> | null>;
    readonly error: import("@angular/core").WritableSignal<string | null>;
    readonly isLoading: import("@angular/core").Signal<boolean>;
    readonly transferStateItems: import("@angular/core").WritableSignal<TransferStateItem[]>;
    readonly hasData: import("@angular/core").Signal<boolean>;
    readonly getFormattedValue: typeof getFormattedValue;
    readonly totalSize: import("@angular/core").Signal<string>;
    displayedColumns: string[];
    constructor();
    private getValueType;
    getValueSize(value: TransferStateValue): string;
    private loadTransferState;
    isValueLong(element: HTMLElement, isExpanded?: boolean): boolean;
    toggleExpanded(item: TransferStateItem): void;
    copyToClipboard(item: TransferStateItem): void;
}
export {};
