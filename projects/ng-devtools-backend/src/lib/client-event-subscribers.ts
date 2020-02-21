import {
  DirectivePosition,
  DirectivesProperties,
  ElementPosition,
  Events,
  MessageBus,
  DevToolsNode,
  DirectiveType,
  ComponentType,
  ProfilerFrame,
} from 'protocol';
import { onChangeDetection } from './change-detection-tracker';
import { ComponentTreeNode, getDirectiveForest, getLatestComponentState, queryComponentForest } from './component-tree';
import { start as startProfiling, stop as stopProfiling } from './observer';
import { serializeComponentState } from './state-serializer/state-serializer';
import { ComponentInspector, ComponentInspectorOptions } from './component-inspector/component-inspector';
import { setConsoleReference } from './selected-component';
import { unHighlight } from './highlighter';
import {
  getAngularVersion,
  appIsAngularInProdMode,
  appIsAngularInDevMode,
  appIsSupportedAngularVersion,
} from './angular-check';
import { observeDOM, getDirectiveId } from './component-tree-identifiers';

const ngDebug = (window as any).ng;

export const subscribeToClientEvents = (messageBus: MessageBus<Events>): void => {
  messageBus.on('shutdown', shutdownCallback(messageBus));

  messageBus.on('getLatestComponentExplorerView', getLatestComponentExplorerViewCallback(messageBus));

  messageBus.on('queryNgAvailability', checkForAngularCallback(messageBus));

  messageBus.on('startProfiling', startProfilingCallback(messageBus));
  messageBus.on('stopProfiling', stopProfilingCallback(messageBus));

  messageBus.on('getElementDirectivesProperties', getElementDirectivesPropertiesCallback(messageBus));

  messageBus.on('setSelectedComponent', selectedComponentCallback);

  messageBus.on('getNestedProperties', getNestedPropertiesCallback(messageBus));

  setupInspector(messageBus);

  initChangeDetection(messageBus);
};

const shutdownCallback = (messageBus: MessageBus<Events>) => () => {
  messageBus.destroy();
};

const initChangeDetection = (messageBus: MessageBus<Events>) => {
  if (appIsAngularInDevMode() && appIsSupportedAngularVersion()) {
    onChangeDetection(() => messageBus.emit('componentTreeDirty'));
  } else {
    messageBus.emit('ngAvailability', [{ version: getAngularVersion(), prodMode: appIsAngularInProdMode() }]);
  }
};

//
// Callback Definitions
//

const getLatestComponentExplorerViewCallback = (messageBus: MessageBus<Events>) => query => {
  messageBus.emit('latestComponentExplorerView', [
    {
      forest: prepareForestForSerialization(getDirectiveForest(document.documentElement, ngDebug)),
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

const getElementDirectivesPropertiesCallback = (messageBus: MessageBus<Events>) => (position: ElementPosition) => {
  const node = queryComponentForest(position, getDirectiveForest(document.documentElement, ngDebug));
  if (node) {
    messageBus.emit('elementDirectivesProperties', [serializeNodeDirectiveProperties(node)]);
  } else {
    messageBus.emit('elementDirectivesProperties', [{}]);
  }
};

const selectedComponentCallback = (position: ElementPosition) => {
  const node = queryComponentForest(position, getDirectiveForest(document.documentElement, ngDebug));
  setConsoleReference(node);
};

const getNestedPropertiesCallback = (messageBus: MessageBus<Events>) => (
  position: DirectivePosition,
  propPath: string[]
) => {
  const node = queryComponentForest(position.element, getDirectiveForest(document.documentElement, ngDebug));
  if (node) {
    let current = (position.directive === undefined ? node.component : node.directives[position.directive]).instance;
    for (const prop of propPath) {
      current = current[prop];
      if (!current) {
        console.error('Cannot access the properties', propPath, 'of', node);
      }
    }
    messageBus.emit('nestedProperties', [position, { props: serializeComponentState(current) }, propPath]);
  } else {
    messageBus.emit('nestedProperties', [position, { props: {} }, propPath]);
  }
};

//
// Subscribe Helpers
//

const checkForAngular = (messageBus: MessageBus<Events>, attempt = 0): void => {
  const ngVersion = getAngularVersion();
  const hasAngular = !!ngVersion;
  if (hasAngular) {
    observeDOM();
    messageBus.emit('ngAvailability', [{ version: ngVersion.toString(), prodMode: false }]);
    return;
  }
  if (attempt > 10) {
    messageBus.emit('ngAvailability', [{ version: undefined, prodMode: false }]);
    return;
  }
  setTimeout(() => checkForAngular(messageBus, attempt + 1), 500);
};

// Might be problematic if there are many directives with the same
// name on this node which is quite unlikely.
const serializeNodeDirectiveProperties = (node: ComponentTreeNode): DirectivesProperties => {
  const result: DirectivesProperties = {};
  node.directives.forEach(dir => {
    result[dir.name] = {
      props: serializeComponentState(dir.instance),
    };
  });
  if (node.component) {
    result[node.component.name] = {
      props: serializeComponentState(node.component.instance),
    };
  }
  return result;
};

const setupInspector = (messageBus: MessageBus<Events>) => {
  const onComponentEnter = (position: ElementPosition) => {
    messageBus.emit('highlightComponentInTreeFromElement', [position]);
  };
  const onComponentLeave = () => {
    messageBus.emit('removeHighlightFromComponentTree');
  };

  const inspectorOptions: ComponentInspectorOptions = { onComponentEnter, onComponentLeave };
  const inspector = new ComponentInspector(inspectorOptions);

  messageBus.on('inspectorStart', inspector.startInspecting);
  messageBus.on('inspectorEnd', inspector.stopInspecting);

  messageBus.on('highlightElementFromComponentTree', (position: ElementPosition) => {
    inspector.highlightByPosition(position);
  });
  messageBus.on('removeHighlightFromElement', unHighlight);
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
  return roots.map(node => {
    return {
      element: node.element,
      component: node.component
        ? {
            name: node.component.name,
            id: getDirectiveId(node.component.instance),
          }
        : null,
      directives: node.directives.map(d => ({ name: d.name, id: getDirectiveId(d.instance) })),
      children: prepareForestForSerialization(node.children),
    } as SerializableComponentTreeNode;
  });
};
