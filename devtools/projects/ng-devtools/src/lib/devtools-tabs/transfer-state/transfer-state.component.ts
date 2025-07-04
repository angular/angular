/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, inject, signal, computed, ChangeDetectionStrategy} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {
  MatTable,
  MatHeaderCell,
  MatCell,
  MatHeaderRow,
  MatRow,
  MatColumnDef,
  MatHeaderCellDef,
  MatCellDef,
  MatHeaderRowDef,
  MatRowDef,
} from '@angular/material/table';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';
import {CommonModule} from '@angular/common';
import {Events, MessageBus, TransferStateValue} from '../../../../../protocol';

interface TransferStateItem {
  key: string;
  value: TransferStateValue;
  type: string;
  size: string;
  isExpanded?: boolean;
  isCopied?: boolean;
}

@Component({
  selector: 'ng-transfer-state',
  imports: [
    CommonModule,
    MatIcon,
    MatTooltip,
    MatTable,
    MatHeaderCell,
    MatCell,
    MatHeaderRow,
    MatRow,
    MatColumnDef,
    MatHeaderCellDef,
    MatCellDef,
    MatHeaderRowDef,
    MatRowDef,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
  ],
  templateUrl: './transfer-state.component.html',
  styleUrls: ['./transfer-state.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransferStateComponent {
  private _messageBus = inject(MessageBus) as MessageBus<Events>;
  readonly MAX_DISPLAY_LENGTH = 200;

  readonly transferStateData = signal<Record<string, TransferStateValue> | null>(null);
  readonly error = signal<string | null>(null);
  readonly isLoading = signal(false);

  readonly transferStateItems = computed<TransferStateItem[]>(() => {
    const data = this.transferStateData();
    if (!data) return [];

    return Object.entries(data).map(([key, value]) => ({
      key,
      value,
      type: this.getValueType(value),
      size: this.getValueSize(value),
      isExpanded: false,
      isCopied: false,
    }));
  });

  readonly hasData = computed(() => this.transferStateItems().length > 0);

  readonly totalSize = computed(() => {
    const items = this.transferStateItems();
    if (items.length === 0) return '0 B';

    let totalBytes = 0;
    for (const item of items) {
      const str = typeof item.value === 'string' ? item.value : JSON.stringify(item.value);
      totalBytes += new Blob([str]).size;
    }

    if (totalBytes < 1024) return `${totalBytes} B`;
    if (totalBytes < 1024 * 1024) return `${(totalBytes / 1024).toFixed(1)} KB`;
    return `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`;
  });

  displayedColumns: string[] = ['key', 'type', 'size', 'value'];

  constructor() {
    this.loadTransferState();
  }

  private getValueType(value: TransferStateValue): string {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  }

  getValueSize(value: TransferStateValue): string {
    try {
      const str = JSON.stringify(value);
      const bytes = new Blob([str]).size;
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    } catch {
      return 'unknown';
    }
  }

  private formatValue(value: TransferStateValue, isExpanded = false): string {
    const formatters = {
      null: () => 'null',
      undefined: () => 'undefined',
      string: (val: string) => `"${val}"`,
      object: (val: object) => JSON.stringify(val, null, 2),
      default: (val: unknown) => String(val),
    };

    const getFormattedValue = (val: TransferStateValue): string => {
      if (val === null) return formatters.null();
      if (val === undefined) return formatters.undefined();
      if (typeof val === 'string') return formatters.string(val);
      if (typeof val === 'object') return formatters.object(val);
      return formatters.default(val);
    };

    const formatted = getFormattedValue(value);

    return this.truncateIfNeeded(formatted, isExpanded);
  }

  private truncateIfNeeded(text: string, isExpanded: boolean): string {
    if (isExpanded || text.length <= this.MAX_DISPLAY_LENGTH) {
      return text;
    }

    return text.substring(0, this.MAX_DISPLAY_LENGTH) + '...';
  }

  loadTransferState(): void {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      this._messageBus.emit('getTransferState');
      this._messageBus.on(
        'transferStateData',
        (data: Record<string, TransferStateValue> | null) => {
          this.transferStateData.set(data);
          this.isLoading.set(false);
          if (!data) {
            this.error.set(
              'No transfer state found. Make sure you are inspecting a page with Server-Side Rendering (SSR) enabled.',
            );
          }
        },
      );
    } catch (err) {
      this.error.set(`Error loading transfer state: ${err}`);
      this.isLoading.set(false);
    }
  }

  refresh(): void {
    this.loadTransferState();
  }

  getFormattedValue(item: TransferStateItem): string {
    return this.formatValue(item.value, item.isExpanded);
  }

  isValueLong(value: TransferStateValue): boolean {
    const formatted = this.formatValue(value, true);
    return formatted.length > this.MAX_DISPLAY_LENGTH;
  }

  toggleExpanded(item: TransferStateItem): void {
    item.isExpanded = !item.isExpanded;
  }

  async copyToClipboard(item: TransferStateItem): Promise<void> {
    try {
      const textToCopy =
        typeof item.value === 'string' ? item.value : JSON.stringify(item.value, null, 2);
      await navigator.clipboard.writeText(textToCopy);

      item.isCopied = true;
      setTimeout(() => {
        item.isCopied = false;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      item.isCopied = true;
      setTimeout(() => {
        item.isCopied = false;
      }, 2000);
    }
  }
}
