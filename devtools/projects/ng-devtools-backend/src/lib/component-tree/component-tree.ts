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
  Type,
  ValueProvider,
  ɵAngularComponentDebugMetadata as AngularComponentDebugMetadata,
  ɵAcxComponentDebugMetadata as AcxComponentDebugMetadata,
  ɵProviderRecord as ProviderRecord,
} from '@angular/core';
import {
  ComponentExplorerViewQuery,
  DirectiveMetadata,
  DirectivePosition,
  DirectivesProperties,
  ElementPosition,
  PropertyQueryTypes,
  SerializedInjectedService,
  SerializedInjector,
  SerializedProviderRecord,
  UpdatedStateData,
} from '../../../../protocol';
import {
  buildDirectiveForestWithStrategy,
  getLViewFromDirectiveOrElementInstance,
} from '../directive-forest/index';
import {
  ngDebugApiIsSupported,
  ngDebugClient,
  ngDebugDependencyInjectionApiIsSupported,
} from '../ng-debug-api/ng-debug-api';
import {
  deeplySerializeSelectedProperties,
  serializeDirectiveState,
} from '../state-serializer/state-serializer';
import {mutateNestedProp} from '../property-mutation';
import {ComponentTreeNode, DirectiveInstanceType, ComponentInstanceType} from '../interfaces';
import {getAppRoots} from './get-roots';
import {AcxChangeDetectionStrategy, ChangeDetectionStrategy, Framework} from './core-enums';
import {unwrapSignal} from '../utils';

export const injectorToId = new WeakMap<Injector | HTMLElement, string>();
export const nodeInjectorToResolutionPath = new WeakMap<HTMLElement, SerializedInjector[]>();
export const idToInjector = new Map<string, Injector>();
export const injectorsSeen = new Set<string>();
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
  return ngDebugClient().getInjector?.(element) ?? null;
}

function getDirectivesFromElement(element: HTMLElement): {
  component: unknown | null;
  directives: unknown[];
} {
  const ng = ngDebugClient();
  let component = null;
  if (element instanceof Element && ngDebugApiIsSupported(ng, 'getComponent')) {
    component = ng.getComponent(element);
  }

  return {
    component,
    directives: ngDebugClient().getDirectives?.(element) ?? [],
  };
}

export const getLatestComponentState = (
  query: ComponentExplorerViewQuery,
  directiveForest?: ComponentTreeNode[],
): {directiveProperties: DirectivesProperties} | undefined => {
  // if a directive forest is passed in we don't have to build the forest again.
  directiveForest = directiveForest ?? buildDirectiveForest();

  const node = queryDirectiveForest(query.selectedElement, directiveForest);
  if (!node || !node.nativeElement) {
    return;
  }

  const directiveProperties: DirectivesProperties = {};

  const injector = getInjectorFromElementNode(node.nativeElement!);

  const injectors = injector ? getInjectorResolutionPath(injector) : [];
  const resolutionPathWithProviders = !ngDebugDependencyInjectionApiIsSupported()
    ? []
    : injectors.map((injector) => ({
        injector,
        providers: getInjectorProviders(injector),
      }));
  const populateResultSet = (dir: DirectiveInstanceType | ComponentInstanceType) => {
    const {instance, name} = dir;
    const metadata = getDirectiveMetadata(instance);
    if (injector && metadata.framework === Framework.Angular) {
      metadata.dependencies = getDependenciesForDirective(
        injector,
        resolutionPathWithProviders,
        instance.constructor,
      );
    }

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
  const getMetadata = ngDebugClient().getDirectiveMetadata!;
  const metadata = getMetadata?.(dir);
  if (metadata) {
    const {framework} = metadata;
    switch (framework) {
      case undefined: // Back compat, older Angular versions did not set `framework`.
      case Framework.Angular: {
        const meta = metadata as typeof metadata & Partial<AngularComponentDebugMetadata>;
        return {
          framework: Framework.Angular,
          name: meta.name,
          inputs: meta.inputs,
          outputs: meta.outputs,
          encapsulation: meta.encapsulation,
          onPush: meta.changeDetection === ChangeDetectionStrategy.OnPush,
        };
      }
      case Framework.ACX: {
        const meta = metadata as typeof metadata & Partial<AcxComponentDebugMetadata>;
        return {
          framework: Framework.ACX,
          name: meta.name,
          inputs: meta.inputs,
          outputs: meta.outputs,
          encapsulation: meta.encapsulation,
          onPush: meta.changeDetection === AcxChangeDetectionStrategy.OnPush,
        };
      }
      case Framework.Wiz: {
        return {
          framework: Framework.Wiz,
          name: metadata.name,
          props: metadata.props,
        };
      }
      default: {
        throw new Error(`Unknown framework: "${framework}".`);
      }
    }
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
    framework: Framework.Angular,
    inputs: safelyGrabMetadata(DirectiveMetadataKey.INPUTS),
    outputs: safelyGrabMetadata(DirectiveMetadataKey.OUTPUTS),
    encapsulation: safelyGrabMetadata(DirectiveMetadataKey.ENCAPSULATION),
    onPush: safelyGrabMetadata(DirectiveMetadataKey.ON_PUSH),
  };
};

export function isOnPushDirective(dir: any): boolean {
  const metadata = getDirectiveMetadata(dir.instance);
  switch (metadata.framework) {
    case Framework.Angular:
      return Boolean(metadata.onPush);
    case Framework.ACX:
      return Boolean(metadata.onPush);
    case Framework.Wiz:
      return false;
    default:
      throw new Error(`Unknown framework: "${metadata.framework}".`);
  }
}

export function getInjectorProviders(injector: Injector) {
  if (isNullInjector(injector)) {
    return [];
  }

  return ngDebugClient().ɵgetInjectorProviders!(injector);
}

const getDependenciesForDirective = (
  injector: Injector,
  resolutionPath: {injector: Injector; providers: ProviderRecord[]}[],
  directive: any,
): SerializedInjectedService[] => {
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
      // TODO: We need to remove this once the InjectFlags enum is removed from core
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

      if (dependency.token && isInjectionToken(dependency.token)) {
        service.token = dependency.token!.toString();
      }

      serializedInjectedServices.push(service);
    }

    position++;
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

  if (typeof value !== 'string') {
    return String(value);
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
  for (let i = 0; i < element.children.length; i++) {
    getRootLViewsHelper(element.children[i], rootLViews);
  }
  return rootLViews;
};

/** Gets the all the root components in the Dom, including those outside the application root */
export function getRootElements(): Element[] {
  if (!ngDebugClient().getComponent) {
    // If the ngDebugClient does not support getComponent, we cannot proceed.
    return [];
  }

  const roots = getAppRoots();
  const rootSet = new Set(roots);

  // Traverse the DOM tree for other non application root Angular components.
  // Pass in the existing roots to inform the traversal that we can skip those paths.
  discoverNonApplicationRootComponents(document.body, rootSet);

  return [...rootSet];
}

/**
 * Warning: This function mutates the `roots` arg!
 *
 * Recursively traverse the DOM tree to find all Angular component root elements.
 *
 * This function starts from the given element and traverses its children.
 * When it finds an Angular component, it adds that element to the `roots` set.
 *
 * If we discover an angular component that we've already added to the `roots` set,
 * we skip traversing its children. This is to ensure that we only collect unique root elements.
 *
 *
 * Example:
 *
 * Lets say we have the following DOM structure:
 *
 * ```html
 * <body>
 *   <app-root-1>...</app-root-1>
 *   <app-root-2>...</app-root-2>
 *
 *   <mat-dialog>
 *    ...
 *   </mat-dialog>
 *
 *   <div id="not-angular">Not an angular component</div>
 * </body>
 *
 * ```
 *
 * In this case, `app-root-1` and `app-root-2` are the root elements of Angular components.
 * The `mat-dialog` is a non application root Angular component.
 *
 * We can discover the roots by searching for ng-version. This gives us a set of paths that we can skip traversing.
 *
 * ```ts
 * const rootSet = new Set(getAppRoots());
 * console.log(rootSet);
 * // Set(<app-root-1>, <app-root-2>)
 * discoverNonApplicationRootComponents(document.body, rootSet);
 * console.log(rootSet);
 * // Set(<app-root-1>, <app-root-2>, <mat-dialog>)
 * ```
 *
 * ```md
 *
 * traversing document.body.children:
 * - child: <app-root-1>
 *   - Since we have this already in the `roots` set, we skip traversing its children.
 * - child: <app-root-2>
 *   - Since we have this already in the `roots` set, we skip traversing its children.
 * - child: <mat-dialog>
 *   - Since this is not in the `roots` set, we check if it is an Angular component.
 *   - Since it is, we add it to the `roots` set and break the loop.
 * - child: <div id="not-angular">
 *   - Since this is not an Angular component, we traverse its children to see if we can find any Angular components.
 *
 * ```
 *
 * @param element The current DOM element being traversed.
 * @param roots A set of root elements found during the traversal.
 */
function discoverNonApplicationRootComponents(element: Element, roots: Set<Element>): void {
  if (roots.has(element)) {
    return;
  }
  const children = Array.from(element.children);
  for (const child of children) {
    if (roots.has(child)) {
      continue;
    }

    const ng = ngDebugClient();
    if (ng.getComponent && ng.getComponent(child)) {
      roots.add(child);
      // If the child is an Angular component, we can skip traversing its children.
      continue;
    }

    discoverNonApplicationRootComponents(child, roots);
  }
}

export const buildDirectiveForest = (): ComponentTreeNode[] => {
  return buildDirectiveForestWithStrategy(getRootElements());
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
    mutateNestedProp(directive, updatedStateData.keyPath, updatedStateData.newValue);
    if (ngDebugApiIsSupported(ng, 'getOwningComponent')) {
      ng.applyChanges?.(ng.getOwningComponent(directive)!);
    }
    return;
  }
  if (node.component) {
    const comp = node.component.instance;
    mutateNestedProp(comp, updatedStateData.keyPath, updatedStateData.newValue);
    ng.applyChanges?.(comp);
    return;
  }
};

export function logValue(valueInfo: {
  directiveId: DirectivePosition;
  keyPath: string[] | null;
}): void {
  const node = queryDirectiveForest(valueInfo.directiveId.element, buildDirectiveForest());
  if (!node) {
    console.warn(
      'Could not log the value of component',
      valueInfo,
      'because the directive was not found',
    );
    return;
  }

  if (valueInfo.directiveId.directive !== undefined) {
    const directiveInstance = node.directives[valueInfo.directiveId.directive].instance;
    if (valueInfo.keyPath === null) {
      logToConsole(directiveInstance);
      return;
    }

    const value = valueInfo.keyPath.reduce((obj, key) => obj && obj[key], directiveInstance);
    logToConsole(value);
    return;
  }
  if (node.component) {
    const compInstance = node.component.instance;
    if (valueInfo.keyPath === null) {
      logToConsole(compInstance);
      return;
    }
    const value = valueInfo.keyPath.reduce((obj, key) => obj && obj[key], compInstance);
    logToConsole(value);
    return;
  }
}

function logToConsole(value: unknown) {
  // tslint:disable-next-line:no-console
  console.log(unwrapSignal(value));
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
