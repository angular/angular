/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, computed, input, linkedSignal} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {TransferStateValue} from '../../../../../protocol';

type ValueKind = 'primitive' | 'object' | 'array';

interface Entry {
  key: string;
  value: TransferStateValue;
}

@Component({
  selector: 'ng-json-value',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, JsonValueComponent],
  template: `
    @switch (kind()) {
      @case ('primitive') {
        <span class="json-primitive json-{{ primitiveType() }}">{{ formatted() }}</span>
      }
      @default {
        <span class="json-container">
          <button
            type="button"
            class="json-toggle"
            (click)="toggle()"
            [attr.aria-expanded]="expanded()"
            [attr.aria-label]="expanded() ? 'Collapse' : 'Expand'"
          >
            <mat-icon>{{ expanded() ? 'expand_more' : 'chevron_right' }}</mat-icon>
          </button>
          <span class="json-preview" (click)="toggle()">{{ preview() }}</span>
          @if (expanded()) {
            <ul class="json-children">
              @for (entry of entries(); track entry.key) {
                <li class="json-entry">
                  <span class="json-key">{{ entry.key }}:</span>
                  <ng-json-value [value]="entry.value" />
                </li>
              }
            </ul>
          }
        </span>
      }
    }
  `,
  styleUrl: './json-value.component.scss',
})
export class JsonValueComponent {
  readonly value = input.required<TransferStateValue>();
  readonly autoExpand = input(false);

  protected readonly kind = computed<ValueKind>(() => {
    const v = this.value();
    if (Array.isArray(v)) return 'array';
    if (v !== null && typeof v === 'object') return 'object';
    return 'primitive';
  });

  protected readonly primitiveType = computed(() => {
    const v = this.value();
    if (v === null) return 'null';
    if (v === undefined) return 'undefined';
    return typeof v;
  });

  protected readonly formatted = computed(() => {
    const v = this.value();
    if (v === null) return 'null';
    if (v === undefined) return 'undefined';
    if (typeof v === 'string') return `"${v}"`;
    return String(v);
  });

  protected readonly entries = computed<Entry[]>(() => {
    const v = this.value();
    if (Array.isArray(v)) {
      return v.map((item, i) => ({key: String(i), value: item as TransferStateValue}));
    }
    if (v !== null && typeof v === 'object') {
      return Object.entries(v as Record<string, unknown>).map(([key, value]) => ({
        key,
        value: value as TransferStateValue,
      }));
    }
    return [];
  });

  protected readonly preview = computed(() => {
    const k = this.kind();
    const count = this.entries().length;
    if (k === 'array') {
      return count === 0 ? '[]' : `Array(${count})`;
    }
    return count === 0 ? '{}' : `Object {${count}}`;
  });

  protected readonly expanded = linkedSignal(() => this.autoExpand());

  protected toggle(): void {
    this.expanded.update((v) => !v);
  }
}
