import { DirectiveForestObserver } from './observer';
import { ElementPosition, ProfilerFrame, ElementProfile, DirectiveProfile, LifecycleProfile } from 'protocol';
import { runOutsideAngular, isCustomElement } from '../utils';
import { getDirectiveName } from '../highlighter';
import { ComponentTreeNode } from '../component-tree';

let observer: DirectiveForestObserver;
let inProgress = false;
let inChangeDetection = false;
let eventMap: Map<any, DirectiveProfile>;
let frameDuration = 0;

export const start = (onFrame: (frame: ProfilerFrame) => void): void => {
  if (inProgress) {
    throw new Error('Recording already in progress');
  }
  eventMap = new Map<any, DirectiveProfile>();
  inProgress = true;
  let changeDetectionStart = 0;
  let lifecycleHookStart = 0;
  observer = new DirectiveForestObserver({
    // We flush here because it's possible the current node to overwrite
    // an existing removed node.
    onCreate(directive: any, node: Node, _: number, isComponent: boolean, position: ElementPosition): void {
      eventMap.set(directive, {
        isElement: isCustomElement(node),
        name: getDirectiveName(directive),
        isComponent,
        lifecycle: {},
      });
    },
    onChangeDetectionStart(component: any, node: Node): void {
      changeDetectionStart = performance.now();
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
          isElement: isCustomElement(node),
          name: getDirectiveName(component),
          isComponent: true,
          changeDetection: 0,
          lifecycle: {},
        });
      }
    },
    onChangeDetectionEnd(component: any, node: Node): void {
      const profile = eventMap.get(component);
      if (profile) {
        let current = profile.changeDetection;
        if (current === undefined) {
          current = 0;
        }
        const duration = performance.now() - changeDetectionStart;
        profile.changeDetection = current + duration;
        frameDuration += duration;
      } else {
        console.warn('Could not find profile for', component);
      }
    },
    onDestroy(directive: any, node: Node, _: number, isComponent: boolean, __: ElementPosition): void {
      // Make sure we reflect such directives in the report.
      if (!eventMap.has(directive)) {
        eventMap.set(directive, {
          isElement: isComponent && isCustomElement(node),
          name: getDirectiveName(directive),
          isComponent,
          lifecycle: {},
        });
      }
    },
    onLifecycleHookStart(directive: any, node: Node, _: number, isComponent: boolean): void {
      if (!eventMap.has(directive)) {
        eventMap.set(directive, {
          isElement: isCustomElement(node),
          name: getDirectiveName(directive),
          isComponent,
          lifecycle: {},
        });
      }
      lifecycleHookStart = performance.now();
    },
    onLifecycleHookEnd(directive: any, _: Node, __: number, ___: boolean, hook: keyof LifecycleProfile): void {
      const dir = eventMap.get(directive);
      if (!dir) {
        console.warn('Could not find directive in onLifecycleHook callback', directive, hook);
        return;
      }
      const duration = performance.now() - lifecycleHookStart;
      dir.lifecycle[hook] = (dir.lifecycle[hook] || 0) + duration;
      frameDuration += duration;
    },
  });
  observer.initialize();
};

export const stop = (): ProfilerFrame => {
  const result = flushBuffer(observer);
  // We want to garbage collect the records;
  observer.destroy();
  inProgress = false;
  return result;
};

const insertOrMerge = (lastFrame: ElementProfile, profile: DirectiveProfile) => {
  let exists = false;
  lastFrame.directives.forEach((d) => {
    if (d.name === profile.name) {
      exists = true;
      let current = d.changeDetection;
      if (current === undefined) {
        current = 0;
      }
      d.changeDetection = current + (profile.changeDetection ?? 0);
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
      console.warn('Unable to find parent node for', profile, original);
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

const prepareInitialFrame = (source: string, duration: number) => {
  const frame: ProfilerFrame = {
    source,
    duration,
    directives: [],
  };
  const directiveForest = observer.getDirectiveForest();
  const traverse = (node: ComponentTreeNode, children = frame.directives) => {
    let position: ElementPosition | undefined;
    if (node.component) {
      position = observer.getDirectivePosition(node.component.instance);
    } else {
      position = observer.getDirectivePosition(node.directives[0].instance);
    }
    if (position === undefined) {
      return;
    }
    const directives = node.directives.map((d) => {
      return {
        isComponent: false,
        isElement: false,
        name: getDirectiveName(d.instance),
        lifecycle: {},
      };
    });
    if (node.component) {
      directives.push({
        isElement: node.component.isElement,
        isComponent: true,
        lifecycle: {},
        name: getDirectiveName(node.component.instance),
      });
    }
    const result = {
      children: [],
      directives,
    };
    children[position[position.length - 1]] = result;
    node.children.forEach((n) => traverse(n, result.children));
  };
  directiveForest.forEach((n) => traverse(n));
  return frame;
};

const flushBuffer = (obs: DirectiveForestObserver, source: string = '') => {
  const items = Array.from(eventMap.keys());
  const positions: ElementPosition[] = [];
  const positionDirective = new Map<ElementPosition, any>();
  items.forEach((dir) => {
    const position = obs.getDirectivePosition(dir);
    if (position === undefined) {
      return;
    }
    positions.push(position);
    positionDirective.set(position, dir);
  });
  positions.sort(lexicographicOrder);

  const result = prepareInitialFrame(source, frameDuration);
  frameDuration = 0;

  positions.forEach((position) => {
    const dir = positionDirective.get(position);
    insertElementProfile(result.directives, position, eventMap.get(dir));
  });
  eventMap = new Map<any, DirectiveProfile>();
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
