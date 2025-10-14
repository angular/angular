/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
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
import {MessageBus} from '../../../../../protocol';
import {formatBytes, getFormattedValue} from '../../shared/utils/formatting';
export const LINE_CLAMP_LIMIT = 5;
export const COPY_FEEDBACK_TIMEOUT = 2000;
let TransferStateComponent = class TransferStateComponent {
  constructor() {
    this.messageBus = inject(MessageBus);
    this.clipboard = inject(Clipboard);
    this.transferStateData = signal(null);
    this.error = signal(null);
    this.isLoading = computed(() => !this.transferStateData() && !this.error());
    this.transferStateItems = linkedSignal(() => {
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
    this.hasData = computed(() => this.transferStateItems().length > 0);
    this.getFormattedValue = getFormattedValue;
    this.totalSize = computed(() => {
      const items = this.transferStateItems();
      if (items.length === 0) return '0 B';
      let totalBytes = 0;
      for (const item of items) {
        const str = typeof item.value === 'string' ? item.value : JSON.stringify(item.value);
        totalBytes += new Blob([str]).size;
      }
      return formatBytes(totalBytes);
    });
    this.displayedColumns = ['key', 'type', 'size', 'value'];
    this.loadTransferState();
  }
  getValueType(value) {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  }
  getValueSize(value) {
    const str = JSON.stringify(value);
    const bytes = new Blob([str]).size;
    return formatBytes(bytes);
  }
  loadTransferState() {
    this.transferStateData.set(null);
    this.error.set(null);
    try {
      this.messageBus.emit('getTransferState');
      this.messageBus.on('transferStateData', (data) => {
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
  isValueLong(element, isExpanded = false) {
    if (isExpanded) return true;
    return element.scrollHeight > element.clientHeight;
  }
  toggleExpanded(item) {
    this.transferStateItems.update((items) =>
      items.map((i) => (i.key === item.key ? {...i, isExpanded: !i.isExpanded} : i)),
    );
  }
  copyToClipboard(item) {
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
};
TransferStateComponent = __decorate(
  [
    Component({
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
    }),
  ],
  TransferStateComponent,
);
export {TransferStateComponent};
//# sourceMappingURL=transfer-state.component.js.map
