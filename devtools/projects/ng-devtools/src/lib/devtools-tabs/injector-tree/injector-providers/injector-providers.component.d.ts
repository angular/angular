/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Events, MessageBus, SerializedInjector, SerializedProviderRecord } from '../../../../../../protocol';
export declare class InjectorProvidersComponent {
    readonly injector: import("@angular/core").InputSignal<SerializedInjector>;
    readonly providers: import("@angular/core").InputSignal<SerializedProviderRecord[]>;
    protected readonly close: import("@angular/core").OutputEmitterRef<void>;
    readonly searchToken: import("@angular/core").WritableSignal<string>;
    readonly searchType: import("@angular/core").WritableSignal<string>;
    readonly visibleProviders: import("@angular/core").Signal<SerializedProviderRecord[]>;
    providerTypeToLabel: {
        type: string;
        existing: string;
        factory: string;
        class: string;
        value: string;
    };
    providerTypes: string[];
    messageBus: MessageBus<Events>;
    select(row: SerializedProviderRecord): void;
    get displayedColumns(): string[];
}
