/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, computed, inject, input, signal} from '@angular/core';
import {MatOption} from '@angular/material/core';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInput} from '@angular/material/input';
import {MatSelect} from '@angular/material/select';
import {MatTableModule} from '@angular/material/table';
import {MatTooltip} from '@angular/material/tooltip';
import {Events, MessageBus, SerializedInjector, SerializedProviderRecord} from 'protocol';

@Component({
  selector: 'ng-injector-providers',
  template: `
    <h1>Providers for {{ injector()?.name }}</h1>
    @if (injector()) {
    <div class="injector-providers">
      <mat-form-field appearance="fill" class="form-field-spacer">
        <mat-label>Search by token</mat-label>
        <input
          type="text"
          matInput
          placeholder="Provider token"
          (input)="searchToken.set($event.target.value)"
          [value]="searchToken()"
        />
        <mat-icon matSuffix (click)="searchToken.set('')">close</mat-icon>
      </mat-form-field>
      <mat-form-field class="form-field-spacer">
        <mat-label>Search by type</mat-label>
        <mat-select [value]="searchType()" (selectionChange)="searchType.set($event.value)">
          <mat-option>None</mat-option>
          @for (type of providerTypes; track type) {
          <mat-option [value]="type">{{ $any(providerTypeToLabel)[type] }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      @if (visibleProviders().length > 0) {
      <table mat-table [dataSource]="visibleProviders()" class="mat-elevation-z4">
        <ng-container matColumnDef="token">
          <th mat-header-cell *matHeaderCellDef><h3 class="column-title">Token</h3></th>
          <td mat-cell *matCellDef="let provider">{{ provider.token }}</td>
        </ng-container>
        <ng-container matColumnDef="type">
          <th mat-header-cell *matHeaderCellDef><h3 class="column-title">Type</h3></th>
          <td mat-cell *matCellDef="let provider">
            @if (provider.type === 'multi') { multi (x{{ provider.index.length }}) } @else {
            {{ $any(providerTypeToLabel)[provider.type] }}
            }
          </td>
        </ng-container>
        <ng-container matColumnDef="isViewProvider">
          <th mat-header-cell *matHeaderCellDef><h3 class="column-title">Is View Provider</h3></th>
          <td mat-cell *matCellDef="let provider">
            <mat-icon>{{ provider.isViewProvider ? 'check_circle' : 'cancel' }}</mat-icon>
          </td>
        </ng-container>
        <ng-container matColumnDef="log">
          <th mat-header-cell *matHeaderCellDef><h3 class="column-title"></h3></th>
          <td mat-cell *matCellDef="let provider">
            <mat-icon
              matTooltipPosition="left"
              matTooltip="Log provider in console"
              class="select"
              (click)="select(provider)"
              >send</mat-icon
            >
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
      </table>
      }
    </div>
    }
  `,
  styles: [
    `
      .select {
        cursor: pointer;
      }

      :host {
        display: block;
        padding: 16px;
      }

      .form-field-spacer {
        margin: 0 4px 0 4px;
      }

      table {
        width: 100%;
      }

      .column-title {
        margin: 0;
      }

      tr.example-detail-row {
        height: 0;
      }

      .example-element-row td {
        border-bottom-width: 0;
        cursor: pointer;
      }

      .example-element-detail {
        overflow: hidden;
        display: flex;
      }

      .example-element-diagram {
        min-width: 80px;
        border: 2px solid black;
        padding: 8px;
        font-weight: lighter;
        margin: 8px 0;
        height: 104px;
      }

      .example-element-symbol {
        font-weight: bold;
        font-size: 40px;
        line-height: normal;
      }

      .example-element-description {
        padding: 16px;
      }

      .example-element-description-attribution {
        opacity: 0.5;
      }
    `,
  ],
  imports: [
    MatTableModule,
    MatIcon,
    MatTooltip,
    MatInput,
    MatSelect,
    MatFormField,
    MatLabel,
    MatOption,
  ],
})
export class InjectorProvidersComponent {
  readonly injector = input.required<SerializedInjector>();
  readonly providers = input<SerializedProviderRecord[]>([]);

  readonly searchToken = signal('');
  readonly searchType = signal('');
  readonly visibleProviders = computed(() => {
    const searchToken = this.searchToken().toLowerCase();
    const searchType = this.searchType();

    const predicates: ((provider: SerializedProviderRecord) => boolean)[] = [];
    searchToken &&
      predicates.push((provider) => provider.token.toLowerCase().includes(searchToken));
    searchType && predicates.push((provider) => provider.type === searchType);

    return this.providers().filter((provider) =>
      predicates.every((predicate) => predicate(provider)),
    );
  });

  providerTypeToLabel = {
    type: 'Type',
    existing: 'useExisting',
    factory: 'useFactory',
    class: 'useClass',
    value: 'useValue',
  };

  providerTypes = Object.keys(this.providerTypeToLabel);

  messageBus = inject<MessageBus<Events>>(MessageBus);

  select(row: SerializedProviderRecord) {
    const {id, type, name} = this.injector();
    this.messageBus.emit('logProvider', [{id, type, name}, row]);
  }

  get displayedColumns(): string[] {
    if (this.injector()?.type === 'element') {
      return ['token', 'type', 'isViewProvider', 'log'];
    }
    return ['token', 'type', 'log'];
  }
}
