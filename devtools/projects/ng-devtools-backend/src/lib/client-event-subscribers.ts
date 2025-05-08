/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ComponentExplorerViewQuery,
  ComponentType,
  DevToolsNode,
  DirectivePosition,
  DirectiveType,
  ElementPosition,
  Events,
  MessageBus,
  ProfilerFrame,
  Route,
  SerializedInjector,
  SerializedProviderRecord,
} from '../../../protocol';
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
import {ComponentTreeNode} from './interfaces';
import {parseRoutes} from './router-tree';
import {ngDebugDependencyInjectionApiIsSupported} from './ng-debug-api/ng-debug-api';
import {setConsoleReference} from './set-console-reference';
import {serializeDirectiveState} from './state-serializer/state-serializer';
import {runOutsideAngular, unwrapSignal} from './utils';
import {DirectiveForestHooks} from './hooks/hooks';
import {getSupportedApis} from './ng-debug-api/supported-apis';

type InspectorRef = {ref: ComponentInspector | null};

export const subscribeToClientEvents = (
  messageBus: MessageBus<Events>,
  depsForTestOnly?: {
    directiveForestHooks?: typeof DirectiveForestHooks;
  },
): void => {
  const inspector: InspectorRef = {ref: null};

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

  messageBus.on('updateState', updateState);

  messageBus.on('enableTimingAPI', enableTimingAPI);
  messageBus.on('disableTimingAPI', disableTimingAPI);

  messageBus.on('getInjectorProviders', getInjectorProvidersCallback(messageBus));

  messageBus.on('logProvider', logProvider);

  messageBus.on('log', ({message, level}) => {
    console[level](`[Angular DevTools]: ${message}`);
  });

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

const shutdownCallback = (messageBus: MessageBus<Events>) => () => {
  messageBus.destroy();
};

const getLatestComponentExplorerViewCallback =
  (messageBus: MessageBus<Events>) => (query?: ComponentExplorerViewQuery) => {
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
        const injector = idToInjector.get(injectorId)!;
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

const checkForAngularCallback = (messageBus: MessageBus<Events>) => () =>
  checkForAngular(messageBus);
const getRoutesCallback = (messageBus: MessageBus<Events>) => () => getRoutes(messageBus);

const startProfilingCallback = (messageBus: MessageBus<Events>) => () =>
  startProfiling((frame: ProfilerFrame) => {
    messageBus.emit('sendProfilerChunk', [frame]);
  });

const stopProfilingCallback = (messageBus: MessageBus<Events>) => () => {
  messageBus.emit('profilerResults', [stopProfiling()]);
};

const selectedComponentCallback = (inspector: InspectorRef) => (position: ElementPosition) => {
  const node = queryDirectiveForest(
    position,
    initializeOrGetDirectiveForestHooks().getIndexedDirectiveForest(),
  );
  setConsoleReference({node, position});
  inspector.ref?.highlightByPosition(position);
};

const getNestedPropertiesCallback =
  (messageBus: MessageBus<Events>) => (position: DirectivePosition, propPath: string[]) => {
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
    messageBus.emit('nestedProperties', [
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
const getRoutes = (messageBus: MessageBus<Events>) => {
  const forest = prepareForestForSerialization(
    initializeOrGetDirectiveForestHooks().getIndexedDirectiveForest(),
    ngDebugDependencyInjectionApiIsSupported(),
  );
  if (forest.length === 0) return;

  const rootInjector = (forest[0].resolutionPath ?? []).find((i) => i.name === 'Root');
  if (!rootInjector) return;

  const route = getRouterConfigFromRoot(rootInjector);
  if (!route) return;

  messageBus.emit('updateRouterTree', [[route]]);
};

const getSerializedProviderRecords = (injector: SerializedInjector) => {
  if (!idToInjector.has(injector.id)) {
    return;
  }

  const providerRecords = getInjectorProviders(idToInjector.get(injector.id)!);
  const allProviderRecords: SerializedProviderRecord[] = [];
  const tokenToRecords: Map<unknown, SerializedProviderRecord[]> = new Map();

  for (const [index, providerRecord] of providerRecords.entries()) {
    const record = serializeProviderRecord(providerRecord, index, injector.type === 'environment');
    allProviderRecords.push(record);

    const records = tokenToRecords.get(providerRecord.token) ?? [];
    records.push(record);
    tokenToRecords.set(providerRecord.token, records);
  }
  const serializedProviderRecords: SerializedProviderRecord[] = [];
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
        index: records.map((record) => record.index as number),
      });
    }
  }

  return serializedProviderRecords;
};

const getProviderValue = (
  serializedInjector: SerializedInjector,
  serializedProvider: SerializedProviderRecord,
) => {
  if (!idToInjector.has(serializedInjector.id)) {
    return;
  }

  const injector = idToInjector.get(serializedInjector.id)!;
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

const getRouterConfigFromRoot = (injector: SerializedInjector): Route | void => {
  const serializedProviderRecords = getSerializedProviderRecords(injector) ?? [];
  const routerInstance = serializedProviderRecords.find(
    (provider) => provider.token === 'Router', // get the instance of router using token
  );

  if (!routerInstance) {
    return;
  }

  const routerProvider = getProviderValue(injector, routerInstance);

  return parseRoutes(routerProvider);
};

const checkForAngular = (messageBus: MessageBus<Events>): void => {
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

const setupInspector = (messageBus: MessageBus<Events>): ComponentInspector => {
  const inspector = new ComponentInspector({
    onComponentEnter: (id: number) => {
      messageBus.emit('highlightComponent', [id]);
    },
    onComponentLeave: () => {
      messageBus.emit('removeComponentHighlight');
    },
    onComponentSelect: (id: number) => {
      messageBus.emit('selectComponent', [id]);
    },
  });

  messageBus.on('inspectorStart', inspector.startInspecting);
  messageBus.on('inspectorEnd', inspector.stopInspecting);

  messageBus.on('createHighlightOverlay', (position: ElementPosition) => {
    inspector.highlightByPosition(position);
  });
  messageBus.on('removeHighlightOverlay', unHighlight);

  messageBus.on('createHydrationOverlay', inspector.highlightHydrationNodes);
  messageBus.on('removeHydrationOverlay', inspector.removeHydrationHighlights);

  return inspector;
};

export interface SerializableDirectiveInstanceType extends DirectiveType {
  id: number;
}

export interface SerializableComponentInstanceType extends ComponentType {
  id: number;
}

export interface SerializableComponentTreeNode
  extends DevToolsNode<SerializableDirectiveInstanceType, SerializableComponentInstanceType> {
  children: SerializableComponentTreeNode[];
  nativeElement?: never;
  // Since the nativeElement is not serializable, we will use this boolean as backup
  hasNativeElement: boolean;
}

// Here we drop properties to prepare the tree for serialization.
// We don't need the component instance, so we just traverse the tree
// and leave the component name.
const prepareForestForSerialization = (
  roots: ComponentTreeNode[],
  includeResolutionPath = false,
): SerializableComponentTreeNode[] => {
  const serializedNodes: SerializableComponentTreeNode[] = [];
  for (const node of roots) {
    const serializedNode: SerializableComponentTreeNode = {
      element: node.element,
      component: node.component
        ? {
            name: node.component.name,
            isElement: node.component.isElement,
            id: initializeOrGetDirectiveForestHooks().getDirectiveId(node.component.instance)!,
          }
        : null,
      directives: node.directives.map((d) => ({
        name: d.name,
        id: initializeOrGetDirectiveForestHooks().getDirectiveId(d.instance)!,
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

function getNodeDIResolutionPath(node: ComponentTreeNode): SerializedInjector[] | undefined {
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

  const serializedPath = nodeInjectorToResolutionPath.get(element)!;
  for (const injector of serializedPath) {
    injectorsSeen.add(injector.id);
  }

  return serializedPath;
}

const getInjectorProvidersCallback =
  (messageBus: MessageBus<Events>) => (injector: SerializedInjector) => {
    if (!idToInjector.has(injector.id)) {
      return;
    }

    const providerRecords = getInjectorProviders(idToInjector.get(injector.id)!);
    const allProviderRecords: SerializedProviderRecord[] = [];

    const tokenToRecords: Map<any, SerializedProviderRecord[]> = new Map();

    for (const [index, providerRecord] of providerRecords.entries()) {
      const record = serializeProviderRecord(
        providerRecord,
        index,
        injector.type === 'environment',
      );

      allProviderRecords.push(record);

      const records = tokenToRecords.get(providerRecord.token) ?? [];
      records.push(record);
      tokenToRecords.set(providerRecord.token, records);
    }

    const serializedProviderRecords: SerializedProviderRecord[] = [];

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
          index: records.map((record) => record.index as number),
        });
      }
    }

    messageBus.emit('latestInjectorProviders', [injector, serializedProviderRecords]);
  };

const logProvider = (
  serializedInjector: SerializedInjector,
  serializedProvider: SerializedProviderRecord,
): void => {
  if (!idToInjector.has(serializedInjector.id)) {
    return;
  }

  const injector = idToInjector.get(serializedInjector.id)!;

  const providerRecords = getInjectorProviders(injector);

  console.group(
    `%c${serializedInjector.name}`,
    `color: ${
      serializedInjector.type === 'element' ? '#a7d5a9' : '#f05057'
    }; font-size: 1.25rem; font-weight: bold;`,
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
