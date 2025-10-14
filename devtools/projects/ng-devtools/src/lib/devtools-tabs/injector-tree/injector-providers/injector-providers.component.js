/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatTableModule} from '@angular/material/table';
import {MatTooltip} from '@angular/material/tooltip';
import {MessageBus} from '../../../../../../protocol';
import {ButtonComponent} from '../../../shared/button/button.component';
let InjectorProvidersComponent = class InjectorProvidersComponent {
  constructor() {
    this.injector = input.required();
    this.providers = input([]);
    this.close = output();
    this.searchToken = signal('');
    this.searchType = signal('');
    this.visibleProviders = computed(() => {
      const searchToken = this.searchToken().toLowerCase();
      const searchType = this.searchType();
      const predicates = [];
      searchToken &&
        predicates.push((provider) => provider.token.toLowerCase().includes(searchToken));
      searchType && predicates.push((provider) => provider.type === searchType);
      return this.providers().filter((provider) =>
        predicates.every((predicate) => predicate(provider)),
      );
    });
    this.providerTypeToLabel = {
      type: 'Type',
      existing: 'useExisting',
      factory: 'useFactory',
      class: 'useClass',
      value: 'useValue',
    };
    this.providerTypes = Object.keys(this.providerTypeToLabel);
    this.messageBus = inject(MessageBus);
  }
  select(row) {
    const {id, type, name} = this.injector();
    this.messageBus.emit('logProvider', [{id, type, name}, row]);
  }
  get displayedColumns() {
    if (this.injector()?.type === 'element') {
      return ['token', 'type', 'isViewProvider', 'log'];
    }
    return ['token', 'type', 'log'];
  }
};
InjectorProvidersComponent = __decorate(
  [
    Component({
      selector: 'ng-injector-providers',
      templateUrl: './injector-providers.component.html',
      styleUrl: './injector-providers.component.scss',
      imports: [MatTableModule, MatIcon, MatTooltip, ButtonComponent],
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ],
  InjectorProvidersComponent,
);
export {InjectorProvidersComponent};
//# sourceMappingURL=injector-providers.component.js.map
