/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {
  ClassProvider,
  ExistingProvider,
  FactoryProvider,
  InjectOptions,
  InjectionToken,
  Injector,
  ɵProviderRecord as ProviderRecord,
  Type,
  ValueProvider,
} from '@angular/core';
import {
  SerializedInjectedService,
  SerializedInjector,
  SerializedProviderRecord,
} from '../../../../protocol';
import {ngDebugApiIsSupported, ngDebugClient} from '../shared/ng-debug-api/ng-debug-api';
import {log} from '../shared/utils/log';
import {AngularDevtoolsError} from '../shared/utils/error';
import {elementToDirectiveNames} from '../directive-forest/utils/directive';

const INTERNAL_TOKENS = [
  'ElementRef',
  'Renderer2',
  'ViewContainerRef',
  'DestroyRef',
  'ChangeDetectorRef',
  'Injector',
];

export const injectorToId = new WeakMap<Injector | HTMLElement, string>();
export const nodeInjectorToResolutionPath = new WeakMap<HTMLElement, SerializedInjector[]>();
export const idToInjector = new Map<string, WeakRef<Injector>>();
const injectorFinalizer = new FinalizationRegistry<string>((id) => {
  idToInjector.delete(id);
});
let injectorId = 0;

export function getInjectorId() {
  return `${injectorId++}`;
}

export function getInjectorMetadata(
  injector: Injector,
): ReturnType<NonNullable<ReturnType<typeof ngDebugClient>['ɵgetInjectorMetadata']>> {
  return ngDebugClient().ɵgetInjectorMetadata?.(injector) ?? null;
}

export function getInjectorResolutionPath(injector: Injector): Injector[] {
  const ng = ngDebugClient();
  if (!ngDebugApiIsSupported(ng, 'ɵgetInjectorResolutionPath')) {
    return [];
  }

  return ng.ɵgetInjectorResolutionPath(injector) ?? [];
}

export function getInjectorFromElementNode(element: Node): Injector | null {
  try {
    return ngDebugClient().getInjector?.(element) ?? null;
  } catch {
    return null;
  }
}

export function getInjectorProviders(injector: Injector) {
  if (isNullInjector(injector)) {
    return [];
  }

  return ngDebugClient().ɵgetInjectorProviders!(injector);
}

export function getDependenciesForDirective(
  injector: Injector,
  resolutionPath: {injector: Injector; providers: ProviderRecord[]}[],
  directive: any,
): SerializedInjectedService[] {
  const ng = ngDebugClient();
  if (!ngDebugApiIsSupported(ng, 'ɵgetDependenciesFromInjectable')) {
    return [];
  }

  let dependencies = ng.ɵgetDependenciesFromInjectable(injector, directive)?.dependencies ?? [];
  const uniqueServices = new Set<string>();
  const serializedInjectedServices: SerializedInjectedService[] = [];

  let position = 0;
  for (const dependency of dependencies) {
    const providedIn = dependency.providedIn;
    const foundInjectorIndex = resolutionPath.findIndex((node) => node.injector === providedIn);

    if (foundInjectorIndex === -1) {
      position++;
      continue;
    }

    const providers = resolutionPath[foundInjectorIndex].providers;
    const foundProvider = providers.find((provider) => provider.token === dependency.token);

    // the dependency resolution path is
    // the path from the root injector to the injector that provided the dependency (1)
    // +
    // the import path from the providing injector to the feature module that provided the
    // dependency (2)
    const dependencyResolutionPath: SerializedInjector[] = [
      // (1)
      ...resolutionPath
        .slice(0, foundInjectorIndex + 1)
        .map((node) => serializeInjectorWithId(node.injector)!),

      // (2)
      // We slice the import path to remove the first element because this is the same
      // injector as the last injector in the resolution path.
      ...(foundProvider?.importPath ?? []).slice(1).map((node): SerializedInjector => {
        return {
          type: 'imported-module',
          name: valueToLabel(node),
          id: getInjectorId(),
        };
      }),
    ];

    let flags = dependency.flags as InjectOptions;
    let flagToken = '';
    if (flags !== undefined) {
      if (typeof flags === 'number') {
        flags = {
          optional: !!(flags & 8),
          skipSelf: !!(flags & 4),
          self: !!(flags & 2),
          host: !!(flags & 1),
        };
      }
      flagToken = (['optional', 'skipSelf', 'self', 'host'] as (keyof InjectOptions)[])
        .filter((key) => flags[key])
        .join('-');
    }

    const serviceKey = `${dependency.token}-${flagToken}`;
    if (!uniqueServices.has(serviceKey)) {
      uniqueServices.add(serviceKey);

      const service = {
        token: valueToLabel(dependency.token),
        value: valueToLabel(dependency.value),
        flags,
        position: [position],
        resolutionPath: dependencyResolutionPath,
      };

      serializedInjectedServices.push(service);
    }

    position++;
  }

  return serializedInjectedServices;
}

export function serializeInjector(injector: Injector): Omit<SerializedInjector, 'id'> | null {
  const metadata = getInjectorMetadata(injector);

  if (metadata === null) {
    log.error('Could not serialize injector.', injector);
    return null;
  }

  const providers = getInjectorProviders(injector).length;

  if (metadata.type === 'null') {
    return {type: 'null', name: 'Null Injector', providers: 0};
  }

  if (metadata.type === 'element') {
    const source = metadata.source as HTMLElement;
    const name = stripUnderscore(elementToDirectiveNames(source)[0]);

    return {type: 'element', name, providers};
  }

  if (metadata.type === 'environment') {
    if ((injector as any).scopes instanceof Set) {
      if ((injector as any).scopes.has('platform')) {
        return {type: 'environment', name: 'Platform', providers};
      }

      if ((injector as any).scopes.has('root')) {
        return {type: 'environment', name: 'Root', providers};
      }
    }

    return {type: 'environment', name: stripUnderscore(metadata.source ?? ''), providers};
  }

  log.error('Could not serialize injector.', injector);
  return null;
}

export function serializeProviderRecord(
  providerRecord: ProviderRecord,
  index: number,
  hasImportPath = false,
): SerializedProviderRecord {
  let type: 'type' | 'class' | 'value' | 'factory' | 'existing' | 'internal' = 'type';
  let multi = false;

  if (typeof providerRecord.provider === 'object') {
    if ((providerRecord.provider as ClassProvider).useClass !== undefined) {
      type = 'class';
    } else if ((providerRecord.provider as ValueProvider).useValue !== undefined) {
      type = 'value';
    } else if ((providerRecord.provider as FactoryProvider).useFactory !== undefined) {
      type = 'factory';
    } else if ((providerRecord.provider as ExistingProvider).useExisting !== undefined) {
      type = 'existing';
    }

    if (providerRecord.provider.multi !== undefined) {
      multi = providerRecord.provider.multi;
    }
  } else if (typeof providerRecord.provider === 'function') {
    if (INTERNAL_TOKENS.includes((providerRecord.token as Type<any>).name)) {
      type = 'internal';
    }
  }

  const serializedProvider: {
    token: string;
    type: typeof type;
    multi: boolean;
    isViewProvider: boolean;
    index: number;
    importPath?: string[];
  } = {
    token: valueToLabel(providerRecord.token),
    type,
    multi,
    isViewProvider: providerRecord.isViewProvider,
    index,
  };

  if (hasImportPath) {
    serializedProvider['importPath'] = (providerRecord.importPath ?? []).map((injector) =>
      valueToLabel(injector),
    );
  }

  return serializedProvider;
}

export function getElementInjectorElement(elementInjector: Injector): HTMLElement {
  if (!isElementInjector(elementInjector)) {
    throw new AngularDevtoolsError('Injector is not an element injector');
  }

  return getInjectorMetadata(elementInjector)!.source as HTMLElement;
}

export function isElementInjector(injector: Injector) {
  const metadata = getInjectorMetadata(injector);
  return metadata !== null && metadata.type === 'element';
}

export function serializeResolutionPath(resolutionPath: Injector[]): SerializedInjector[] {
  const serializedResolutionPath: SerializedInjector[] = [];

  for (const injector of resolutionPath) {
    let serializedInjectorWithId: SerializedInjector | null = null;

    if (isElementInjector(injector)) {
      serializedInjectorWithId = serializeElementInjectorWithId(injector);
    } else {
      serializedInjectorWithId = serializeEnvironmentInjectorWithId(injector);
    }

    if (serializedInjectorWithId === null) {
      continue;
    }

    serializedResolutionPath.push(serializedInjectorWithId);
  }

  return serializedResolutionPath;
}

function getOrCreateInjectorId(key: Injector | HTMLElement, injector: Injector): string {
  if (!injectorToId.has(key)) {
    const newId = getInjectorId();
    injectorToId.set(key, newId);
    idToInjector.set(newId, new WeakRef(injector));
    injectorFinalizer.register(injector, newId);
  }
  return injectorToId.get(key)!;
}

function serializeElementInjectorWithId(injector: Injector): SerializedInjector | null {
  const element = getElementInjectorElement(injector);
  const id = getOrCreateInjectorId(element, injector);

  const serializedInjector = serializeInjector(injector);
  if (serializedInjector === null) {
    return null;
  }

  return {id, ...serializedInjector};
}

function serializeInjectorWithId(injector: Injector): SerializedInjector | null {
  if (isElementInjector(injector)) {
    return serializeElementInjectorWithId(injector);
  } else {
    return serializeEnvironmentInjectorWithId(injector);
  }
}

function serializeEnvironmentInjectorWithId(injector: Injector): SerializedInjector | null {
  const id = getOrCreateInjectorId(injector, injector);

  const serializedInjector = serializeInjector(injector);
  if (serializedInjector === null) {
    return null;
  }

  return {id, ...serializedInjector};
}

function isInjectionToken(token: Type<unknown> | InjectionToken<unknown>): boolean {
  return token.constructor.name === 'InjectionToken';
}

function isNullInjector(injector: Injector) {
  const metadata = getInjectorMetadata(injector);
  return metadata !== null && metadata.type === 'null';
}

function valueToLabel(value: any): string {
  if (isInjectionToken(value)) {
    const token = value.toString();

    // This logic relies on the current InjectionToken.toString implementation.
    if (token.startsWith('InjectionToken')) {
      const tokenName = token.replace('InjectionToken', '').trim();
      return `InjectionToken (${tokenName})`;
    }
    return token;
  }

  if (typeof value === 'object') {
    return stripUnderscore(value.constructor.name);
  }

  if (typeof value === 'function') {
    return stripUnderscore(value.name);
  }

  if (typeof value !== 'string') {
    return String(value);
  }

  return stripUnderscore(value);
}

function stripUnderscore(str: string): string {
  if (str.startsWith('_')) {
    return str.slice(1);
  }

  return str;
}
