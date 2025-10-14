/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {debounceTime} from 'rxjs/operators';
import {
  appIsAngularInDevMode,
  appIsAngularIvy,
  appIsSupportedAngularVersion,
  getAngularVersion,
  isHydrationEnabled,
} from '../../../shared-utils';
import {ComponentInspector} from './component-inspector/component-inspector';
import {
  getElementInjectorElement,
  getInjectorFromElementNode,
  getInjectorProviders,
  getInjectorResolutionPath,
  getLatestComponentState,
  idToInjector,
  injectorsSeen,
  isElementInjector,
  isOnPushDirective,
  nodeInjectorToResolutionPath,
  queryDirectiveForest,
  serializeProviderRecord,
  serializeResolutionPath,
  updateState,
} from './component-tree/component-tree';
import {unHighlight} from './highlighter';
import {disableTimingAPI, enableTimingAPI, initializeOrGetDirectiveForestHooks} from './hooks';
import {start as startProfiling, stop as stopProfiling} from './hooks/capture';
import {getElementRefByName, getComponentRefByName, parseRoutes} from './router-tree';
import {ngDebugClient, ngDebugDependencyInjectionApiIsSupported} from './ng-debug-api/ng-debug-api';
import {setConsoleReference} from './set-console-reference';
import {serializeDirectiveState, serializeValue} from './state-serializer/state-serializer';
import {runOutsideAngular, unwrapSignal} from './utils';
import {getSupportedApis} from './ng-debug-api/supported-apis';
import {sanitizeObject} from './serialization-utils';
export const subscribeToClientEvents = (messageBus, depsForTestOnly) => {
  const inspector = {ref: null};
  messageBus.on('shutdown', shutdownCallback(messageBus));
  messageBus.on(
    'getLatestComponentExplorerView',
    getLatestComponentExplorerViewCallback(messageBus),
  );
  messageBus.on('queryNgAvailability', checkForAngularCallback(messageBus));
  messageBus.on('startProfiling', startProfilingCallback(messageBus));
  messageBus.on('stopProfiling', stopProfilingCallback(messageBus));
  messageBus.on('setSelectedComponent', selectedComponentCallback(inspector));
  messageBus.on('getNestedProperties', getNestedPropertiesCallback(messageBus));
  messageBus.on('getRoutes', getRoutesCallback(messageBus));
  messageBus.on('navigateRoute', navigateRouteCallback(messageBus));
  messageBus.on('getSignalNestedProperties', getSignalNestedPropertiesCallback(messageBus));
  messageBus.on('updateState', updateState);
  messageBus.on('enableTimingAPI', enableTimingAPI);
  messageBus.on('disableTimingAPI', disableTimingAPI);
  messageBus.on('getInjectorProviders', getInjectorProvidersCallback(messageBus));
  messageBus.on('logProvider', logProvider);
  messageBus.on('getTransferState', getTransferStateCallback(messageBus));
  messageBus.on('log', ({message, level}) => {
    console[level](`[Angular DevTools]: ${message}`);
  });
  messageBus.on('getSignalGraph', getSignalGraphCallback(messageBus));
  if (appIsAngularInDevMode() && appIsSupportedAngularVersion() && appIsAngularIvy()) {
    inspector.ref = setupInspector(messageBus);
    // Often websites have `scroll` event listener which triggers
    // Angular's change detection. We don't want to constantly send
    // update requests, instead we want to request an update at most
    // once every 250ms
    runOutsideAngular(() => {
      initializeOrGetDirectiveForestHooks(depsForTestOnly)
        .profiler.changeDetection$.pipe(debounceTime(250))
        .subscribe(() => messageBus.emit('componentTreeDirty'));
    });
  }
};
//
// Callback Definitions
//
const shutdownCallback = (messageBus) => () => {
  messageBus.destroy();
};
const getLatestComponentExplorerViewCallback = (messageBus) => (query) => {
  // We want to force re-indexing of the component tree.
  // Pressing the refresh button means the user saw stuck UI.
  initializeOrGetDirectiveForestHooks().indexForest();
  const forest = prepareForestForSerialization(
    initializeOrGetDirectiveForestHooks().getIndexedDirectiveForest(),
    ngDebugDependencyInjectionApiIsSupported(),
  );
  // cleanup injector id mappings
  for (const injectorId of idToInjector.keys()) {
    if (!injectorsSeen.has(injectorId)) {
      const injector = idToInjector.get(injectorId);
      if (isElementInjector(injector)) {
        const element = getElementInjectorElement(injector);
        if (element) {
          nodeInjectorToResolutionPath.delete(element);
        }
      }
      idToInjector.delete(injectorId);
    }
  }
  injectorsSeen.clear();
  if (!query) {
    messageBus.emit('latestComponentExplorerView', [{forest}]);
    return;
  }
  const state = getLatestComponentState(
    query,
    initializeOrGetDirectiveForestHooks().getDirectiveForest(),
  );
  if (state) {
    const {directiveProperties} = state;
    messageBus.emit('latestComponentExplorerView', [{forest, properties: directiveProperties}]);
  } else {
    // if the node is not found in the tree, we assume its gone and send the tree as is.
    messageBus.emit('latestComponentExplorerView', [{forest}]);
  }
};
const checkForAngularCallback = (messageBus) => () => checkForAngular(messageBus);
const getRoutesCallback = (messageBus) => () => getRoutes(messageBus);
const navigateRouteCallback = (messageBus) => (path) => {
  const router = getRouterInstance();
  // If the router is not found or the navigateByUrl method is not available, we can't navigate
  if (router) {
    ngDebugClient().ɵnavigateByUrl?.(router, path);
  } else {
    console.warn('Router not found or navigateByUrl method not available');
  }
};
/**
 * Opens the source code of a component or a directive in the editor.
 * @param name - The name of the component, provider, or directive to view source for.
 * @param type - The type of the element to view source for  component, provider, or directive.
 * @returns - The element instance of the component, provider, or directive.
 */
export const viewSourceFromRouter = (name, type) => {
  const router = getRouterInstance();
  if (router == null) {
    return;
  }
  let element;
  if (type === 'component') {
    element = getComponentRefByName(router.config, name);
  } else {
    element = getElementRefByName(type, router.config, name);
  }
  return element;
};
const startProfilingCallback = (messageBus) => () =>
  startProfiling((frame) => {
    messageBus.emit('sendProfilerChunk', [frame]);
  });
const stopProfilingCallback = (messageBus) => () => {
  messageBus.emit('profilerResults', [stopProfiling()]);
};
const selectedComponentCallback = (inspector) => (position) => {
  const node = queryDirectiveForest(
    position,
    initializeOrGetDirectiveForestHooks().getIndexedDirectiveForest(),
  );
  setConsoleReference({node, position});
  inspector.ref?.highlightByPosition(position);
};
const getNestedPropertiesCallback = (messageBus) => (position, propPath) => {
  const emitEmpty = () => messageBus.emit('nestedProperties', [position, {props: {}}, propPath]);
  const node = queryDirectiveForest(
    position.element,
    initializeOrGetDirectiveForestHooks().getIndexedDirectiveForest(),
  );
  if (!node) {
    return emitEmpty();
  }
  const current =
    position.directive === undefined ? node.component : node.directives[position.directive];
  if (!current) {
    return emitEmpty();
  }
  let data = current.instance;
  for (const prop of propPath) {
    data = unwrapSignal(data[prop]);
    if (!data) {
      console.error('Cannot access the properties', propPath, 'of', node);
    }
  }
  messageBus.emit('nestedProperties', [position, {props: serializeDirectiveState(data)}, propPath]);
  return;
};
const getSignalNestedPropertiesCallback = (messageBus) => (position, propPath) => {
  const emitEmpty = () =>
    messageBus.emit('signalNestedProperties', [position, {props: {}}, propPath]);
  const node = queryDirectiveForest(
    position.element,
    initializeOrGetDirectiveForestHooks().getIndexedDirectiveForest(),
  );
  if (!node) {
    return emitEmpty();
  }
  const injector = getInjectorFromElementNode(node.nativeElement);
  if (!injector) {
    return emitEmpty();
  }
  const ng = ngDebugClient();
  const signalGraph = ng.ɵgetSignalGraph?.(injector);
  if (!signalGraph) {
    return emitEmpty();
  }
  const current = signalGraph.nodes.find((node) => node.id === position.signalId);
  if (!current) {
    return emitEmpty();
  }
  let data = current.value;
  for (const prop of propPath) {
    data = data[prop];
    if (!data) {
      console.error('Cannot access the properties', propPath, 'of', node);
    }
  }
  messageBus.emit('signalNestedProperties', [
    position,
    {props: serializeDirectiveState(data)},
    propPath,
  ]);
  return;
};
//
// Subscribe Helpers
//
// todo: parse router tree with framework APIs after they are developed
const getRoutes = (messageBus) => {
  const forest = prepareForestForSerialization(
    initializeOrGetDirectiveForestHooks().getIndexedDirectiveForest(),
    ngDebugDependencyInjectionApiIsSupported(),
  );
  if (forest.length === 0) return;
  const rootInjector = forest[0].resolutionPath?.find((i) => i.name === 'Root');
  if (!rootInjector) return;
  const route = getRouterConfigFromRoot(rootInjector);
  if (!route) return;
  const sanitizedRoute = sanitizeRouteData(route);
  messageBus.emit('updateRouterTree', [[sanitizedRoute]]);
};
const getSerializedProviderRecords = (injector) => {
  if (!idToInjector.has(injector.id)) {
    return;
  }
  const providerRecords = getInjectorProviders(idToInjector.get(injector.id));
  const allProviderRecords = [];
  const tokenToRecords = new Map();
  for (const [index, providerRecord] of providerRecords.entries()) {
    const record = serializeProviderRecord(providerRecord, index, injector.type === 'environment');
    allProviderRecords.push(record);
    const records = tokenToRecords.get(providerRecord.token) ?? [];
    records.push(record);
    tokenToRecords.set(providerRecord.token, records);
  }
  const serializedProviderRecords = [];
  for (const [token, records] of tokenToRecords.entries()) {
    const multiRecords = records.filter((record) => record.multi);
    const nonMultiRecords = records.filter((record) => !record.multi);
    for (const record of nonMultiRecords) {
      serializedProviderRecords.push(record);
    }
    const [firstMultiRecord] = multiRecords;
    if (firstMultiRecord !== undefined) {
      // All multi providers will have the same token, so we can just use the first one.
      serializedProviderRecords.push({
        token: firstMultiRecord.token,
        type: 'multi',
        multi: true,
        // todo(aleksanderbodurri): implememnt way to differentiate multi providers that
        // provided as viewProviders
        isViewProvider: firstMultiRecord.isViewProvider,
        index: records.map((record) => record.index),
      });
    }
  }
  return serializedProviderRecords;
};
const getProviderValue = (serializedInjector, serializedProvider) => {
  if (!idToInjector.has(serializedInjector.id)) {
    return;
  }
  const injector = idToInjector.get(serializedInjector.id);
  const providerRecords = getInjectorProviders(injector);
  if (typeof serializedProvider.index === 'number') {
    const provider = providerRecords[serializedProvider.index];
    return injector.get(provider.token, null, {optional: true});
  } else if (Array.isArray(serializedProvider.index)) {
    const provider = serializedProvider.index.map((index) => providerRecords[index]);
    return injector.get(provider[0].token, null, {optional: true});
  } else {
    return;
  }
};
const getRouterConfigFromRoot = (injector) => {
  const serializedProviderRecords = getSerializedProviderRecords(injector) ?? [];
  const routerInstance = serializedProviderRecords.find((provider) => provider.token === 'Router');
  if (!routerInstance) {
    return;
  }
  const routerProvider = getProviderValue(injector, routerInstance);
  return parseRoutes(routerProvider);
};
const checkForAngular = (messageBus) => {
  const ngVersion = getAngularVersion();
  const appIsIvy = appIsAngularIvy();
  if (!ngVersion) {
    return;
  }
  if (appIsIvy && appIsAngularInDevMode() && appIsSupportedAngularVersion()) {
    initializeOrGetDirectiveForestHooks();
  }
  messageBus.emit('ngAvailability', [
    {
      version: ngVersion.toString(),
      devMode: appIsAngularInDevMode(),
      ivy: appIsIvy,
      hydration: isHydrationEnabled(),
      supportedApis: getSupportedApis(),
    },
  ]);
};
const setupInspector = (messageBus) => {
  const inspector = new ComponentInspector({
    onComponentEnter: (id) => {
      messageBus.emit('highlightComponent', [id]);
    },
    onComponentLeave: () => {
      messageBus.emit('removeComponentHighlight');
    },
    onComponentSelect: (id) => {
      messageBus.emit('selectComponent', [id]);
    },
  });
  messageBus.on('inspectorStart', inspector.startInspecting);
  messageBus.on('inspectorEnd', inspector.stopInspecting);
  messageBus.on('createHighlightOverlay', (position) => {
    inspector.highlightByPosition(position);
  });
  messageBus.on('removeHighlightOverlay', unHighlight);
  messageBus.on('createHydrationOverlay', inspector.highlightHydrationNodes);
  messageBus.on('removeHydrationOverlay', inspector.removeHydrationHighlights);
  return inspector;
};
function getRouterInstance() {
  const forest = initializeOrGetDirectiveForestHooks().getIndexedDirectiveForest();
  const rootNode = forest[0];
  if (!rootNode || !rootNode.nativeElement) {
    return null;
  }
  const injector = getInjectorFromElementNode(rootNode.nativeElement);
  if (!injector) {
    return null;
  }
  const ng = ngDebugClient();
  return ng.ɵgetRouterInstance?.(injector);
}
// Here we drop properties to prepare the tree for serialization.
// We don't need the component instance, so we just traverse the tree
// and leave the component name.
const prepareForestForSerialization = (roots, includeResolutionPath = false) => {
  const serializedNodes = [];
  for (const node of roots) {
    const serializedNode = {
      element: node.element,
      component: node.component
        ? {
            name: node.component.name,
            isElement: node.component.isElement,
            id: initializeOrGetDirectiveForestHooks().getDirectiveId(node.component.instance),
          }
        : null,
      directives: node.directives.map((d) => ({
        name: d.name,
        id: initializeOrGetDirectiveForestHooks().getDirectiveId(d.instance),
      })),
      children: prepareForestForSerialization(node.children, includeResolutionPath),
      hydration: node.hydration,
      defer: node.defer,
      onPush: node.component ? isOnPushDirective(node.component) : false,
      // native elements are not serializable
      hasNativeElement: !!node.nativeElement,
    };
    serializedNodes.push(serializedNode);
    if (includeResolutionPath) {
      serializedNode.resolutionPath = getNodeDIResolutionPath(node);
    }
  }
  return serializedNodes;
};
function getNodeDIResolutionPath(node) {
  // Some nodes are not linked to HTMLElements, for example @defer blocks
  if (!node.nativeElement) {
    return undefined;
  }
  const nodeInjector = getInjectorFromElementNode(node.nativeElement);
  if (!nodeInjector) {
    return [];
  }
  // There are legit cases where an angular node will have non-ElementInjector injectors.
  // For example, components created with createComponent require the API consumer to
  // pass in an element injector, else it sets the element injector of the component
  // to the NullInjector
  if (!isElementInjector(nodeInjector)) {
    return [];
  }
  const element = getElementInjectorElement(nodeInjector);
  if (!nodeInjectorToResolutionPath.has(element)) {
    const resolutionPaths = getInjectorResolutionPath(nodeInjector);
    nodeInjectorToResolutionPath.set(element, serializeResolutionPath(resolutionPaths));
  }
  const serializedPath = nodeInjectorToResolutionPath.get(element);
  for (const injector of serializedPath) {
    injectorsSeen.add(injector.id);
  }
  return serializedPath;
}
const getInjectorProvidersCallback = (messageBus) => (injector) => {
  if (!idToInjector.has(injector.id)) {
    return;
  }
  const providerRecords = getInjectorProviders(idToInjector.get(injector.id));
  const allProviderRecords = [];
  const tokenToRecords = new Map();
  for (const [index, providerRecord] of providerRecords.entries()) {
    const record = serializeProviderRecord(providerRecord, index, injector.type === 'environment');
    allProviderRecords.push(record);
    const records = tokenToRecords.get(providerRecord.token) ?? [];
    records.push(record);
    tokenToRecords.set(providerRecord.token, records);
  }
  const serializedProviderRecords = [];
  for (const [token, records] of tokenToRecords.entries()) {
    const multiRecords = records.filter((record) => record.multi);
    const nonMultiRecords = records.filter((record) => !record.multi);
    for (const record of nonMultiRecords) {
      serializedProviderRecords.push(record);
    }
    const [firstMultiRecord] = multiRecords;
    if (firstMultiRecord !== undefined) {
      // All multi providers will have the same token, so we can just use the first one.
      serializedProviderRecords.push({
        token: firstMultiRecord.token,
        type: 'multi',
        multi: true,
        // todo(aleksanderbodurri): implememnt way to differentiate multi providers that
        // provided as viewProviders
        isViewProvider: firstMultiRecord.isViewProvider,
        index: records.map((record) => record.index),
      });
    }
  }
  messageBus.emit('latestInjectorProviders', [injector, serializedProviderRecords]);
};
const logProvider = (serializedInjector, serializedProvider) => {
  if (!idToInjector.has(serializedInjector.id)) {
    return;
  }
  const injector = idToInjector.get(serializedInjector.id);
  const providerRecords = getInjectorProviders(injector);
  console.group(
    `%c${serializedInjector.name}`,
    `color: ${serializedInjector.type === 'element' ? '#a7d5a9' : '#f05057'}; font-size: 1.25rem; font-weight: bold;`,
  );
  // tslint:disable-next-line:no-console
  console.log('injector: ', injector);
  if (typeof serializedProvider.index === 'number') {
    const provider = providerRecords[serializedProvider.index];
    // tslint:disable-next-line:no-console
    console.log('provider: ', provider);
    // tslint:disable-next-line:no-console
    console.log(`value: `, injector.get(provider.token, null, {optional: true}));
  } else if (Array.isArray(serializedProvider.index)) {
    const providers = serializedProvider.index.map((index) => providerRecords[index]);
    // tslint:disable-next-line:no-console
    console.log('providers: ', providers);
    // tslint:disable-next-line:no-console
    console.log(`value: `, injector.get(providers[0].token, null, {optional: true}));
  }
  console.groupEnd();
};
const getTransferStateCallback = (messageBus) => () => {
  const ng = ngDebugClient();
  const forest = initializeOrGetDirectiveForestHooks().getIndexedDirectiveForest();
  if (forest.length === 0) {
    messageBus.emit('transferStateData', [null]);
    return;
  }
  const rootNode = forest[0];
  if (!rootNode || !rootNode.nativeElement) {
    messageBus.emit('transferStateData', [null]);
    return;
  }
  const injector = getInjectorFromElementNode(rootNode.nativeElement);
  if (!injector) {
    messageBus.emit('transferStateData', [null]);
    return;
  }
  const transferStateData = ng.ɵgetTransferState?.(injector) ?? null;
  if (
    transferStateData &&
    typeof transferStateData === 'object' &&
    Object.keys(transferStateData).length > 0
  ) {
    messageBus.emit('transferStateData', [transferStateData]);
  } else {
    messageBus.emit('transferStateData', [null]);
  }
};
const getInjectorInstance = (serializedInjector, serializedProvider) => {
  if (!idToInjector.has(serializedInjector.id)) {
    return;
  }
  const injector = idToInjector.get(serializedInjector.id);
  const providerRecords = getInjectorProviders(injector);
  if (typeof serializedProvider.index === 'number') {
    const provider = providerRecords[serializedProvider.index];
    return injector.get(provider.token, null, {optional: true});
  } else if (Array.isArray(serializedProvider.index)) {
    const providers = serializedProvider.index.map((index) => providerRecords[index]);
    return injector.get(providers[0].token, null, {optional: true});
  }
  return null;
};
const getSignalGraphCallback = (messageBus) => (element) => {
  const ng = ngDebugClient();
  // get injector from position
  const node = queryDirectiveForest(
    element,
    initializeOrGetDirectiveForestHooks().getIndexedDirectiveForest(),
  );
  if (!node) {
    return;
  }
  const injector = getInjectorFromElementNode(node.nativeElement);
  if (!injector) {
    return;
  }
  const graph = ng.ɵgetSignalGraph?.(injector);
  if (graph) {
    const nodes = graph.nodes.map((node) => {
      return {
        id: node.id,
        kind: node.kind,
        label: node.label,
        epoch: node.epoch,
        preview: serializeValue(node.value),
        debuggable: !!node.debuggableFn,
      };
    });
    messageBus.emit('latestSignalGraph', [{nodes, edges: graph.edges}]);
  }
};
// Route data needs to be serializable to be sent over the message bus.
export function sanitizeRouteData(route) {
  if (route.data) {
    route.data = sanitizeObject(route.data);
  }
  if (route.children) {
    route.children = route.children.map(sanitizeRouteData);
  }
  return route;
}
//# sourceMappingURL=client-event-subscribers.js.map
