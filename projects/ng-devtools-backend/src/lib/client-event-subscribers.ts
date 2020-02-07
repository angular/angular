import { DirectiveID, DirectivesProperties, ElementID, Events, MessageBus } from 'protocol';
import { onChangeDetection } from './change-detection-tracker';
import {
  ComponentTreeNode,
  getDirectiveForest,
  getLatestComponentState,
  queryComponentForest,
  prepareForestForSerialization,
} from './component-tree';
import { start as startProfiling, stop as stopProfiling } from './recording';
import { serializeComponentState } from './state-serializer';
import { ComponentInspector, ComponentInspectorOptions } from './component-inspector';
import { setConsoleReference } from './selected-component';
import { unHighlight } from './highlighter';
import {
  getAngularVersion,
  appIsAngularInProdMode,
  appIsAngularInDevMode,
  appIsSupportedAngularVersion,
} from './angular-check';

export const subscribeToClientEvents = (messageBus: MessageBus<Events>): void => {
  messageBus.on('getLatestComponentExplorerView', getLatestComponentExplorerViewCallback(messageBus));

  messageBus.on('queryNgAvailability', checkForAngularCallback(messageBus));

  messageBus.on('startProfiling', startProfiling);
  messageBus.on('stopProfiling', stopProfilingCallback(messageBus));

  messageBus.on('getElementDirectivesProperties', getElementDirectivesPropertiesCallback(messageBus));

  messageBus.on('setSelectedComponent', selectedComponentCallback);

  messageBus.on('getNestedProperties', getNestedPropertiesCallback(messageBus));

  setupInspector(messageBus);

  initChangeDetection(messageBus);
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
      forest: prepareForestForSerialization(getDirectiveForest()),
      properties: getLatestComponentState(query),
    },
  ]);
};

const checkForAngularCallback = (messageBus: MessageBus<Events>) => () => checkForAngular(messageBus);

const stopProfilingCallback = (messageBus: MessageBus<Events>) => () => {
  messageBus.emit('profilerResults', [stopProfiling()]);
};

const getElementDirectivesPropertiesCallback = (messageBus: MessageBus<Events>) => (id: ElementID) => {
  const node = queryComponentForest(id, getDirectiveForest());
  if (node) {
    messageBus.emit('elementDirectivesProperties', [serializeNodeDirectiveProperties(node)]);
  } else {
    messageBus.emit('elementDirectivesProperties', [{}]);
  }
};

const selectedComponentCallback = (id: ElementID) => {
  const node = queryComponentForest(id, getDirectiveForest());
  setConsoleReference(node);
};

const getNestedPropertiesCallback = (messageBus: MessageBus<Events>) => (id: DirectiveID, propPath: string[]) => {
  const node = queryComponentForest(id.element, getDirectiveForest());
  if (node) {
    let current = (id.directive === undefined ? node.component : node.directives[id.directive]).instance;
    for (const prop of propPath) {
      current = current[prop];
      if (!current) {
        console.error('Cannot access the properties', propPath, 'of', node);
      }
    }
    messageBus.emit('nestedProperties', [id, { props: serializeComponentState(current) }, propPath]);
  } else {
    messageBus.emit('nestedProperties', [id, { props: {} }, propPath]);
  }
};

//
// Subscribe Helpers
//

const checkForAngular = (messageBus: MessageBus<Events>, attempt = 0): void => {
  const ngVersion = getAngularVersion();
  const hasAngular = !!ngVersion;
  if (hasAngular) {
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
  const onComponentEnter = (id: ElementID) => {
    messageBus.emit('highlightComponentInTreeFromElement', [id]);
  };
  const onComponentLeave = () => {
    messageBus.emit('removeHighlightFromComponentTree');
  };

  const inspectorOptions: ComponentInspectorOptions = { onComponentEnter, onComponentLeave };
  const inspector = new ComponentInspector(inspectorOptions);

  messageBus.on('inspectorStart', inspector.startInspecting);
  messageBus.on('inspectorEnd', inspector.stopInspecting);

  messageBus.on('highlightElementFromComponentTree', (id: ElementID) => {
    inspector.highlightById(id);
  });
  messageBus.on('removeHighlightFromElement', unHighlight);
};
