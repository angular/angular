/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {getDirectiveName} from '../highlighter';
import {isCustomElement, runOutsideAngular} from '../utils';
import {initializeOrGetDirectiveForestHooks} from '.';
let inProgress = false;
let inChangeDetection = false;
let eventMap;
let frameDuration = 0;
let hooks = {};
export const start = (onFrame) => {
  if (inProgress) {
    throw new Error('Recording already in progress');
  }
  eventMap = new Map();
  inProgress = true;
  hooks = getHooks(onFrame);
  initializeOrGetDirectiveForestHooks().profiler.subscribe(hooks);
};
export const stop = () => {
  const directiveForestHooks = initializeOrGetDirectiveForestHooks();
  const result = flushBuffer(directiveForestHooks);
  initializeOrGetDirectiveForestHooks().profiler.unsubscribe(hooks);
  hooks = {};
  inProgress = false;
  return result;
};
const startEvent = (map, directive, label) => {
  const name = getDirectiveName(directive);
  const key = `${name}#${label}`;
  map[key] = performance.now();
};
const getEventStart = (map, directive, label) => {
  const name = getDirectiveName(directive);
  const key = `${name}#${label}`;
  return map[key];
};
const getHooks = (onFrame) => {
  const timeStartMap = {};
  return {
    // We flush here because it's possible the current node to overwrite
    // an existing removed node.
    onCreate(directive, node, _, isComponent, position) {
      eventMap.set(directive, {
        isElement: isCustomElement(node),
        name: getDirectiveName(directive),
        isComponent,
        lifecycle: {},
        outputs: {},
      });
    },
    onChangeDetectionStart(component, node) {
      startEvent(timeStartMap, component, 'changeDetection');
      if (!inChangeDetection) {
        inChangeDetection = true;
        const source = getChangeDetectionSource();
        runOutsideAngular(() => {
          Promise.resolve().then(() => {
            inChangeDetection = false;
            onFrame(flushBuffer(initializeOrGetDirectiveForestHooks(), source));
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
          outputs: {},
        });
      }
    },
    onChangeDetectionEnd(component) {
      const profile = eventMap.get(component);
      if (profile) {
        let current = profile.changeDetection;
        if (current === undefined) {
          current = 0;
        }
        const startTimestamp = getEventStart(timeStartMap, component, 'changeDetection');
        if (startTimestamp === undefined) {
          return;
        }
        const duration = performance.now() - startTimestamp;
        profile.changeDetection = current + duration;
        frameDuration += duration;
      } else {
        console.warn('Could not find profile for', component);
      }
    },
    onDestroy(directive, node, _, isComponent, __) {
      // Make sure we reflect such directives in the report.
      if (!eventMap.has(directive)) {
        eventMap.set(directive, {
          isElement: isComponent && isCustomElement(node),
          name: getDirectiveName(directive),
          isComponent,
          lifecycle: {},
          outputs: {},
        });
      }
    },
    onLifecycleHookStart(directive, hookName, node, __, isComponent) {
      startEvent(timeStartMap, directive, hookName);
      if (!eventMap.has(directive)) {
        eventMap.set(directive, {
          isElement: isCustomElement(node),
          name: getDirectiveName(directive),
          isComponent,
          lifecycle: {},
          outputs: {},
        });
      }
    },
    onLifecycleHookEnd(directive, hookName, _, __, ___) {
      const dir = eventMap.get(directive);
      const startTimestamp = getEventStart(timeStartMap, directive, hookName);
      if (startTimestamp === undefined) {
        return;
      }
      if (!dir) {
        console.warn('Could not find directive in onLifecycleHook callback', directive, hookName);
        return;
      }
      const duration = performance.now() - startTimestamp;
      dir.lifecycle[hookName] = (dir.lifecycle[hookName] || 0) + duration;
      frameDuration += duration;
    },
    onOutputStart(componentOrDirective, outputName, node, isComponent) {
      startEvent(timeStartMap, componentOrDirective, outputName);
      if (!eventMap.has(componentOrDirective)) {
        eventMap.set(componentOrDirective, {
          isElement: isCustomElement(node),
          name: getDirectiveName(componentOrDirective),
          isComponent,
          lifecycle: {},
          outputs: {},
        });
      }
    },
    onOutputEnd(componentOrDirective, outputName) {
      const name = outputName;
      const entry = eventMap.get(componentOrDirective);
      const startTimestamp = getEventStart(timeStartMap, componentOrDirective, name);
      if (startTimestamp === undefined) {
        return;
      }
      if (!entry) {
        console.warn(
          'Could not find directive or component in onOutputEnd callback',
          componentOrDirective,
          outputName,
        );
        return;
      }
      const duration = performance.now() - startTimestamp;
      entry.outputs[name] = (entry.outputs[name] || 0) + duration;
      frameDuration += duration;
    },
  };
};
const insertOrMerge = (lastFrame, profile) => {
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
      for (const key of Object.keys(profile.outputs)) {
        if (!d.outputs[key]) {
          d.outputs[key] = 0;
        }
        d.outputs[key] += profile.outputs[key];
      }
    }
  });
  if (!exists) {
    lastFrame.directives.push(profile);
  }
};
const insertElementProfile = (frames, position, profile) => {
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
  let lastFrame = {
    children: [],
    directives: [],
    type: 'element',
  };
  if (frames[lastIdx]) {
    lastFrame = frames[lastIdx];
  } else {
    frames[lastIdx] = lastFrame;
  }
  insertOrMerge(lastFrame, profile);
};
const prepareInitialFrame = (source, duration) => {
  const frame = {
    source,
    duration,
    directives: [],
  };
  const directiveForestHooks = initializeOrGetDirectiveForestHooks();
  const directiveForest = directiveForestHooks.getIndexedDirectiveForest();
  const traverse = (node, children = frame.directives) => {
    let position;
    if (node.component) {
      position = directiveForestHooks.getDirectivePosition(node.component.instance);
    } else if (node.directives[0]) {
      position = directiveForestHooks.getDirectivePosition(node.directives[0].instance);
    } else if (node.defer) {
      position = directiveForestHooks.getDirectivePosition(node.defer);
    }
    if (position === undefined) {
      return;
    }
    const directives = node.directives.map((d) => {
      return {
        isComponent: false,
        isElement: false,
        name: getDirectiveName(d.instance),
        outputs: {},
        lifecycle: {},
      };
    });
    if (node.component) {
      directives.push({
        isElement: node.component.isElement,
        isComponent: true,
        lifecycle: {},
        outputs: {},
        name: getDirectiveName(node.component.instance),
      });
    }
    const result = {
      children: [],
      directives,
      type: node.defer ? 'defer' : 'element',
    };
    children[position[position.length - 1]] = result;
    node.children.forEach((n) => traverse(n, result.children));
  };
  directiveForest.forEach((n) => traverse(n));
  return frame;
};
const flushBuffer = (directiveForestHooks, source = '') => {
  const items = Array.from(eventMap.keys());
  const positions = [];
  const positionDirective = new Map();
  items.forEach((dir) => {
    const position = directiveForestHooks.getDirectivePosition(dir);
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
  eventMap = new Map();
  return result;
};
const getChangeDetectionSource = () => {
  const zone = window.Zone;
  if (!zone || !zone.currentTask) {
    return '';
  }
  return zone.currentTask.source;
};
const lexicographicOrder = (a, b) => {
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
//# sourceMappingURL=capture.js.map
