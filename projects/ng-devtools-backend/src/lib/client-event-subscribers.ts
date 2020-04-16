import {
  DirectivePosition,
  ElementPosition,
  Events,
  MessageBus,
  DevToolsNode,
  DirectiveType,
  ComponentType,
  ProfilerFrame,
  ComponentExplorerViewQuery,
} from 'protocol';
import { onChangeDetection$ } from './change-detection-tracker';
import { ComponentTreeNode, getLatestComponentState, queryDirectiveForest, updateState } from './component-tree';
import { start as startProfiling, stop as stopProfiling } from './observer';
import { serializeDirectiveState } from './state-serializer/state-serializer';
import { ComponentInspector, ComponentInspectorOptions } from './component-inspector/component-inspector';
import { setConsoleReference } from './selected-component';
import { unHighlight } from './highlighter';
import { getAngularVersion, appIsAngularInDevMode, appIsSupportedAngularVersion } from './angular-check';
import { observeDOM, getDirectiveId, getDirectiveForest, indexDirectiveForest } from './component-tree-identifiers';
import { debounceTime } from 'rxjs/operators';

export const subscribeToClientEvents = (messageBus: MessageBus<Events>): void => {
  messageBus.on('shutdown', shutdownCallback(messageBus));

  messageBus.on('getLatestComponentExplorerView', getLatestComponentExplorerViewCallback(messageBus));

  messageBus.on('queryNgAvailability', checkForAngularCallback(messageBus));

  messageBus.on('startProfiling', startProfilingCallback(messageBus));
  messageBus.on('stopProfiling', stopProfilingCallback(messageBus));

  messageBus.on('setSelectedComponent', selectedComponentCallback);

  messageBus.on('getNestedProperties', getNestedPropertiesCallback(messageBus));

  messageBus.on('updateState', updateState);

  if (appIsAngularInDevMode() && appIsSupportedAngularVersion()) {
    setupInspector(messageBus);
    // Often websites have `scroll` event listener which triggers
    // Angular's change detection. We don't want to constantly send
    // update requests, instead we want to request an update at most
    // every 50ms
    onChangeDetection$.pipe(debounceTime(50)).subscribe(() => messageBus.emit('componentTreeDirty'));
  }
};

//
// Callback Definitions
//

const shutdownCallback = (messageBus: MessageBus<Events>) => () => {
  messageBus.destroy();
};

const getLatestComponentExplorerViewCallback = (messageBus: MessageBus<Events>) => (
  query?: ComponentExplorerViewQuery
) => {
  // We want to force re-indexing of the component tree.
  // Pressing the refresh button means the user saw stuck UI.
  indexDirectiveForest();
  if (!query) {
    messageBus.emit('latestComponentExplorerView', [
      {
        forest: prepareForestForSerialization(getDirectiveForest()),
      },
    ]);
    return;
  }
  messageBus.emit('latestComponentExplorerView', [
    {
      forest: prepareForestForSerialization(getDirectiveForest()),
      properties: getLatestComponentState(query),
    },
  ]);
};

const checkForAngularCallback = (messageBus: MessageBus<Events>) => () => checkForAngular(messageBus);

const startProfilingCallback = (messageBus: MessageBus<Events>) => () =>
  startProfiling((frame: ProfilerFrame) => {
    messageBus.emit('sendProfilerChunk', [frame]);
  });

const stopProfilingCallback = (messageBus: MessageBus<Events>) => () => {
  messageBus.emit('profilerResults', [stopProfiling()]);
};

const selectedComponentCallback = (position: ElementPosition) => {
  const node = queryDirectiveForest(position, getDirectiveForest());
  setConsoleReference({ node, position });
};

const getNestedPropertiesCallback = (messageBus: MessageBus<Events>) => (
  position: DirectivePosition,
  propPath: string[]
) => {
  const emitEmpty = () => messageBus.emit('nestedProperties', [position, { props: {} }, propPath]);
  const node = queryDirectiveForest(position.element, getDirectiveForest());
  if (!node) {
    return emitEmpty();
  }
  const current = position.directive === undefined ? node.component : node.directives[position.directive];
  if (!current) {
    return emitEmpty();
  }
  let data = current.instance;
  for (const prop of propPath) {
    data = data[prop];
    if (!data) {
      console.error('Cannot access the properties', propPath, 'of', node);
    }
  }
  messageBus.emit('nestedProperties', [position, { props: serializeDirectiveState(data) }, propPath]);
};

//
// Subscribe Helpers
//

const checkForAngular = (messageBus: MessageBus<Events>, attempt = 0): void => {
  const ngVersion = getAngularVersion();
  if (!!ngVersion) {
    observeDOM();
    messageBus.emit('ngAvailability', [{ version: ngVersion.toString(), prodMode: false }]);
    return;
  }
  setTimeout(() => checkForAngular(messageBus, attempt + 1), 500);
};

const setupInspector = (messageBus: MessageBus<Events>) => {
  const onComponentEnter = (id: number) => {
    messageBus.emit('highlightComponent', [id]);
  };
  const onComponentLeave = () => {
    messageBus.emit('removeComponentHighlight');
  };
  const onComponentSelect = (id: number) => {
    messageBus.emit('selectComponent', [id]);
  };

  const inspectorOptions: ComponentInspectorOptions = { onComponentEnter, onComponentLeave, onComponentSelect };
  const inspector = new ComponentInspector(inspectorOptions);

  messageBus.on('inspectorStart', inspector.startInspecting);
  messageBus.on('inspectorEnd', inspector.stopInspecting);

  messageBus.on('createHighlightOverlay', (position: ElementPosition) => {
    inspector.highlightByPosition(position);
  });
  messageBus.on('removeHighlightOverlay', unHighlight);
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
}

// Here we drop properties to prepare the tree for serialization.
// We don't need the component instance, so we just traverse the tree
// and leave the component name.
export const prepareForestForSerialization = (roots: ComponentTreeNode[]): SerializableComponentTreeNode[] => {
  return roots.map((node) => {
    return {
      element: node.element,
      component: node.component
        ? {
            name: node.component.name,
            isElement: node.component.isElement,
            id: getDirectiveId(node.component.instance),
          }
        : null,
      directives: node.directives.map((d) => ({ name: d.name, id: getDirectiveId(d.instance) })),
      children: prepareForestForSerialization(node.children),
    } as SerializableComponentTreeNode;
  });
};
