/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {PropertyQueryTypes} from '../../../../protocol';
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
import {getAppRoots} from './get-roots';
import {AcxChangeDetectionStrategy, ChangeDetectionStrategy, Framework} from './core-enums';
export const injectorToId = new WeakMap();
export const nodeInjectorToResolutionPath = new WeakMap();
export const idToInjector = new Map();
export const injectorsSeen = new Set();
let injectorId = 0;
export function getInjectorId() {
  return `${injectorId++}`;
}
export function getInjectorMetadata(injector) {
  return ngDebugClient().ɵgetInjectorMetadata?.(injector) ?? null;
}
export function getInjectorResolutionPath(injector) {
  const ng = ngDebugClient();
  if (!ngDebugApiIsSupported(ng, 'ɵgetInjectorResolutionPath')) {
    return [];
  }
  return ng.ɵgetInjectorResolutionPath(injector) ?? [];
}
export function getInjectorFromElementNode(element) {
  return ngDebugClient().getInjector?.(element) ?? null;
}
function getDirectivesFromElement(element) {
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
export const getLatestComponentState = (query, directiveForest) => {
  // if a directive forest is passed in we don't have to build the forest again.
  directiveForest = directiveForest ?? buildDirectiveForest();
  const node = queryDirectiveForest(query.selectedElement, directiveForest);
  if (!node || !node.nativeElement) {
    return;
  }
  const directiveProperties = {};
  const injector = getInjectorFromElementNode(node.nativeElement);
  const injectors = injector ? getInjectorResolutionPath(injector) : [];
  const resolutionPathWithProviders = !ngDebugDependencyInjectionApiIsSupported()
    ? []
    : injectors.map((injector) => ({
        injector,
        providers: getInjectorProviders(injector),
      }));
  const populateResultSet = (dir) => {
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
function serializeElementInjectorWithId(injector) {
  let id;
  const element = getElementInjectorElement(injector);
  if (!injectorToId.has(element)) {
    id = getInjectorId();
    injectorToId.set(element, id);
    idToInjector.set(id, injector);
  }
  id = injectorToId.get(element);
  idToInjector.set(id, injector);
  injectorsSeen.add(id);
  const serializedInjector = serializeInjector(injector);
  if (serializedInjector === null) {
    return null;
  }
  return {id, ...serializedInjector};
}
function serializeInjectorWithId(injector) {
  if (isElementInjector(injector)) {
    return serializeElementInjectorWithId(injector);
  } else {
    return serializeEnvironmentInjectorWithId(injector);
  }
}
function serializeEnvironmentInjectorWithId(injector) {
  let id;
  if (!injectorToId.has(injector)) {
    id = getInjectorId();
    injectorToId.set(injector, id);
    idToInjector.set(id, injector);
  }
  id = injectorToId.get(injector);
  idToInjector.set(id, injector);
  injectorsSeen.add(id);
  const serializedInjector = serializeInjector(injector);
  if (serializedInjector === null) {
    return null;
  }
  return {id, ...serializedInjector};
}
// Gets directive metadata. For newer versions of Angular (v12+) it uses
// the global `getDirectiveMetadata`. For prior versions of the framework
// the method directly interacts with the directive/component definition.
const getDirectiveMetadata = (dir) => {
  const getMetadata = ngDebugClient().getDirectiveMetadata;
  const metadata = getMetadata?.(dir);
  if (metadata) {
    const {framework} = metadata;
    switch (framework) {
      case undefined: // Back compat, older Angular versions did not set `framework`.
      case Framework.Angular: {
        const meta = metadata;
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
        const meta = metadata;
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
  const safelyGrabMetadata = (key) => {
    try {
      return dir.constructor.ɵcmp ? dir.constructor.ɵcmp[key] : dir.constructor.ɵdir[key];
    } catch {
      console.warn(`Could not find metadata for key: ${key} in directive:`, dir);
      return undefined;
    }
  };
  return {
    framework: Framework.Angular,
    inputs: safelyGrabMetadata('inputs' /* DirectiveMetadataKey.INPUTS */),
    outputs: safelyGrabMetadata('outputs' /* DirectiveMetadataKey.OUTPUTS */),
    encapsulation: safelyGrabMetadata('encapsulation' /* DirectiveMetadataKey.ENCAPSULATION */),
    onPush: safelyGrabMetadata('onPush' /* DirectiveMetadataKey.ON_PUSH */),
  };
};
export function isOnPushDirective(dir) {
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
export function getInjectorProviders(injector) {
  if (isNullInjector(injector)) {
    return [];
  }
  return ngDebugClient().ɵgetInjectorProviders(injector);
}
const getDependenciesForDirective = (injector, resolutionPath, directive) => {
  const ng = ngDebugClient();
  if (!ngDebugApiIsSupported(ng, 'ɵgetDependenciesFromInjectable')) {
    return [];
  }
  let dependencies = ng.ɵgetDependenciesFromInjectable(injector, directive)?.dependencies ?? [];
  const uniqueServices = new Set();
  const serializedInjectedServices = [];
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
    const dependencyResolutionPath = [
      // (1)
      ...resolutionPath
        .slice(0, foundInjectorIndex + 1)
        .map((node) => serializeInjectorWithId(node.injector)),
      // (2)
      // We slice the import path to remove the first element because this is the same
      // injector as the last injector in the resolution path.
      ...(foundProvider?.importPath ?? []).slice(1).map((node) => {
        return {
          type: 'imported-module',
          name: valueToLabel(node),
          id: getInjectorId(),
        };
      }),
    ];
    let flags = dependency.flags;
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
      flagToken = ['optional', 'skipSelf', 'self', 'host'].filter((key) => flags[key]).join('-');
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
        service.token = dependency.token.toString();
      }
      serializedInjectedServices.push(service);
    }
    position++;
  }
  return serializedInjectedServices;
};
const valueToLabel = (value) => {
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
function stripUnderscore(str) {
  if (str.startsWith('_')) {
    return str.slice(1);
  }
  return str;
}
export function serializeInjector(injector) {
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
    const source = metadata.source;
    const name = stripUnderscore(elementToDirectiveNames(source)[0]);
    return {type: 'element', name, providers};
  }
  if (metadata.type === 'environment') {
    if (injector.scopes instanceof Set) {
      if (injector.scopes.has('platform')) {
        return {type: 'environment', name: 'Platform', providers};
      }
      if (injector.scopes.has('root')) {
        return {type: 'environment', name: 'Root', providers};
      }
    }
    return {type: 'environment', name: stripUnderscore(metadata.source ?? ''), providers};
  }
  console.error('Angular DevTools: Could not serialize injector.', injector);
  return null;
}
export function serializeProviderRecord(providerRecord, index, hasImportPath = false) {
  let type = 'type';
  let multi = false;
  if (typeof providerRecord.provider === 'object') {
    if (providerRecord.provider.useClass !== undefined) {
      type = 'class';
    } else if (providerRecord.provider.useValue !== undefined) {
      type = 'value';
    } else if (providerRecord.provider.useFactory !== undefined) {
      type = 'factory';
    } else if (providerRecord.provider.useExisting !== undefined) {
      type = 'existing';
    }
    if (providerRecord.provider.multi !== undefined) {
      multi = providerRecord.provider.multi;
    }
  }
  const serializedProvider = {
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
function elementToDirectiveNames(element) {
  const {component, directives} = getDirectivesFromElement(element);
  return [component, ...directives]
    .map((dir) => dir?.constructor?.name ?? '')
    .filter((dir) => !!dir);
}
export function getElementInjectorElement(elementInjector) {
  if (!isElementInjector(elementInjector)) {
    throw new Error('Injector is not an element injector');
  }
  return getInjectorMetadata(elementInjector).source;
}
function isInjectionToken(token) {
  return token.constructor.name === 'InjectionToken';
}
export function isElementInjector(injector) {
  const metadata = getInjectorMetadata(injector);
  return metadata !== null && metadata.type === 'element';
}
function isNullInjector(injector) {
  const metadata = getInjectorMetadata(injector);
  return metadata !== null && metadata.type === 'null';
}
const getRootLViewsHelper = (element, rootLViews = new Set()) => {
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
function getRootElements() {
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
function discoverNonApplicationRootComponents(element, roots) {
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
export const buildDirectiveForest = () => {
  return buildDirectiveForestWithStrategy(getRootElements());
};
// Based on an ElementID we return a specific component node.
// If we can't find any, we return null.
export const queryDirectiveForest = (position, forest) => {
  if (!position.length) {
    return null;
  }
  let node = null;
  for (const i of position) {
    node = forest[i];
    if (!node) {
      return null;
    }
    forest = node.children;
  }
  return node;
};
export const findNodeInForest = (position, forest) => {
  const foundComponent = queryDirectiveForest(position, forest);
  return foundComponent ? foundComponent.nativeElement : null;
};
export const findNodeFromSerializedPosition = (serializedPosition) => {
  const position = serializedPosition.split(',').map((index) => parseInt(index, 10));
  return queryDirectiveForest(position, buildDirectiveForest());
};
export const updateState = (updatedStateData) => {
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
      ng.applyChanges?.(ng.getOwningComponent(directive));
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
export function serializeResolutionPath(resolutionPath) {
  const serializedResolutionPath = [];
  for (const injector of resolutionPath) {
    let serializedInjectorWithId = null;
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
//# sourceMappingURL=component-tree.js.map
