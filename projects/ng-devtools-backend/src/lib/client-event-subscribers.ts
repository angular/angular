import { DirectiveID, DirectivesProperties, ElementID, Events, MessageBus } from 'protocol';
import { onChangeDetection } from './change-detection-tracker';
import {
  ComponentTreeNode,
  getDirectiveForest,
  getLatestComponentState,
  queryComponentTree,
  trimComponents,
} from './component-tree';
import { start as startProfiling, stop as stopProfiling } from './recording';
import { serializeComponentState } from './state-serializer';
import { ComponentInspector } from './component-inspector';

const inspector: ComponentInspector = new ComponentInspector();

const startInspecting = () => inspector.startInspecting();
const stopInspecting = () => inspector.stopInspecting();

export const subscribeToClientEvents = (messageBus: MessageBus<Events>): void => {
  onChangeDetection(() => messageBus.emit('componentTreeDirty'));

  messageBus.on('getLatestComponentExplorerView', query => {
    messageBus.emit('latestComponentExplorerView', [
      {
        forest: trimComponents(getDirectiveForest()),
        properties: getLatestComponentState(query),
      },
    ]);
  });

  messageBus.on('queryNgAvailability', () => checkForAngular(messageBus));

  messageBus.on('startProfiling', startProfiling);
  messageBus.on('stopProfiling', () => {
    messageBus.emit('profilerResults', [stopProfiling()]);
  });

  messageBus.on('inspectorStart', startInspecting);
  messageBus.on('inspectorEnd', stopInspecting);

  messageBus.on('getElementDirectivesProperties', (id: ElementID) => {
    const node = queryComponentTree(id);
    if (node) {
      messageBus.emit('elementDirectivesProperties', [serializeNodeDirectiveProperties(node)]);
    } else {
      messageBus.emit('elementDirectivesProperties', [{}]);
    }
  });

  messageBus.on('getNestedProperties', (id: DirectiveID, propPath: string[]) => {
    const node = queryComponentTree(id.element);
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
  });
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
