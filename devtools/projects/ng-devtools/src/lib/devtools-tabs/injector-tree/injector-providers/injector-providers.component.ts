/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, computed, inject, input, signal} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {MatTableModule} from '@angular/material/table';
import {MatTooltip} from '@angular/material/tooltip';
import {
  Events,
  MessageBus,
  SerializedInjector,
  SerializedProviderRecord,
} from '../../../../../../protocol';
import {ButtonComponent} from '../../../shared/button/button.component';

@Component({
  selector: 'ng-injector-providers',
  templateUrl: './injector-providers.component.html',
  styleUrl: './injector-providers.component.scss',
  imports: [MatTableModule, MatIcon, MatTooltip, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
