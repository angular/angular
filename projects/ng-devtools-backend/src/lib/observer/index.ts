import { ComponentTreeObserver } from './observer';
import { ElementPosition, ProfilerFrame, ElementProfile, DirectiveProfile, LifecycleProfile } from 'protocol';
import { runOutsideAngular, isCustomElement } from '../utils';
import { getComponentName } from '../highlighter';
import { InsertionTrie } from './insertion-trie';
import { ComponentTreeNode } from '../component-tree';

let observer: ComponentTreeObserver;
let inProgress = false;
let inChangeDetection = false;
let eventMap: Map<any, DirectiveProfile>;
let insertionTrie: InsertionTrie;
let removedComponents: Map<any, ElementPosition>;

export const start = (onFrame: (frame: ProfilerFrame) => void): void => {
  if (inProgress) {
    throw new Error('Recording already in progress');
  }
  removedComponents = new Map();
  insertionTrie = new InsertionTrie();
  eventMap = new Map<any, DirectiveProfile>();
  inProgress = true;
  observer = new ComponentTreeObserver({
    // We flush here because it's possible the current node to overwrite
    // an existing removed node.
    onCreate(directive: any, node: Node, id: number, isComponent: boolean, position: ElementPosition): void {
      eventMap.set(directive, {
        name: getComponentName(directive),
        isElement: isCustomElement(node),
        isComponent,
        changeDetection: 0,
        lifecycle: {},
      });
      insertionTrie.insert(position);
    },
    onChangeDetection(component: any, node: Node, id: number, position: ElementPosition, duration: number): void {
      if (!inChangeDetection) {
        inChangeDetection = true;
        const source = getChangeDetectionSource();
        runOutsideAngular(() => {
          setTimeout(() => {
            inChangeDetection = false;
            onFrame(flushBuffer(observer, source));
          });
        });
      }
      if (!eventMap.has(component)) {
        eventMap.set(component, {
          name: getComponentName(component),
          isElement: isCustomElement(node),
          isComponent: true,
          changeDetection: 0,
          lifecycle: {},
        });
      }
      const profile = eventMap.get(component);
      profile.changeDetection += duration;
    },
    onDestroy(directive: any, id: number, isComponent: boolean, position: ElementPosition): void {
      if (isComponent) {
        removedComponents.set(directive, position);
      }
    },
    onLifecycleHook(
      directive: any,
      node: Node,
      id: number,
      isComponent: boolean,
      hook: keyof LifecycleProfile,
      duration: number
    ): void {
      if (!eventMap.has(directive)) {
        eventMap.set(directive, {
          name: getComponentName(directive),
          isElement: isCustomElement(node),
          isComponent: true,
          changeDetection: 0,
          lifecycle: {},
        });
      }
      eventMap.get(directive).lifecycle[hook] = eventMap.get(directive).lifecycle[hook] || 0;
      eventMap.get(directive).lifecycle[hook] += duration;
    },
  });
  observer.initialize();
};

export const stop = (): ProfilerFrame => {
  const result = flushBuffer(observer);
  // We want to garbage collect the records;
  observer.destroy();
  inProgress = false;
  removedComponents = new Map();
  insertionTrie = new InsertionTrie();
  return result;
};

const insertOrMerge = (lastFrame: ElementProfile, profile: DirectiveProfile) => {
  let exists = false;
  lastFrame.directives.forEach(d => {
    if (d.name === profile.name) {
      exists = true;
      d.changeDetection += profile.changeDetection;
      for (const key of Object.keys(profile.lifecycle)) {
        if (!d.lifecycle[key]) {
          d.lifecycle[key] = 0;
        }
        d.lifecycle[key] += profile.lifecycle[key];
      }
    }
  });
  if (!exists) {
    lastFrame.directives.push(profile);
  }
};

const insertElementProfile = (frames: ElementProfile[], position: ElementPosition, profile?: DirectiveProfile) => {
  if (!profile) {
    return;
  }
  const original = frames;
  for (let i = 0; i < position.length - 1; i++) {
    const pos = position[i];
    if (!frames[pos]) {
      // TODO(mgechev): consider how to ensure we don't hit this case
      console.warn('Unable to find parent node for', original);
      return;
    }
    frames = frames[pos].children;
  }
  const lastIdx = position[position.length - 1];
  let lastFrame: ElementProfile = {
    children: [],
    directives: [],
  };
  if (frames[lastIdx]) {
    lastFrame = frames[lastIdx];
  } else {
    frames[lastIdx] = lastFrame;
  }
  insertOrMerge(lastFrame, profile);
};

const insertElementProfileAtEnd = (frames: ElementProfile[], position: ElementPosition, profile?: DirectiveProfile) => {
  if (!profile) {
    return;
  }
  for (let i = 0; i < position.length - 1; i++) {
    const pos = position[i];
    if (!frames[pos]) {
      // TODO(mgechev): consider how to ensure we don't hit this case
      console.warn('Unable to find parent node for', frames);
      return;
    }
    frames = frames[pos].children;
  }
  const lastFrame: ElementProfile = {
    children: [],
    directives: [],
  };
  frames.push(lastFrame);
  insertOrMerge(lastFrame, profile);
};

const prepareInitialFrame = (source: string) => {
  const frame: ProfilerFrame = {
    source,
    directives: [],
  };
  const directiveForest = observer.getDirectiveForest();
  const traverse = (node: ComponentTreeNode, children = frame.directives) => {
    let position: ElementPosition;
    if (node.component) {
      position = observer.getDirectivePosition(node.component.instance);
    } else {
      position = observer.getDirectivePosition(node.directives[0].instance);
    }
    const directives = node.directives.map(d => {
      return {
        isComponent: false,
        isElement: false,
        name: d.instance.constructor.name,
        lifecycle: {},
        changeDetection: 0,
      };
    });
    if (node.component) {
      directives.push({
        changeDetection: 0,
        isElement: node.component.isElement,
        isComponent: true,
        lifecycle: {},
        name: node.component.instance.constructor.name,
      });
    }
    const result = {
      children: [],
      directives,
    };
    children[position[position.length - 1]] = result;
    node.children.forEach(n => traverse(n, result.children));
  };
  directiveForest.forEach(n => traverse(n));
  return frame;
};

const flushBuffer = (obs: ComponentTreeObserver, source: string = '') => {
  const items = Array.from(eventMap.keys());
  const positions: ElementPosition[] = [];
  const positionDirective = new Map<ElementPosition, any>();
  items.forEach(dir => {
    const position = obs.getDirectivePosition(dir);
    positions.push(position);
    positionDirective.set(position, dir);
  });
  positions.sort(lexicographicOrder);
  const result = prepareInitialFrame(source);
  positions.forEach(position => {
    const dir = positionDirective.get(position);
    if (removedComponents.has(dir) && insertionTrie.exists(removedComponents.get(dir))) {
      console.warn('Trying to add a removed directive on the place of an existing new one.');
      return;
    }
    insertElementProfile(result.directives, position, eventMap.get(dir));
  });

  for (const cmp of removedComponents.keys()) {
    insertElementProfileAtEnd(result.directives, removedComponents.get(cmp), eventMap.get(cmp));
  }

  eventMap = new Map<any, DirectiveProfile>();
  removedComponents = new Map();
  return result;
};

const getChangeDetectionSource = () => {
  const zone = (window as any).Zone;
  if (!zone || !zone.currentTask) {
    return '';
  }
  return zone.currentTask.source;
};

const lexicographicOrder = (a: ElementPosition, b: ElementPosition) => {
  if (a.length < b.length) {
    return -1;
  }
  if (a.length > b.length) {
    return 1;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] < b[i]) {
      return -1;
    }
    if (a[i] > b[i]) {
      return 1;
    }
  }
  return 0;
};
