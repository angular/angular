/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  inject,
  signal,
  computed,
  linkedSignal,
  ChangeDetectionStrategy,
} from '@angular/core';
import {Clipboard} from '@angular/cdk/clipboard';
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
import {ButtonComponent} from '../../shared/button/button.component';
import {Events, MessageBus, TransferStateValue} from '../../../../../protocol';
import {formatBytes, getFormattedValue} from '../../shared/utils/formatting';

interface TransferStateItem {
  key: string;
  value: TransferStateValue;
  type: string;
  size: string;
  isExpanded?: boolean;
  isCopied?: boolean;
}

export const LINE_CLAMP_LIMIT = 5;
export const COPY_FEEDBACK_TIMEOUT = 2000;

@Component({
  selector: 'ng-transfer-state',
  standalone: true,
  imports: [
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
    ButtonComponent,
  ],
  templateUrl: './transfer-state.component.html',
  styleUrls: ['./transfer-state.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransferStateComponent {
  private messageBus = inject(MessageBus) as MessageBus<Events>;
  private clipboard = inject(Clipboard);

  readonly transferStateData = signal<Record<string, TransferStateValue> | null>(null);
  readonly error = signal<string | null>(null);
  readonly isLoading = computed(() => !this.transferStateData() && !this.error());

  readonly transferStateItems = linkedSignal<TransferStateItem[]>(() => {
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
  readonly getFormattedValue = getFormattedValue;

  readonly totalSize = computed(() => {
    const items = this.transferStateItems();
    if (items.length === 0) return '0 B';

    let totalBytes = 0;
    for (const item of items) {
      const str = typeof item.value === 'string' ? item.value : JSON.stringify(item.value);
      totalBytes += new Blob([str]).size;
    }

    return formatBytes(totalBytes);
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
    const str = JSON.stringify(value);
    const bytes = new Blob([str]).size;
    return formatBytes(bytes);
  }

  private loadTransferState(): void {
    this.transferStateData.set(null);
    this.error.set(null);

    try {
      this.messageBus.emit('getTransferState');
      this.messageBus.on('transferStateData', (data: Record<string, TransferStateValue> | null) => {
        this.transferStateData.set(data);
        if (!data) {
          this.error.set(
            'No transfer state found. Make sure you are inspecting a page with Server-Side Rendering (SSR) enabled.',
          );
        }
      });
    } catch (err) {
      this.error.set(`Error loading transfer state: ${err}`);
    }
  }

  refresh(): void {
    this.loadTransferState();
  }

  isValueLong(element: HTMLElement, isExpanded: boolean = false): boolean {
    if (isExpanded) return true;

    return element.scrollHeight > element.clientHeight;
  }

  toggleExpanded(item: TransferStateItem): void {
    this.transferStateItems.update((items) =>
      items.map((i) => (i.key === item.key ? {...i, isExpanded: !i.isExpanded} : i)),
    );
  }

  copyToClipboard(item: TransferStateItem): void {
    try {
      const textToCopy =
        typeof item.value === 'string' ? item.value : JSON.stringify(item.value, null, 2);

      this.clipboard.copy(textToCopy);

      this.transferStateItems.update((items) =>
        items.map((i) => (i.key === item.key ? {...i, isCopied: true} : i)),
      );

      setTimeout(() => {
        this.transferStateItems.update((items) =>
          items.map((i) => (i.key === item.key ? {...i, isCopied: false} : i)),
        );
      }, COPY_FEEDBACK_TIMEOUT);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }
}
