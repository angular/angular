/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, DestroyRef, inject, signal, computed, linkedSignal} from '@angular/core';
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
import {MatSort, MatSortHeader, Sort} from '@angular/material/sort';
import {FormsModule} from '@angular/forms';
import {ButtonComponent} from '../../shared/button/button.component';
import {Events, MessageBus, TransferStateValue} from '../../../../../protocol';
import {formatBytes} from '../../shared/utils/formatting';
import {MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import {JsonValueComponent} from './json-value.component';

interface TransferStateItem {
  key: string;
  value: TransferStateValue;
  type: string;
  size: string;
  bytes: number | null;
  isCopied?: boolean;
}

export const COPY_FEEDBACK_TIMEOUT = 2000;
export const LOADING_TIMEOUT = 5000;

/**
 * Returns the UTF-8 byte size of a transfer state value, or null if the value
 * cannot be measured (undefined, or contains a circular reference).
 */
function getByteSize(value: TransferStateValue): number | null {
  if (value === undefined) return 0;
  let str: string;
  if (typeof value === 'string') {
    str = value;
  } else {
    try {
      const serialized = JSON.stringify(value);
      if (serialized === undefined) return null;
      str = serialized;
    } catch {
      return null;
    }
  }
  return new Blob([str]).size;
}

@Component({
  selector: 'ng-transfer-state',
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
    MatSort,
    MatSortHeader,
    FormsModule,
    ButtonComponent,
    MatSnackBarModule,
    JsonValueComponent,
  ],
  templateUrl: './transfer-state.component.html',
  styleUrls: ['./transfer-state.component.scss'],
})
export class TransferStateComponent {
  private readonly messageBus = inject(MessageBus) as MessageBus<Events>;
  private readonly clipboard = inject(Clipboard);
  private readonly snackBar = inject(MatSnackBar);

  readonly transferStateData = signal<Record<string, TransferStateValue> | null>(null);
  readonly error = signal<string | null>(null);
  readonly isLoading = computed(() => this.transferStateData() === null);

  readonly transferStateItems = linkedSignal<TransferStateItem[]>(() => {
    const data = this.transferStateData();
    if (!data) return [];

    return Object.entries(data).map(([key, value]) => {
      const bytes = getByteSize(value);
      return {
        key,
        value,
        type: this.getValueType(value),
        size: bytes === null ? '—' : formatBytes(bytes),
        bytes,
        isCopied: false,
      };
    });
  });

  readonly hasData = computed(() => this.transferStateItems().length > 0);

  readonly filterText = signal('');
  readonly sortState = signal<Sort>({active: '', direction: ''});

  readonly visibleItems = computed<TransferStateItem[]>(() => {
    const items = this.transferStateItems();
    const filter = this.filterText().trim().toLowerCase();
    const filtered = filter
      ? items.filter((item) => item.key.toLowerCase().includes(filter))
      : items;

    const {active, direction} = this.sortState();
    if (!direction) {
      return filtered;
    }

    const sign = direction === 'asc' ? 1 : -1;
    const compare = (a: TransferStateItem, b: TransferStateItem): number => {
      switch (active) {
        case 'key':
          return sign * a.key.localeCompare(b.key);
        case 'type':
          return sign * a.type.localeCompare(b.type);
        case 'size': {
          const av = a.bytes ?? -1;
          const bv = b.bytes ?? -1;
          return sign * (av - bv);
        }
        default:
          return 0;
      }
    };
    return [...filtered].sort(compare);
  });

  readonly visibleSize = computed(() => {
    const items = this.visibleItems();
    if (items.length === 0) return '0 B';
    let totalBytes = 0;
    for (const item of items) {
      if (item.bytes !== null) {
        totalBytes += item.bytes;
      }
    }
    return formatBytes(totalBytes);
  });

  displayedColumns: string[] = ['key', 'type', 'size', 'value'];

  private loadingTimeoutId: ReturnType<typeof setTimeout> | undefined;
  private readonly copyTimeoutIds = new Set<ReturnType<typeof setTimeout>>();

  constructor() {
    const destroyRef = inject(DestroyRef);

    const off = this.messageBus.on(
      'transferStateData',
      (data: Record<string, TransferStateValue> | null) => {
        this.clearLoadingTimeout();
        this.transferStateData.set(data ?? {});
      },
    );

    destroyRef.onDestroy(() => {
      off();
      this.clearLoadingTimeout();
      this.copyTimeoutIds.forEach(clearTimeout);
      this.copyTimeoutIds.clear();
    });

    this.startLoadingTimeout();

    try {
      this.messageBus.emit('getTransferState');
    } catch (err) {
      this.clearLoadingTimeout();
      this.transferStateData.set({});
      this.error.set(`Error loading transfer state: ${err}`);
    }
  }

  private getValueType(value: TransferStateValue): string {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  }

  onSortChange(sort: Sort): void {
    this.sortState.set(sort);
  }

  clearFilter(): void {
    this.filterText.set('');
  }

  private startLoadingTimeout(): void {
    this.clearLoadingTimeout();
    this.loadingTimeoutId = setTimeout(() => {
      this.loadingTimeoutId = undefined;
      if (this.isLoading()) {
        this.transferStateData.set({});
        this.error.set('The DevTools backend did not respond. Try reopening DevTools.');
      }
    }, LOADING_TIMEOUT);
  }

  private clearLoadingTimeout(): void {
    if (this.loadingTimeoutId !== undefined) {
      clearTimeout(this.loadingTimeoutId);
      this.loadingTimeoutId = undefined;
    }
  }

  copyToClipboard(item: TransferStateItem): void {
    try {
      const textToCopy =
        typeof item.value === 'string' ? item.value : JSON.stringify(item.value, null, 2);

      this.clipboard.copy(textToCopy);

      this.transferStateItems.update((items) =>
        items.map((i) => (i.key === item.key ? {...i, isCopied: true} : i)),
      );

      const timeoutId = setTimeout(() => {
        this.copyTimeoutIds.delete(timeoutId);
        this.transferStateItems.update((items) =>
          items.map((i) => (i.key === item.key ? {...i, isCopied: false} : i)),
        );
      }, COPY_FEEDBACK_TIMEOUT);
      this.copyTimeoutIds.add(timeoutId);
    } catch (err) {
      const message = 'Failed to copy to clipboard';
      const errorDetail =
        err instanceof Error ? `${err.name}: ${err.message}` : JSON.stringify(err);

      this.snackBar.open(message, 'Dismiss', {duration: 3000, horizontalPosition: 'left'});
      this.messageBus.emit('log', [{level: 'error', message: `${message}: ${errorDetail}`}]);
    }
  }
}
