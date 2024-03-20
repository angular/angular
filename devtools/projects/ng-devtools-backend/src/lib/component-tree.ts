/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {
  ComponentExplorerViewQuery,
  DirectiveMetadata,
  DirectivesProperties,
  ElementPosition,
  PropertyQueryTypes,
  SerializedInjectedService,
  SerializedInjector,
  SerializedProviderRecord,
  UpdatedStateData,
} from 'protocol';

import {buildDirectiveTree, getLViewFromDirectiveOrElementInstance} from './directive-forest/index';
import {
  ngDebugApiIsSupported,
  ngDebugClient,
  ngDebugDependencyInjectionApiIsSupported,
} from './ng-debug-api/ng-debug-api';
import {
  deeplySerializeSelectedProperties,
  serializeDirectiveState,
} from './state-serializer/state-serializer';

// Need to be kept in sync with Angular framework
// We can't directly import it from framework now
// because this also pulls up the security policies
// for Trusted Types, which we reinstantiate.
enum ChangeDetectionStrategy {
  OnPush = 0,
  Default = 1,
}

import {ComponentTreeNode, DirectiveInstanceType, ComponentInstanceType} from './interfaces';

import type {
  ClassProvider,
  ExistingProvider,
  FactoryProvider,
  InjectOptions,
  InjectionToken,
  Injector,
  Type,
  ValueProvider,
  ɵComponentDebugMetadata as ComponentDebugMetadata,
  ɵProviderRecord as ProviderRecord,
} from '@angular/core';
import {isSignal} from './utils';

export const injectorToId = new WeakMap<Injector | HTMLElement, string>();
export const nodeInjectorToResolutionPath = new WeakMap<HTMLElement, SerializedInjector[]>();
export const idToInjector = new Map<string, Injector>();
export const injectorsSeen = new Set<string>();
let injectorId = 0;

export function getInjectorId() {
  return `${injectorId++}`;
}

export function getInjectorMetadata(injector: Injector) {
  return ngDebugClient().ɵgetInjectorMetadata(injector);
}

export function getInjectorResolutionPath(injector: Injector): Injector[] {
  if (!ngDebugApiIsSupported('ɵgetInjectorResolutionPath')) {
    return [];
  }

  return ngDebugClient().ɵgetInjectorResolutionPath(injector);
}

export function getInjectorFromElementNode(element: Node): Injector | null {
  return ngDebugClient().getInjector(element);
}

function getDirectivesFromElement(element: HTMLElement): {
  component: unknown | null;
  directives: unknown[];
} {
  let component = null;
  if (element instanceof Element) {
    component = ngDebugClient().getComponent(element);
  }

  return {
    component,
    directives: ngDebugClient().getDirectives(element),
  };
}

export const getLatestComponentState = (
  query: ComponentExplorerViewQuery,
  directiveForest?: ComponentTreeNode[],
): {directiveProperties: DirectivesProperties} | undefined => {
  // if a directive forest is passed in we don't have to build the forest again.
  directiveForest = directiveForest ?? buildDirectiveForest();

  const node = queryDirectiveForest(query.selectedElement, directiveForest);
  if (!node) {
    return;
  }

  const directiveProperties: DirectivesProperties = {};

  const injector = ngDebugClient().getInjector(node.nativeElement!);

  const injectors = getInjectorResolutionPath(injector);
  const resolutionPathWithProviders = !ngDebugDependencyInjectionApiIsSupported()
    ? []
    : injectors.map((injector) => ({
        injector,
        providers: getInjectorProviders(injector),
      }));
  const populateResultSet = (dir: DirectiveInstanceType | ComponentInstanceType) => {
    const {instance, name} = dir;
    const metadata = getDirectiveMetadata(instance);
    metadata.dependencies = getDependenciesForDirective(
      injector,
      resolutionPathWithProviders,
      instance.constructor,
    );

    if (query.propertyQuery.type === PropertyQueryTypes.All) {
      directiveProperties[dir.name] = {
        props: serializeDirectiveState(instance),
        metadata,
      };
    }

    if (query.propertyQuery.type === PropertyQueryTypes.Specified) {
      directiveProperties[name] = {
        props: deeplySerializeSelectedProperties(
          instance,
          query.propertyQuery.properties[name] || [],
        ),
        metadata,
      };
    }
  };

  node.directives.forEach((dir) => populateResultSet(dir));
  if (node.component) {
    populateResultSet(node.component);
  }

  return {
    directiveProperties,
  };
};

function serializeElementInjectorWithId(injector: Injector): SerializedInjector | null {
  let id: string;
  const element = getElementInjectorElement(injector);

  if (!injectorToId.has(element)) {
    id = getInjectorId();
    injectorToId.set(element, id);
    idToInjector.set(id, injector);
  }

  id = injectorToId.get(element)!;
  idToInjector.set(id, injector);
  injectorsSeen.add(id);

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
  let id: string;

  if (!injectorToId.has(injector)) {
    id = getInjectorId();
    injectorToId.set(injector, id);
    idToInjector.set(id, injector);
  }

  id = injectorToId.get(injector)!;
  idToInjector.set(id, injector);
  injectorsSeen.add(id);

  const serializedInjector = serializeInjector(injector);
  if (serializedInjector === null) {
    return null;
  }

  return {id, ...serializedInjector};
}

const enum DirectiveMetadataKey {
  INPUTS = 'inputs',
  OUTPUTS = 'outputs',
  ENCAPSULATION = 'encapsulation',
  ON_PUSH = 'onPush',
}

// Gets directive metadata. For newer versions of Angular (v12+) it uses
// the global `getDirectiveMetadata`. For prior versions of the framework
// the method directly interacts with the directive/component definition.
const getDirectiveMetadata = (dir: any): DirectiveMetadata => {
  const getMetadata = ngDebugClient().getDirectiveMetadata;
  const metadata = getMetadata?.(dir) as ComponentDebugMetadata;
  if (metadata) {
    return {
      inputs: metadata.inputs,
      outputs: metadata.outputs,
      encapsulation: metadata.encapsulation,
      onPush: metadata.changeDetection === ChangeDetectionStrategy.OnPush,
    };
  }

  // Used in older Angular versions, prior to the introduction of `getDirectiveMetadata`.
  const safelyGrabMetadata = (key: DirectiveMetadataKey) => {
    try {
      return dir.constructor.ɵcmp ? dir.constructor.ɵcmp[key] : dir.constructor.ɵdir[key];
    } catch {
      console.warn(`Could not find metadata for key: ${key} in directive:`, dir);
      return undefined;
    }
  };

  return {
    inputs: safelyGrabMetadata(DirectiveMetadataKey.INPUTS),
    outputs: safelyGrabMetadata(DirectiveMetadataKey.OUTPUTS),
    encapsulation: safelyGrabMetadata(DirectiveMetadataKey.ENCAPSULATION),
    onPush: safelyGrabMetadata(DirectiveMetadataKey.ON_PUSH),
  };
};

export function getInjectorProviders(injector: Injector) {
  if (isNullInjector(injector)) {
    return [];
  }

  return ngDebugClient().ɵgetInjectorProviders(injector);
}

const getDependenciesForDirective = (
  injector: Injector,
  resolutionPath: {injector: Injector; providers: ProviderRecord[]}[],
  directive: any,
): SerializedInjectedService[] => {
  if (!ngDebugApiIsSupported('ɵgetDependenciesFromInjectable')) {
    return [];
  }

  let dependencies =
    ngDebugClient().ɵgetDependenciesFromInjectable(injector, directive)?.dependencies ?? [];
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
      ...(foundProvider?.importPath ?? []).slice(1).map((node) => {
        return {type: 'imported-module', name: valueToLabel(node), id: getInjectorId()};
      }),
    ];

    if (dependency.token && isInjectionToken(dependency.token)) {
      serializedInjectedServices.push({
        token: dependency.token!.toString(),
        value: valueToLabel(dependency.value),
        flags: dependency.flags as InjectOptions,
        position: [position++],
        resolutionPath: dependencyResolutionPath,
      });
      continue;
    }

    serializedInjectedServices.push({
      token: valueToLabel(dependency.token),
      value: valueToLabel(dependency.value),
      flags: dependency.flags as InjectOptions,
      position: [position++],
      resolutionPath: dependencyResolutionPath,
    });
  }

  return serializedInjectedServices;
};

const valueToLabel = (value: any): string => {
  if (isInjectionToken(value)) {
    return `InjectionToken(${value['_desc']})`;
  }

  if (typeof value === 'object') {
    return stripUnderscore(value.constructor.name);
  }

  if (typeof value === 'function') {
    return stripUnderscore(value.name);
  }

  return stripUnderscore(value);
};

function stripUnderscore(str: string): string {
  if (str.startsWith('_')) {
    return str.slice(1);
  }

  return str;
}

export function serializeInjector(injector: Injector): Omit<SerializedInjector, 'id'> | null {
  const metadata = getInjectorMetadata(injector);

  if (metadata === null) {
    console.error('Angular DevTools: Could not serialize injector.', injector);
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

  console.error('Angular DevTools: Could not serialize injector.', injector);
  return null;
}

export function serializeProviderRecord(
  providerRecord: ProviderRecord,
  index: number,
  hasImportPath = false,
): SerializedProviderRecord {
  let type: 'type' | 'class' | 'value' | 'factory' | 'existing' = 'type';
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

function elementToDirectiveNames(element: HTMLElement): string[] {
  const {component, directives} = getDirectivesFromElement(element);
  return [component, ...directives]
    .map((dir) => dir?.constructor?.name ?? '')
    .filter((dir) => !!dir);
}

export function getElementInjectorElement(elementInjector: Injector): HTMLElement {
  if (!isElementInjector(elementInjector)) {
    throw new Error('Injector is not an element injector');
  }

  return getInjectorMetadata(elementInjector)!.source as HTMLElement;
}

function isInjectionToken(token: Type<unknown> | InjectionToken<unknown>): boolean {
  return token.constructor.name === 'InjectionToken';
}

export function isElementInjector(injector: Injector) {
  const metadata = getInjectorMetadata(injector);
  return metadata !== null && metadata.type === 'element';
}

function isNullInjector(injector: Injector) {
  const metadata = getInjectorMetadata(injector);
  return metadata !== null && metadata.type === 'null';
}

const getRootLViewsHelper = (element: Element, rootLViews = new Set<any>()): Set<any> => {
  if (!(element instanceof HTMLElement)) {
    return rootLViews;
  }
  const lView = getLViewFromDirectiveOrElementInstance(element);
  if (lView) {
    rootLViews.add(lView);
    return rootLViews;
  }
  // tslint:disable-next-line: prefer-for-of
  for (let i = 0; i < element.children.length; i++) {
    getRootLViewsHelper(element.children[i], rootLViews);
  }
  return rootLViews;
};

const getRoots = () => {
  const roots = Array.from(document.documentElement.querySelectorAll('[ng-version]'));

  const isTopLevel = (element: Element) => {
    let parent: Element | null = element;

    while (parent?.parentElement) {
      parent = parent.parentElement;
      if (parent.hasAttribute('ng-version')) {
        return false;
      }
    }

    return true;
  };

  return roots.filter(isTopLevel);
};

export const buildDirectiveForest = (): ComponentTreeNode[] => {
  const roots = getRoots();
  return Array.prototype.concat.apply([], Array.from(roots).map(buildDirectiveTree));
};

// Based on an ElementID we return a specific component node.
// If we can't find any, we return null.
export const queryDirectiveForest = (
  position: ElementPosition,
  forest: ComponentTreeNode[],
): ComponentTreeNode | null => {
  if (!position.length) {
    return null;
  }
  let node: null | ComponentTreeNode = null;
  for (const i of position) {
    node = forest[i];
    if (!node) {
      return null;
    }
    forest = node.children;
  }
  return node;
};

export const findNodeInForest = (
  position: ElementPosition,
  forest: ComponentTreeNode[],
): HTMLElement | null => {
  const foundComponent: ComponentTreeNode | null = queryDirectiveForest(position, forest);
  return foundComponent ? (foundComponent.nativeElement as HTMLElement) : null;
};

export const findNodeFromSerializedPosition = (
  serializedPosition: string,
): ComponentTreeNode | null => {
  const position: number[] = serializedPosition.split(',').map((index) => parseInt(index, 10));
  return queryDirectiveForest(position, buildDirectiveForest());
};

export const updateState = (updatedStateData: UpdatedStateData): void => {
  const ng = ngDebugClient();
  const node = queryDirectiveForest(updatedStateData.directiveId.element, buildDirectiveForest());
  if (!node) {
    console.warn(
      'Could not update the state of component',
      updatedStateData,
      'because the component was not found',
    );
    return;
  }
  if (updatedStateData.directiveId.directive !== undefined) {
    const directive = node.directives[updatedStateData.directiveId.directive].instance;
    mutateComponentOrDirective(updatedStateData, directive);
    ng.applyChanges(ng.getOwningComponent(directive)!);
    return;
  }
  if (node.component) {
    const comp = node.component.instance;
    mutateComponentOrDirective(updatedStateData, comp);
    ng.applyChanges(comp);
    return;
  }
};

const mutateComponentOrDirective = (updatedStateData: UpdatedStateData, compOrDirective: any) => {
  const valueKey = updatedStateData.keyPath.pop();
  if (valueKey === undefined) {
    return;
  }

  let parentObjectOfValueToUpdate = compOrDirective;
  updatedStateData.keyPath.forEach((key) => {
    parentObjectOfValueToUpdate = parentObjectOfValueToUpdate[key];
  });

  if (isSignal(parentObjectOfValueToUpdate)) {
    // we don't support updating nested objects in signals yet
    return;
  }

  // When we try to set a property which only has a getter
  // the line below could throw an error.
  try {
    if (isSignal(parentObjectOfValueToUpdate[valueKey])) {
      parentObjectOfValueToUpdate[valueKey].set(updatedStateData.newValue);
    } else {
      parentObjectOfValueToUpdate[valueKey] = updatedStateData.newValue;
    }
  } catch {}
};

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
