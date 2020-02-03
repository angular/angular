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
import { ComponentInspector } from './component-inspector';
import { setConsoleReference } from './selected-component';

const inspector = new ComponentInspector();

const startInspecting = () => inspector.startInspecting();
const stopInspecting = () => inspector.stopInspecting();

export const subscribeToClientEvents = (messageBus: MessageBus<Events>): void => {
  onChangeDetection(() => messageBus.emit('componentTreeDirty'));

  messageBus.on('getLatestComponentExplorerView', getLatestComponentExplorerViewCallback(messageBus));

  messageBus.on('queryNgAvailability', checkForAngularCallback(messageBus));

  messageBus.on('startProfiling', startProfiling);
  messageBus.on('stopProfiling', stopProfilingCallback(messageBus));

  messageBus.on('inspectorStart', startInspecting);
  messageBus.on('inspectorEnd', stopInspecting);

  messageBus.on('getElementDirectivesProperties', getElementDirectivesPropertiesCallback(messageBus));

  messageBus.on('setSelectedComponent', selectedComponentCallback);

  messageBus.on('getNestedProperties', getNestedPropertiesCallback(messageBus));
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

const getAngularVersion = (): string | null | boolean => {
  const el = document.querySelector('[ng-version]');
  if (!el) {
    return false;
  }
  return el.getAttribute('ng-version');
};

const checkForAngular = (messageBus: MessageBus<Events>, attempt = 0): void => {
  const ngVersion = getAngularVersion();
  const hasAngular = !!ngVersion;
  if (hasAngular) {
    messageBus.emit('ngAvailability', [{ version: ngVersion.toString() }]);
    return;
  }
  if (attempt > 10) {
    messageBus.emit('ngAvailability', [{ version: undefined }]);
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
